import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/client";

export interface DashboardStats {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  description: string;
}

export interface RecentSession {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface DashboardData {
  stats: DashboardStats[];
  recentSessions: RecentSession[];
}

/**
 * useDashboard Hook
 * Fetches and caches dashboard statistics and recent activity.
 */
export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get("/dashboard/stats").then((res: any) => res.data),
  });
}
