import mongoose, { Schema, model, models } from "mongoose";

const ReportSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "ChatSession", required: true, unique: true },
    title: { type: String, required: true },
    summary: { type: String },
    emotionalTrends: [{ type: String }],
    keyTopics: [{ type: String }],
    recommendations: [{ type: String }],
    riskAssessment: { type: String },
    contentUrl: { type: String, required: true }, // URL to the full JSON report in Cloudinary
    status: { type: String, enum: ["generated", "reviewed"], default: "generated" },
  },
  {
    timestamps: true,
  }
);

const Report = models.Report || model("Report", ReportSchema);
export default Report;
