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
      description: z.string().max(2000).optional(),
    })
    .optional()
    .nullable(),
  sessionId: z.string().optional().nullable(),
  module: z.string().optional().nullable(),
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

    const {
      message,
      persona,
      sessionId: clientSessionId,
      module: moduleName,
    } = parsed.data;

    await dbConnect();

    let sessionId = clientSessionId;
    if (!sessionId) {
      sessionId = await ChatService.createSession(userId, persona || null);
    } else {
      const existingSession = await ChatSession.findById(sessionId);
      if (existingSession && existingSession.status === "completed") {
        return NextResponse.json(
          { error: "This session has been completed and is now read-only." },
          { status: 403 }
        );
      }
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

    // 3. Save User Message FIRST — before any AI call that might throw
    await ChatService.saveMessage(userId, {
      sessionId,
      content: message,
      sender: "user",
      emotion,
    });

    // 4. Gemini Response Generation
    let aiResponseContent = "";
    if (hasCrisis) {
      aiResponseContent =
        "I am noticing some very difficult feelings here. I am an AI and cannot provide crisis support. Please contact the National Suicide Prevention Lifeline at 988 immediately.";
    } else {
      const systemPrompt = `You are an empathetic, clinical-grade AI therapy assistant. 
${moduleName ? `The user is currently engaging with the "${moduleName}" module. Tailor your empathy and guidance toward this focus.` : ""}
Persona guidelines: ${persona?.description || "Calm, gentle, supportive, and reflective."}
The user's detected emotional state right now is: ${emotion}.
Respond warmly, briefly (2-3 sentences max), and safely. Validate their emotion. Do not give medical advice or diagnoses.`;

      try {
        try {
          const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemPrompt,
          });
          const result = await model.generateContent(message);
          aiResponseContent = result.response.text();
        } catch (e) {
          console.warn("gemini-2.5-flash failed, falling back to gemini-2.0-flash", e);
          const fallbackModel = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: systemPrompt,
          });
          const result = await fallbackModel.generateContent(message);
          aiResponseContent = result.response.text();
        }
      } catch (aiErr) {
        console.error("All Gemini models failed:", aiErr);
        aiResponseContent = "I hear you, and I\'m here with you. Could you tell me a little more about what you\'re experiencing right now?";
      }
    }

    // 5. Save AI Response
    await ChatService.saveMessage(userId, {
      sessionId,
      content: aiResponseContent,
      sender: "ai",
    });

    // 6. Update Session metrics (Total duration from start of session)
    const sessionDoc = await ChatSession.findById(sessionId);
    const totalDurationMs =
      Date.now() - new Date(sessionDoc.createdAt).getTime();

    await ChatSession.findByIdAndUpdate(sessionId, {
      durationMs: totalDurationMs,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      response: aiResponseContent,
      emotion,
      sessionId,
      isCrisis: hasCrisis,
      latencyMs: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
