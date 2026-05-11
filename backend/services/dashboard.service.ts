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
import User from "@/models/User";

export class DashboardService {
  static async getOverviewStats(): Promise<DashboardStats | null> {
    await dbConnect();
    
    // Calculate real-time stats from the database
    const [totalUsers, activeUsers] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "user", status: "active" }),
    ]);

    // For revenue and subscriptions, we might still need some historical/projected data 
    // if no billing system is integrated, but we can base it on user counts for realism.
    const mockRevenuePerUser = 45; // Average $45 revenue per user
    const mockSubscriptionRate = 0.65; // 65% of users are subscribers

    return {
      totalUsers,
      activeUsers,
      totalRevenue: Math.floor(totalUsers * mockRevenuePerUser),
      subscriptions: Math.floor(totalUsers * mockSubscriptionRate),
      userGrowth: 12.5, // These could be calculated by comparing with previous month's Analytics snapshots
      revenueGrowth: 8.2,
      updatedAt: new Date(),
    };
  }

  static async getUserActivity(): Promise<UserActivity[]> {
    await dbConnect();
    
    // Group users by month of creation
    const activity = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          users: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          users: 1,
          sessions: { $literal: 0 } // In a real app, count ChatSessions per month
        }
      }
    ]);

    // If no data, return empty array
    if (!activity.length) return [];

    return activity as UserActivity[];
  }

  static async getRevenueData(): Promise<RevenueData[]> {
    await dbConnect();
    
    const activity = await this.getUserActivity();
    
    // Derive revenue from user counts for now
    const mockRevenuePerUser = 45;
    const mockSubscriptionRate = 0.65;

    return activity.map(a => ({
      month: a.date,
      revenue: a.users * mockRevenuePerUser,
      subscriptions: Math.floor(a.users * mockSubscriptionRate)
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
