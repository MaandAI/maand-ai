import { NextRequest, NextResponse } from "next/server";

// Mapping of our local therapist IDs to user's Tavus credentials
const TAVUS_CONFIG: Record<string, { replicaId: string; personaId: string }> = {
  ava: {
    replicaId: process.env.TAVUS_AVA_REPLICA_ID || "placeholder_ava_replica",
    personaId: process.env.TAVUS_AVA_PERSONA_ID || "placeholder_ava_persona",
  },
  ethan: {
    replicaId: process.env.TAVUS_ETHAN_REPLICA_ID || "placeholder_ethan_replica",
    personaId: process.env.TAVUS_ETHAN_PERSONA_ID || "placeholder_ethan_persona",
  },
  maya: {
    replicaId: process.env.TAVUS_MAYA_REPLICA_ID || "placeholder_maya_replica",
    personaId: process.env.TAVUS_MAYA_PERSONA_ID || "placeholder_maya_persona",
  },
};

export async function POST(req: NextRequest) {
  try {
    const { therapistId = "ava", customContext } = await req.json();

    if (!process.env.TAVUS_API_KEY) {
      return NextResponse.json(
        { error: "TAVUS_API_KEY is missing in .env.local" },
        { status: 500 }
      );
    }

    const config = TAVUS_CONFIG[therapistId as keyof typeof TAVUS_CONFIG] || TAVUS_CONFIG.ava;

    // Call Tavus API to create a new conversational video session
    const response = await fetch("https://tavusapi.com/v2/conversations", {
      method: "POST",
      headers: {
        "x-api-key": process.env.TAVUS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        replica_id: config.replicaId,
        persona_id: config.personaId,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Tavus API Error:", err);
      throw new Error(`Tavus Error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[TAVUS_SESSION_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
