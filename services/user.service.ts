import { apiClient } from "@/lib/api-client";
import { UserProfile, Role } from "@/types";

export const getUserProfile = async (
  uid: string,
): Promise<UserProfile | null> => {
  try {
    const res = await apiClient.get(`/users/${uid}`);
    return res.data.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const createUserProfile = async (
  uid: string,
  data: Partial<UserProfile>,
): Promise<void> => {
  try {
    await apiClient.post("/users", { uid, ...data });
  } catch (error) {
    console.error("Error creating user profile:", error);
  }
};

export const updateUserRole = async (
  uid: string,
  role: Role,
): Promise<void> => {
  try {
    await apiClient.patch(`/users/${uid}/role`, { role });
  } catch (error) {
    console.error("Error updating user role:", error);
  }
};
