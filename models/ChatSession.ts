import mongoose, { Schema, model, models } from "mongoose";

const ChatSessionSchema = new Schema(
  {
    userId: { type: String, required: true },
    title: { type: String },
    persona: { description: String },
    durationMs: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const ChatSession = models.ChatSession || model("ChatSession", ChatSessionSchema);
export default ChatSession;
