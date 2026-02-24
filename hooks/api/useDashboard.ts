import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import {
  DashboardStats,
  UserActivity,
  RevenueData,
} from "@/backend/validators/dashboard.schema";

export function useDashboardAPI() {
  const [overview, setOverview] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [revenue, setRevenue] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch in parallel
      const [overviewRes, activityRes, revenueRes] = await Promise.all([
        apiClient.get<{ success: boolean; data: DashboardStats }>(
          "/dashboard/stats?type=overview",
        ),
        apiClient.get<{ success: boolean; data: UserActivity[] }>(
          "/dashboard/stats?type=activity",
        ),
        apiClient.get<{ success: boolean; data: RevenueData[] }>(
          "/dashboard/stats?type=revenue",
        ),
      ]);

      setOverview(overviewRes.data.data);
      setActivity(activityRes.data.data);
      setRevenue(revenueRes.data.data);
    } catch (err: any) {
      console.error("Error fetching dashboard stats", err);
      setError(
        err.response?.data?.error || "Failed to fetch dashboard statistics",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchAllStats();
    }
  }, [fetchAllStats]);

  return {
    overview,
    activity,
    revenue,
    loading,
    error,
    refresh: fetchAllStats,
  };
}
