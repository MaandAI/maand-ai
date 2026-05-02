import mongoose, { Schema, model, models } from "mongoose";

const MessageSchema = new Schema(
  {
    sessionId: { type: String, required: true },
    content: { type: String, required: true },
    sender: { type: String, enum: ["user", "ai"], required: true },
    emotion: { type: String },
  },
  {
    timestamps: true,
  }
);

const Message = models.Message || model("Message", MessageSchema);
export default Message;
