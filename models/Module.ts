import mongoose, { Schema, model, models } from "mongoose";

const ModuleSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    totalSessions: { type: Number },
    status: { type: String, default: "active" },
    progress: { type: Number, default: 0 },
    sessionsCompleted: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Module = models.Module || model("Module", ModuleSchema);
export default Module;
