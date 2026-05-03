import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ChatService } from "@/backend/services/chat.service";

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { sessionId } = params;

    const completedSession = await ChatService.completeSession(
      userId,
      sessionId,
    );

    return NextResponse.json({
      success: true,
      session: completedSession,
    });
  } catch (error: any) {
    console.error("Session Completion Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
