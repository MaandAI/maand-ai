import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId = "pNInz6obpgDQGcFmaJcg" } = await req.json(); // Default to Adam/Rachel or similar

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: "ELEVENLABS_API_KEY is missing. Please add it to your .env.local file to enable premium TTS." },
        { status: 500 }
      );
    }

    // Use ElevenLabs API (Production-Grade TTS)
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`ElevenLabs Error: ${errorData.detail?.message || response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error: any) {
    console.error("[VOICE_TTS_ERROR]", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
