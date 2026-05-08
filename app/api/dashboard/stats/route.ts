import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import ChatSession from "@/models/ChatSession";
import Report from "@/models/Report";
import Notification from "@/models/Notification";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await dbConnect();

    // Fetch counts
    const totalSessions = await ChatSession.countDocuments({ userId });
    const activeSessions = await ChatSession.countDocuments({ userId, status: "active" });
    const totalReports = await Report.countDocuments({ userId });
    const favoriteReports = await Report.countDocuments({ userId, isFavorite: true });
    const unreadNotifications = await Notification.countDocuments({ userId, isRead: false });

    // Fetch recent activity
    const recentSessions = await ChatSession.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5);

    const recentReports = await Report.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalSessions,
          activeSessions,
          totalReports,
          favoriteReports,
          unreadNotifications,
        },
        recentActivity: {
          sessions: recentSessions,
          reports: recentReports,
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
