import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/backend/middlewares/auth.middleware";
import { ChatService } from "@/backend/services/chat.service";

export async function GET(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      const sessions = await ChatService.getSessions(user.id);
      
      // Enhance sessions with a temporary title if not present
      const enhancedSessions = sessions.map(s => ({
        ...s,
        title: s.title || `Session ${new Date(s.createdAt?.seconds * 1000).toLocaleDateString()}`
      }));

      return NextResponse.json({ success: true, data: enhancedSessions });
    } catch (error: any) {
      console.error("Sessions API Error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  });
}
