import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/backend/middlewares/auth.middleware";
import { ChatService } from "@/backend/services/chat.service";

export async function GET(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const query = status ? { status } : {};

      const sessions = await ChatService.getSessions(user.id, query);
      
      // Enhance sessions with a temporary title if not present
      const enhancedSessions = sessions.map((s: any) => ({
        ...s,
        title: s.title || `Session ${new Date(s.createdAt || Date.now()).toLocaleDateString()}`
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
export async function POST(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      const { persona, title } = await req.json();
      const sessionId = await ChatService.createSession(user.id, persona || null, title);
      
      return NextResponse.json({ 
        success: true, 
        data: { id: sessionId } 
      });
    } catch (error: any) {
      console.error("Session Creation Error:", error);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }
  });
}
