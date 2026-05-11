import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { enforceRateLimit } from "@/utils/rate-limit";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitError = enforceRateLimit(req, 15, 60000);
    if (rateLimitError) return rateLimitError;

    const body = await req.json();
    const { message, moduleSlug, stageTitle, stageDescription, history } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const systemPrompt = `You are a specialized clinical AI therapy assistant guiding a user through a mental health module.
Current Module: ${moduleSlug}
Current Stage: ${stageTitle}
Stage Goal/Description: ${stageDescription}

Your objective is two-fold:
1. Provide an empathetic, guiding response to the user's latest message (max 3 sentences). Encourage them to dive deeper if they haven't met the stage's goal.
2. Evaluate if the user has demonstrated sufficient reflection, understanding, or progress to complete this specific stage based on their conversation history and latest message.

If the user gives a generic, short, or dismissive response, DO NOT mark the stage as complete. Gently prompt them to elaborate. Only mark as complete when they have genuinely engaged with the prompt.

You MUST respond strictly in valid JSON format with this exact structure:
{
  "reply": "your empathetic response here",
  "isComplete": true_or_false
}`;

    const conversationContext = history
      .map((h: any) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`)
      .join("\n");

    const prompt = `Conversation History:\n${conversationContext}\n\nUser's latest message: ${message}\n\nPlease provide your response in JSON format according to the system instructions.`;

    let aiResponseText = "";
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: systemPrompt,
      });
      const result = await model.generateContent(prompt);
      aiResponseText = result.response.text();
    } catch (e) {
      console.warn("gemini-2.5-flash failed, falling back to gemini-1.5-flash", e);
      const fallbackModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemPrompt,
      });
      const result = await fallbackModel.generateContent(prompt);
      aiResponseText = result.response.text();
    }

    // Parse the JSON
    let parsedResponse;
    try {
      const cleanJson = aiResponseText.replace(/```json|```/g, "").trim();
      parsedResponse = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Failed to parse AI JSON response:", aiResponseText);
      // Fallback
      parsedResponse = {
        reply: "Thank you for sharing. Could you elaborate a bit more on how that makes you feel in the context of this module?",
        isComplete: false,
      };
    }

    return NextResponse.json(parsedResponse);
  } catch (error: any) {
    console.error("Modules Chat API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
