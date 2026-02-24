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

  return { users, loading, error, refresh: fetchUsers };
}
