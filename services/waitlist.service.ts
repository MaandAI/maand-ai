import { apiClient } from "@/lib/api-client";

export interface WaitlistEntry {
  email: string;
  name?: string;
  status: "pending" | "contacted" | "converted";
  createdAt: string;
}

export const joinWaitlist = async (data: Partial<WaitlistEntry>) => {
  try {
    await apiClient.post("/waitlist", data);
    return true;
  } catch (error) {
    console.error("Error joining waitlist:", error);
    return false;
  }
};

export const getWaitlistEntries = async () => {
  try {
    const res = await apiClient.get("/waitlist");
    return res.data.data;
  } catch (error) {
    console.error("Error fetching waitlist:", error);
    return [];
  }
};
