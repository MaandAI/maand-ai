import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { ChatMessage, ChatSession } from "@/backend/validators/chat.schema";

export function useChatAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (
      sessionId: string,
      content: string,
      sender: "user" | "ai" = "user",
    ) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post<{
          success: boolean;
          data: ChatMessage;
        }>("/chat/messages", {
          sessionId,
          content,
          sender,
        });
        return response.data.data;
      } catch (err: any) {
        console.error("Error sending message", err);
        setError(err.response?.data?.error || "Failed to send message");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getSessionHistory = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: ChatMessage[];
      }>(`/chat/messages?sessionId=${sessionId}`);
      return response.data.data;
    } catch (err: any) {
      console.error("Error fetching history", err);
      setError(err.response?.data?.error || "Failed to fetch history");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: ChatSession[];
      }>("/chat/sessions");
      return response.data.data;
    } catch (err: any) {
      console.error("Error fetching sessions", err);
      setError(err.response?.data?.error || "Failed to fetch sessions");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const renameSession = useCallback(async (sessionId: string, title: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch<{
        success: boolean;
        data: ChatSession;
      }>(`/chat/sessions/${sessionId}`, { title });
      return response.data.data;
    } catch (err: any) {
      console.error("Error renaming session", err);
      setError(err.response?.data?.error || "Failed to rename session");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/chat/sessions/${sessionId}`);
      return true;
    } catch (err: any) {
      console.error("Error deleting session", err);
      setError(err.response?.data?.error || "Failed to delete session");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (sessionId: string, isFavorite: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch<{
        success: boolean;
        data: ChatSession;
      }>(`/chat/sessions/${sessionId}`, { isFavorite });
      return response.data.data;
    } catch (err: any) {
      console.error("Error toggling favorite", err);
      setError(err.response?.data?.error || "Failed to toggle favorite");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sendMessage,
    getSessionHistory,
    getSessions,
    renameSession,
    deleteSession,
    toggleFavorite,
    loading,
    error,
  };
}
