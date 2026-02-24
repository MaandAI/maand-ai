import { z } from "zod";

export const ChatSessionSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
  persona: z.record(z.any()), // Can be typed further if Persona structure is strictly defined
  durationMs: z.number().nonnegative().default(0),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});

export const ChatMessageSchema = z.object({
  id: z.string().optional(),
  sessionId: z.string().min(1, "Session ID is required"),
  content: z.string().min(1, "Content cannot be empty"),
  sender: z.enum(["user", "ai"]),
  emotion: z.string().optional(),
  isCrisis: z.boolean().default(false), // Automatically mapped via backend services
  timestamp: z.union([z.string(), z.date()]).optional(),
});

export type ChatSession = z.infer<typeof ChatSessionSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
