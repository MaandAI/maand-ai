import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { getLegacyProfile } from "@/services/legacy.service";
import { logAuditAction } from "@/services/audit.service";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const token =
      req.cookies.get("token")?.value || req.cookies.get("__session")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    const { profileId, message } = await req.json();

    if (!profileId || !message) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    // 1. Fetch Profile & Enforce Ethics/Expiry
    const profile = await getLegacyProfile(userId, profileId);

    if (!profile || profile.status !== "active") {
      return NextResponse.json(
        { error: "Profile not found or inactive." },
        { status: 404 },
      );
    }

    if (new Date(profile.expiresAt) < new Date()) {
      return NextResponse.json(
        {
          error:
            "This legacy profile has expired per the creator's instructions.",
        },
        { status: 403 },
      );
    }

    // 2. Build Ethical/Stylistic System Prompt
    const systemPrompt = `You are a digital legacy text-persona reflecting the traits of ${profile.name} (${profile.relationship}). 
Traits: ${profile.personalityTraits.join(", ")}.
Allowed Topics: ${profile.allowedTopics.join(", ")}.

ETHICS DIRECTIVE: You MUST ONLY discuss the Allowed Topics. If the user asks about anything outside of these topics, politely decline to answer, citing that it is outside your configured boundaries. You are an AI reflection, not a real person. Do not offer medical, legal, or financial advice. Keep responses brief.`;

    // 3. Query LLM
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(message);
    const aiResponseContent = result.response.text();

    // 4. Audit logging of interaction
    await logAuditAction(userId, "LEGACY_INTERACTION", {
      profileId,
      topic_bounded: true,
    });

    return NextResponse.json({
      response: aiResponseContent,
      systemMode: "Digital Legacy",
    });
  } catch (error: any) {
    console.error("Legacy Chat Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
