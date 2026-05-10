import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/backend/middlewares/auth.middleware";
import dbConnect from "@/lib/mongodb";
import VideoSession from "@/models/VideoSession";
import Report from "@/models/Report";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cloudinary from "@/lib/cloudinary";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// POST /api/therapy/video-sessions/[id]/end
// Ends the session, generates notes + summary via Gemini, saves to DB
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async (req, user) => {
    try {
      await dbConnect();
      const { id } = await context.params;

      const session = await VideoSession.findOne({ _id: id, userId: user.id });
      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      const endedAt = new Date();
      const durationSeconds = Math.floor(
        (endedAt.getTime() - new Date(session.startedAt).getTime()) / 1000
      );

      // Build transcript text for analysis
      const transcriptText = session.transcript
        .map((e: any) => `${e.speaker === "user" ? "Client" : session.therapistName}: ${e.text}`)
        .join("\n");

      // Read body safely
      let clientGestureInsights = [];
      try {
        const body = await req.json();
        if (body?.gestureInsights) clientGestureInsights = body.gestureInsights;
      } catch(e) {}

      const allGestures = [...(session.gestureInsights || []), ...clientGestureInsights];
      const gestureText = allGestures
        .map((g: any) => `- ${g.meaning} (${g.gesture})`)
        .join("\n") || "No gestures recorded.";

      // Generate session notes via Gemini
      let sessionNotes = "";
      let keyTopics: string[] = [];
      let recommendations: string[] = [];
      let emotionalSummary = "";
      let riskLevel = "none";

      if (transcriptText.length > 50) {
        const prompt = `You are a clinical therapist supervisor reviewing a therapy session transcript.
Therapist: ${session.therapistName} (AI Therapist)
Session Duration: ${Math.floor(durationSeconds / 60)} minutes
Gesture observations: ${gestureText}

TRANSCRIPT:
${transcriptText.slice(0, 4000)}

Please generate:
1. SESSION NOTES (2-3 paragraphs summarizing the therapeutic work done)
2. KEY TOPICS (5-7 bullet points, comma separated, no bullets)
3. RECOMMENDATIONS (3-5 specific recommendations for the client, comma separated)
4. EMOTIONAL SUMMARY (1 sentence describing the client's emotional arc)
5. RISK LEVEL (none/low/medium/high based on content)

Respond in exactly this JSON format:
{
  "sessionNotes": "...",
  "keyTopics": ["topic1", "topic2"],
  "recommendations": ["rec1", "rec2"],
  "emotionalSummary": "...",
  "riskLevel": "none"
}`;

        try {
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
          const result = await model.generateContent(prompt);
          const raw = result.response.text();
          const jsonMatch = raw.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            sessionNotes = parsed.sessionNotes || "";
            keyTopics = parsed.keyTopics || [];
            recommendations = parsed.recommendations || [];
            emotionalSummary = parsed.emotionalSummary || "";
            riskLevel = parsed.riskLevel || "none";
          }
        } catch (e) {
          console.warn("[VideoSession END] Gemini generation failed:", e);
          sessionNotes = `Session with ${session.therapistName} lasting ${Math.floor(durationSeconds / 60)} minutes. ${session.transcript.length} exchanges recorded.`;
          keyTopics = session.emotionalJourney.slice(0, 5);
          recommendations = ["Continue regular therapy sessions", "Practice coping strategies discussed"];
          emotionalSummary = "Session completed successfully.";
        }
      } else {
        sessionNotes = `Brief session with ${session.therapistName}. Limited transcript available.`;
        emotionalSummary = "Session ended early.";
      }

      // Upload to Cloudinary
      let contentUrl = "";
      try {
        const reportData = {
          summary: sessionNotes,
          key_topics: keyTopics,
          recommendations,
          emotional_trends: emotionalSummary,
          risk_assessment: riskLevel
        };
        const uploadRes = (await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            `data:application/json;base64,${Buffer.from(JSON.stringify(reportData)).toString("base64")}`,
            {
              resource_type: "raw",
              folder: "maand/reports/json",
              public_id: `video_report_${id}`,
              overwrite: true,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          );
        })) as any;
        contentUrl = uploadRes.secure_url;
      } catch(e) {
        console.error("Cloudinary upload failed", e);
      }

      // Create Report document
      try {
        await Report.create({
          userId: user.id,
          sessionId: id,
          title: `Video Session ${new Date().toLocaleDateString()}`,
          summary: sessionNotes,
          emotionalTrends: emotionalSummary,
          keyTopics: keyTopics,
          recommendations: recommendations,
          riskAssessment: riskLevel,
          contentUrl: contentUrl || undefined,
          isFavorite: false,
          deliveryStatus: "pending",
        });
      } catch(e) {
        console.error("Failed to create report doc", e);
      }

      // Update session in DB
      await VideoSession.findByIdAndUpdate(id, {
        status: "completed",
        endedAt,
        durationSeconds,
        sessionNotes,
        keyTopics,
        recommendations,
        emotionalSummary,
        riskLevel,
        reportGenerated: true,
      });

      const updated = await VideoSession.findById(id).lean();
      return NextResponse.json({ success: true, data: updated });
    } catch (err: any) {
      console.error("[VideoSession END]", err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  });
}
