import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { HfInference } from "@huggingface/inference";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatService } from "@/backend/services/chat.service";
import { detectCrisisKeywords } from "@/lib/mock/crisis-detection";
import { enforceRateLimit } from "@/utils/rate-limit";
import { logAuditAction } from "@/services/audit.service";
import dbConnect from "@/lib/mongodb";
import ChatSession from "@/models/ChatSession";
import { z } from "zod";

const ChatInputSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message too long"),
  persona: z
    .object({
      description: z.string().max(500).optional(),
    })
    .optional()
    .nullable(),
  sessionId: z.string().optional().nullable(),
});

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY!);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Implement Rate Limiting (15 requests per minute)
    const rateLimitError = enforceRateLimit(req, 15, 60000);
    if (rateLimitError) return rateLimitError;

    const userId = (session.user as any).id;
    const bodyRaw = await req.json();

    const parsed = ChatInputSchema.safeParse(bodyRaw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { message, persona, sessionId: clientSessionId } = parsed.data;

    await dbConnect();

    let sessionId = clientSessionId;
    if (!sessionId) {
      sessionId = await ChatService.createSession(userId, persona || null);
    }

    // 1. Safety Check (Immediate execution)
    const hasCrisis = detectCrisisKeywords(message);
    if (hasCrisis) {
      await logAuditAction(userId, "CRISIS_ESCALATION", {
        sessionId,
        flagged_message_length: message.length,
      });
    }

    // 2. Emotion Detection via HF Inference
    let emotion = "neutral";
    try {
      const hfResponse = await hf.textClassification({
        model: "SamLowe/roberta-base-go_emotions",
        inputs: message,
      });
      if (hfResponse && hfResponse.length > 0) {
        emotion = hfResponse[0].label;
      }
    } catch (e) {
      console.warn("HF Emotion detection failed, defaulting to neutral", e);
    }

    // 3. Save User Message immediately
    await ChatService.saveMessage(userId, {
      sessionId,
      content: message,
      sender: "user",
      emotion,
    });

    // 4. Groq LLM Response Generation Setup
    let aiResponseContent = "";
    if (hasCrisis) {
      aiResponseContent =
        "I am noticing some very difficult feelings here. I am an AI and cannot provide crisis support. Please contact the National Suicide Prevention Lifeline at 988 immediately.";
    } else {
      const systemPrompt = `You are an empathetic, clinical-grade AI therapy assistant. 
Persona guidelines: ${persona?.description || "Calm, gentle, supportive, and reflective."}
The user's detected emotional state right now is: ${emotion}.
Respond warmly, briefly (2-3 sentences max), and safely. Validate their emotion. Do not give medical advice or diagnoses.`;

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash", // Fixed typo in previous version (2.5 -> 1.5)
        systemInstruction: systemPrompt,
      });

      console.log("Generating AI response with Gemini...");
      const result = await model.generateContent(message);
      aiResponseContent = result.response.text();
      console.log("AI Response generated:", aiResponseContent.substring(0, 50) + "...");
    }

    // 5. Save AI Response
    console.log("Saving AI response to DB...");
    await ChatService.saveMessage(userId, {
      sessionId,
      content: aiResponseContent,
      sender: "ai",
    });
    console.log("AI response saved successfully.");

    // 6. Calculate Latency & Update Session metrics
    const durationMs = Date.now() - startTime;
    await ChatSession.findByIdAndUpdate(sessionId, {
      durationMs,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      response: aiResponseContent,
      emotion,
      sessionId,
      isCrisis: hasCrisis,
      latencyMs: durationMs,
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
