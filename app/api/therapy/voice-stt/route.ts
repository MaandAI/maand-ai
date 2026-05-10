import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is missing. Groq provides a FREE, lightning-fast Whisper API. Get your key at console.groq.com and add it to .env.local" },
        { status: 500 }
      );
    }

    // Convert Blob to File object for Groq API
    const file = new File([audioFile], "audio.webm", { type: "audio/webm" });
    const groqFormData = new FormData();
    groqFormData.append("file", file);
    groqFormData.append("model", "whisper-large-v3-turbo");

    // Use Groq Whisper API (Free & Blazing Fast)
    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      method: "POST",
      body: groqFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Groq Whisper Error: ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();
    const transcript = result.text || "";

    return NextResponse.json({ transcript });
  } catch (error: any) {
    console.error("[VOICE_STT_ERROR]", error);
    return NextResponse.json(
      { error: error.message, details: error.stack },
      { status: 500 }
    );
  }
}
