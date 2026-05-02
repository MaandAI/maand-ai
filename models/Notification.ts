import mongoose, { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: { type: String, required: true }, // Using string for now to match user ID
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "success", "warning", "error"], default: "info" },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Notification = models.Notification || model("Notification", NotificationSchema);
export default Notification;
