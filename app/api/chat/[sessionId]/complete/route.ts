import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ChatService } from "@/backend/services/chat.service";
import Report from "@/models/Report";
import dbConnect from "@/lib/mongodb";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { sessionId } = await params;

    const completedSession = await ChatService.completeSession(userId, sessionId);

    // Fetch the report that was just generated
    await dbConnect();
    const report = await Report.findOne({ sessionId }).select("_id").lean();

    return NextResponse.json({
      success: true,
      session: completedSession,
      reportId: report ? (report as any)._id.toString() : null,
    });
  } catch (error: any) {
    console.error("Session Completion Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
