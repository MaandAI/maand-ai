import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { TherapyModuleWithProgress } from "@/backend/validators/modules.schema";

import { useToast } from "@/hooks/use-toast";

export function useModulesAPI() {
  const { toast } = useToast();
  const [modules, setModules] = useState<TherapyModuleWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: TherapyModuleWithProgress[];
      }>("/therapy-modules");
      setModules(response.data.data);
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to fetch modules";
      setError(msg);
      toast({ title: "Fetch Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchModules();
    }
  }, [fetchModules]);

  const updateProgress = async (
    moduleId: string,
    progress: number,
    status: string,
    sessionsCompleted: number,
  ) => {
    try {
      await apiClient.post("/therapy-modules", {
        moduleId,
        progress,
        status,
        sessionsCompleted,
      });
      // Optimistic update
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, progress, status: status as any, sessionsCompleted }
            : m,
        ),
      );
      toast({ title: "Progress Saved", description: "Your module progress has been updated." });
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to update progress";
      toast({ title: "Save Error", description: msg, variant: "destructive" });
      throw err;
    }
  };

  return { modules, loading, error, refresh: fetchModules, updateProgress };
}

