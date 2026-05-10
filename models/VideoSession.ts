import mongoose, { Schema, model, models } from "mongoose";

const TranscriptEntrySchema = new Schema({
  speaker: { type: String, enum: ["user", "therapist"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  emotion: { type: String },
});

const GestureInsightSchema = new Schema({
  gesture: { type: String, required: true },
  meaning: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const VideoSessionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    therapistId: { type: String, required: true, default: "ava" },
    therapistName: { type: String, required: true, default: "Ava" },
    status: {
      type: String,
      enum: ["active", "completed", "abandoned"],
      default: "active",
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    durationSeconds: { type: Number, default: 0 },

    // Session content
    transcript: [TranscriptEntrySchema],
    gestureInsights: [GestureInsightSchema],
    emotionalJourney: [{ type: String }],

    // Generated outputs
    sessionNotes: { type: String },
    keyTopics: [{ type: String }],
    recommendations: [{ type: String }],
    emotionalSummary: { type: String },
    riskLevel: { type: String, enum: ["none", "low", "medium", "high"], default: "none" },

    // Report
    reportGenerated: { type: Boolean, default: false },
    reportUrl: { type: String },
    pdfUrl: { type: String },
  },
  { timestamps: true }
);

const VideoSession = models.VideoSession || model("VideoSession", VideoSessionSchema);
export default VideoSession;
