import { apiClient } from "@/lib/api-client";
import { ChatSession, ChatMessage } from "@/backend/validators/chat.schema";

export const createChatSession = async (userId: string, persona: any) => {
  // Map to hypothetical backend endpoint /api/chat/sessions
  const response = await apiClient.post("/chat/sessions", { persona });
  return response.data.data.id;
};

export const updateSessionDuration = async (
  userId: string,
  sessionId: string,
  newDurationMs: number,
) => {
  await apiClient.put(`/chat/sessions/${sessionId}`, {
    durationMs: newDurationMs,
  });
};

// These Admin versions shouldn't be accessible/needed from frontend code anymore.
// They are safely living in the backend now. Kept as no-ops strictly to prevent immediate build crashes if imported elsewhere dynamically.
export async function adminSaveChatMessage(
  userId: string,
  sessionId: string,
  message: any,
) {
  console.warn(
    "adminSaveChatMessage called from client. Use standard API hooks.",
  );
}

export async function adminGetChatHistory(userId: string, sessionId: string) {
  console.warn(
    "adminGetChatHistory called from client. Use standard API hooks.",
  );
  return [];
}

export const adminCreateSession = async (userId: string, persona: any) => {
  console.warn(
    "adminCreateSession called from client. Use standard API hooks.",
  );
  return "";
};
