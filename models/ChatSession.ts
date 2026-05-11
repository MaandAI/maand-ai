import mongoose, { Schema, model, models } from "mongoose";

const ChatSessionSchema = new Schema(
  {
    userId: { type: String, required: true },
    title: { type: String },
    persona: { description: String },
    durationMs: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "completed"], default: "active" },
    reportUrl: { type: String },
    pdfUrl: { type: String },
    reportId: { type: String },
    isFavorite: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const ChatSession = models.ChatSession || model("ChatSession", ChatSessionSchema);
export default ChatSession;
