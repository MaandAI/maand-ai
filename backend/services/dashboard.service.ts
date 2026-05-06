import dbConnect from "@/lib/mongodb";
import Analytics from "@/models/Analytics";
import {
  DashboardStats,
  UserActivity,
  RevenueData,
} from "../validators/dashboard.schema";
import ChatSession from "@/models/ChatSession";
import Report from "@/models/Report";
import UserModuleProgress from "@/models/UserModuleProgress";

export class DashboardService {
  static async getOverviewStats(): Promise<DashboardStats | null> {
    await dbConnect();
    const overview = await Analytics.findOne({ type: "dashboard_overview" });
    if (!overview) return null;
    return overview.data as DashboardStats;
  }

  static async getUserActivity(): Promise<UserActivity[]> {
    await dbConnect();
    const overview = await Analytics.findOne({ type: "dashboard_overview" });
    if (!overview) return [];
    return (overview.userActivity || []).map((item: any) => ({
      id: item._id?.toString(),
      ...(item.toObject ? item.toObject() : item),
    })) as UserActivity[];
  }

  static async getRevenueData(): Promise<RevenueData[]> {
    await dbConnect();
    const overview = await Analytics.findOne({ type: "dashboard_overview" });
    if (!overview) return [];
    return (overview.revenueData || []).map((item: any) => ({
      id: item._id?.toString(),
      ...(item.toObject ? item.toObject() : item),
    })) as RevenueData[];
  }

  static async getUserSummary(userId: string) {
    await dbConnect();

    const [
      totalSessions,
      activeSessions,
      completedSessions,
      totalReports,
      activeModules,
    ] = await Promise.all([
      ChatSession.countDocuments({ userId }),
      ChatSession.countDocuments({ userId, status: "active" }),
      ChatSession.countDocuments({ userId, status: "completed" }),
      Report.countDocuments({ userId }),
      UserModuleProgress.countDocuments({ userId, status: "in-progress" }),
    ]);

    return {
      totalSessions,
      activeSessions,
      completedSessions,
      totalReports,
      activeModules,
    };
  }
}
