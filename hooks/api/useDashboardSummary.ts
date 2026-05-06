import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

export interface DashboardSummary {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  totalReports: number;
  activeModules: number;
}

export function useDashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: DashboardSummary;
      }>("/dashboard/summary");
      setSummary(response.data.data);
    } catch (err: any) {
      console.error("Error fetching dashboard summary", err);
      setError(err.response?.data?.error || "Failed to fetch summary");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refresh: fetchSummary };
}
