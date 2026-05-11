import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import ChatSession from "@/models/ChatSession";
import Report from "@/models/Report";
import Notification from "@/models/Notification";
import { DashboardService } from "@/backend/services/dashboard.service";

/**
 * Dashboard Stats API
 * Aggregates real user data for regular users and platform metrics for admins.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    // Handle Admin Dashboard Stats (Overview, Activity, Revenue)
    if (role === "admin" && type) {
      let data: any = null;

      switch (type) {
        case "overview":
          data = await DashboardService.getOverviewStats();
          break;
        case "activity":
          data = await DashboardService.getUserActivity();
          break;
        case "revenue":
          data = await DashboardService.getRevenueData();
          break;
        default:
          return NextResponse.json({ error: "Invalid stats type" }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        data,
      });
    }

    // Default User Dashboard Stats (Total Sessions, Reports, etc.)
    // Fetch aggregates in parallel
    const [totalSessions, completedSessions, totalReports, unreadNotifications, recentSessions] = await Promise.all([
      ChatSession.countDocuments({ userId }),
      ChatSession.countDocuments({ userId, status: "completed" }),
      Report.countDocuments({ userId }),
      Notification.countDocuments({ userId, isRead: false }),
      ChatSession.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const stats = [
      {
        label: "Total Sessions",
        value: totalSessions.toString(),
        change: "+12%", 
        trend: "up" as const,
        description: "Clinical conversations started",
      },
      {
        label: "Completed",
        value: completedSessions.toString(),
        change: "+5%",
        trend: "up" as const,
        description: "Successfully finalized sessions",
      },
      {
        label: "Clinical Reports",
        value: totalReports.toString(),
        change: "+2",
        trend: "neutral" as const,
        description: "AI-generated insights ready",
      },
      {
        label: "Notifications",
        value: unreadNotifications.toString(),
        change: unreadNotifications > 0 ? "New" : "Cleared",
        trend: unreadNotifications > 0 ? ("up" as const) : ("neutral" as const),
        description: "Unread alerts and updates",
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentSessions,
      },
    });
  } catch (error: any) {
    console.error("[Dashboard Stats API Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
