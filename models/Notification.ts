import mongoose, { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error", "session", "report", "security"],
      default: "info",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String }, // Optional link to redirect user
    isRead: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

const Notification = models.Notification || model("Notification", NotificationSchema);
export default Notification;
