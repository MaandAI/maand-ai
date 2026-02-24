import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Notification } from "@/backend/validators/notifications.schema";

export function useNotificationsAPI() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: Notification[];
      }>("/notifications");
      setNotifications(response.data.data);
    } catch (err: any) {
      console.error("Error fetching notifications", err);
      setError(err.response?.data?.error || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch("/notifications", { notificationId });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    loading,
    error,
    refresh: fetchNotifications,
    markAsRead,
    unreadCount,
  };
}
