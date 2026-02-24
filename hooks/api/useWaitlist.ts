import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { WaitlistEntry } from "@/backend/validators/waitlist.schema";

export function useWaitlistAPI() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: WaitlistEntry[];
      }>("/waitlist");
      setEntries(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch waitlist");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = async (
    entryId: string,
    status: "pending" | "contacted" | "converted",
  ) => {
    await apiClient.patch("/waitlist", { entryId, status });
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, status } : e)),
    );
  };

  return { entries, loading, error, fetchEntries, updateStatus };
}
