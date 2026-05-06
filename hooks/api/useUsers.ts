import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { UserProfile } from "@/backend/services/users.service";

export function useUsersAPI() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: UserProfile[];
      }>("/users");
      setUsers(response.data.data);
    } catch (err: any) {
      console.error("Error fetching users", err);
      setError(err.response?.data?.error || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchUsers();
    }
  }, [fetchUsers]);

  const updateUser = async (id: string, data: any) => {
    try {
      await apiClient.patch(`/users/${id}`, data);
      await fetchUsers();
      return { success: true };
    } catch (err: any) {
      console.error("Error updating user", err);
      return { success: false, error: err.response?.data?.error || "Failed to update user" };
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await apiClient.delete(`/users/${id}`);
      await fetchUsers();
      return { success: true };
    } catch (err: any) {
      console.error("Error deleting user", err);
      return { success: false, error: err.response?.data?.error || "Failed to delete user" };
    }
  };

  const createUser = async (data: any) => {
    try {
      const response = await apiClient.post("/admin/users", data);
      await fetchUsers();
      return { success: true, data: response.data.data };
    } catch (err: any) {
      console.error("Error creating user", err);
      return { success: false, error: err.response?.data?.error || "Failed to create user" };
    }
  };

  const batchCreateUsers = async (data: any[]) => {
    try {
      const response = await apiClient.post("/admin/users", data);
      await fetchUsers();
      return { success: true, data: response.data.data };
    } catch (err: any) {
      console.error("Error batch creating users", err);
      return { success: false, error: err.response?.data?.error || "Failed to batch create users" };
    }
  };

  return { users, loading, error, refresh: fetchUsers, updateUser, deleteUser, createUser, batchCreateUsers };
}
