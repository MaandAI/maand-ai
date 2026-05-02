import { apiClient } from "@/lib/api-client";

export const getDashboardStats = async () => {
  try {
    const res = await apiClient.get("/dashboard/stats");
    return res.data.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return null;
  }
};

export const getRevenueData = async () => {
  try {
    const res = await apiClient.get("/dashboard/revenue");
    return res.data.data;
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return [];
  }
};

export const getUserActivity = async () => {
  try {
    const res = await apiClient.get("/dashboard/activity");
    return res.data.data;
  } catch (error) {
    console.error("Error fetching user activity:", error);
    return [];
  }
};
