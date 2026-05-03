import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { WaitlistEntry } from "@/backend/validators/waitlist.schema";

import { useToast } from "@/hooks/use-toast";

export function useWaitlistAPI() {
  const { toast } = useToast();
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
      const msg = err.response?.data?.error || "Failed to fetch waitlist";
      setError(msg);
      toast({ title: "Fetch Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateStatus = async (
    entryId: string,
    status: "pending" | "contacted" | "converted",
  ) => {
    try {
      await apiClient.patch("/waitlist", { entryId, status });
      setEntries((prev) =>
        prev.map((e) => (e.id === entryId ? { ...e, status } : e)),
      );
      toast({ 
        title: "Status Updated", 
        description: `Entry successfully marked as ${status}.` 
      });
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to update status";
      toast({ title: "Update Error", description: msg, variant: "destructive" });
    }
  };

  return { entries, loading, error, fetchEntries, updateStatus };
}
