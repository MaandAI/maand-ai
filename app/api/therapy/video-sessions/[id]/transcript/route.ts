import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/backend/middlewares/auth.middleware";
import dbConnect from "@/lib/mongodb";
import VideoSession from "@/models/VideoSession";

// POST /api/therapy/video-sessions/[id]/transcript
// Appends a new entry to the transcript
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async (req, user) => {
    try {
      await dbConnect();
      const { id } = await context.params;
      const { speaker, text, emotion, gestureInsight } = await req.json();

      const update: any = {
        $push: { transcript: { speaker, text, emotion, timestamp: new Date() } },
      };

      if (gestureInsight) {
        update.$push.gestureInsights = {
          gesture: gestureInsight.gesture,
          meaning: gestureInsight.meaning,
          timestamp: new Date(),
        };
        update.$addToSet = { emotionalJourney: gestureInsight.meaning };
      }

      if (emotion && emotion !== "neutral") {
        if (!update.$addToSet) update.$addToSet = {};
        update.$addToSet.emotionalJourney = emotion;
      }

      await VideoSession.findOneAndUpdate({ _id: id, userId: user.id }, update);
      return NextResponse.json({ success: true });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  });
}
