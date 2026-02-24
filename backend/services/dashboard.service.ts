import { adminDb } from "../config/firebase-admin";
import {
  DashboardStats,
  UserActivity,
  RevenueData,
} from "../validators/dashboard.schema";

export class DashboardService {
  // Normally these would be strictly populated via Firebase Cloud Functions acting as aggregators on events.
  // For admin fetching, we retrieve from a centralized analytics collection.

  static async getOverviewStats(): Promise<DashboardStats | null> {
    const doc = await adminDb
      .collection("analytics")
      .doc("dashboard_overview")
      .get();
    if (!doc.exists) return null;
    return doc.data() as DashboardStats;
  }

  static async getUserActivity(): Promise<UserActivity[]> {
    const snapshot = await adminDb
      .collection("analytics")
      .doc("dashboard_overview")
      .collection("user_activity")
      .orderBy("date", "asc")
      .limit(12)
      .get();

    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as UserActivity,
    );
  }

  static async getRevenueData(): Promise<RevenueData[]> {
    const snapshot = await adminDb
      .collection("analytics")
      .doc("dashboard_overview")
      .collection("revenue_data")
      .orderBy("month", "asc")
      .limit(12)
      .get();

    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as RevenueData,
    );
  }
}
