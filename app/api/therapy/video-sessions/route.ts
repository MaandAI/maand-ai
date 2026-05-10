import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/backend/middlewares/auth.middleware";
import dbConnect from "@/lib/mongodb";
import VideoSession from "@/models/VideoSession";
import { getPersona } from "@/lib/therapist-personas";

// GET /api/therapy/video-sessions — list user's sessions
export async function GET(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    await dbConnect();
    const sessions = await VideoSession.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    return NextResponse.json({ success: true, data: sessions });
  });
}

// POST /api/therapy/video-sessions — create a new session
export async function POST(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      await dbConnect();
      let therapistId = "ava";
      try {
        const body = await req.json();
        therapistId = body.therapistId || "ava";
      } catch { /* empty body ok */ }

      const persona = getPersona(therapistId);
      const session = await VideoSession.create({
        userId: user.id,
        therapistId,
        therapistName: persona.name,
        status: "active",
        transcript: [],
        gestureInsights: [],
        emotionalJourney: [],
      });

      return NextResponse.json({ success: true, data: session }, { status: 201 });
    } catch (err: any) {
      console.error("[VideoSession CREATE]", err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  });
}
