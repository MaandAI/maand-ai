import mongoose, { Schema, model, models } from "mongoose";

const UserModuleProgressSchema = new Schema(
  {
    userId: { type: String, required: true },
    moduleId: { type: String, required: true },
    status: { type: String, default: "active" },
    progress: { type: Number, default: 0 },
    sessionsCompleted: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const UserModuleProgress = models.UserModuleProgress || model("UserModuleProgress", UserModuleProgressSchema);
export default UserModuleProgress;
