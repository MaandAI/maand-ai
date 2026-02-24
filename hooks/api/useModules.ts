import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { TherapyModuleWithProgress } from "@/backend/validators/modules.schema";

export function useModulesAPI() {
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
      console.log("Modules: ", response);
      setModules(response.data.data);
    } catch (err: any) {
      console.error("Error fetching modules", err);
      setError(err.response?.data?.error || "Failed to fetch modules");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch if we are in browser to prevent hydration issues
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
    } catch (err) {
      console.error("Failed to update progress", err);
      throw err;
    }
  };

  return { modules, loading, error, refresh: fetchModules, updateProgress };
}
