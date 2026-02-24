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

  return {
    sendMessage,
    getSessionHistory,
    loading,
    error,
  };
}
