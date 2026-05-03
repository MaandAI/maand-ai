export type Message = {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
};

export type ChatSession = {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt?: string;
  isFavorite?: boolean;
};

export type AvatarState = "calm" | "thinking" | "listening" | "supportive" | "reflective";
