import mongoose, { Schema, Document } from "mongoose";

export interface IModuleStage {
  id: string;
  title: string;
  description: string;
  type: "ai_session" | "exercise" | "reflection" | "assessment" | "voice_session";
  duration: number;
  order: number;
  content?: any;
}

export interface IModule extends Document {
  slug: string;
  title: string;
  description: string;
  category: "anxiety" | "depression" | "sleep" | "growth" | "regulation";
  thumbnail: string;
  durationWeeks: number;
  totalStages: number;
  stages: IModuleStage[];
  clinicalBasis: string;
  createdAt: Date;
}

const ModuleSchema = new Schema<IModule>({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  thumbnail: { type: String },
  durationWeeks: { type: Number, default: 1 },
  totalStages: { type: Number, required: true },
  stages: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ["ai_session", "exercise", "reflection", "assessment", "voice_session"], required: true },
    duration: { type: Number, default: 10 },
    order: { type: Number, default: 0 },
    content: { type: Schema.Types.Mixed }
  }],
  clinicalBasis: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Force delete cached model to prevent stale schema issues during hot reload
if (mongoose.models.Module) {
  delete (mongoose.models as any).Module;
}

export default mongoose.model<IModule>("Module", ModuleSchema);
