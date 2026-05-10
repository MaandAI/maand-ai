import mongoose, { Schema, Document } from "mongoose";

export interface IUserModuleProgress extends Document {
  userId: mongoose.Types.ObjectId;
  moduleId: mongoose.Types.ObjectId;
  status: "not_started" | "in_progress" | "completed";
  currentStageId: string;
  completedStages: string[];
  progressPercentage: number;
  streak: number;
  lastActivityAt: Date;
  emotionalScoreHistory: { date: Date; score: number }[];
  aiObservations: string[];
  detectedTriggers: string[];
  recommendedCopingSkills: string[];
}

const UserModuleProgressSchema = new Schema<IUserModuleProgress>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  moduleId: { type: Schema.Types.ObjectId, ref: "Module", required: true },
  status: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started" },
  currentStageId: { type: String },
  completedStages: [{ type: String }],
  progressPercentage: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActivityAt: { type: Date, default: Date.now },
  emotionalScoreHistory: [{
    date: { type: Date, default: Date.now },
    score: { type: Number }
  }],
  aiObservations: [{ type: String }],
  detectedTriggers: [{ type: String }],
  recommendedCopingSkills: [{ type: String }]
});

// Ensure unique progress per user/module
UserModuleProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

export default mongoose.models.UserModuleProgress || mongoose.model<IUserModuleProgress>("UserModuleProgress", UserModuleProgressSchema);
