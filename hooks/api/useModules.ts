import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export interface IModuleStage {
  id: string;
  title: string;
  description: string;
  type: "ai_session" | "exercise" | "reflection" | "voice_session" | "assessment";
  duration: number;
  order: number;
  content?: { exerciseType?: string };
}

export interface IModule {
  _id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  durationWeeks: number;
  totalStages: number;
  clinicalBasis: string;
  stages: IModuleStage[];
  meta?: { color: string; emoji: string };
  userProgress: {
    status: string;
    progressPercentage: number;
    completedStages: string[];
    currentStageId?: string;
    streak: number;
  };
}

export function useModulesAPI() {
  const { toast } = useToast();
  const [modules, setModules] = useState<IModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: IModule[];
      }>("/modules");
      console.log("Fetched Modules", response.data.data);
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
    fetchModules();
  }, [fetchModules]);

  return { modules, loading, error, refresh: fetchModules };
}
