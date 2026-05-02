import { apiClient } from "@/lib/api-client";

export const getTherapyModules = async (): Promise<any[]> => {
  try {
    const res = await apiClient.get("/therapy-modules");
    return res.data.data;
  } catch (error) {
    console.error("Error fetching therapy modules:", error);
    return [];
  }
};

export const getRecentModules = async (
  limitCount: number = 3,
): Promise<any[]> => {
  try {
    const res = await apiClient.get(`/therapy-modules?limit=${limitCount}`);
    return res.data.data;
  } catch (error) {
    console.error("Error fetching recent modules:", error);
    return [];
  }
};

export const getUserMoodHistory = async (userId: string): Promise<any[]> => {
  try {
    const res = await apiClient.get(`/users/mood-history`);
    return res.data.data;
  } catch (error) {
    console.error("Error fetching mood history:", error);
    return [];
  }
};
