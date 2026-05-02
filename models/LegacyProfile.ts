import mongoose, { Schema, model, models } from "mongoose";

const LegacyProfileSchema = new Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    relationship: { type: String },
    personalityTraits: [String],
    allowedTopics: [String],
    consentGiven: { type: Boolean, default: false },
    expiresAt: { type: Date },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  {
    timestamps: true,
  }
);

const LegacyProfile = models.LegacyProfile || model("LegacyProfile", LegacyProfileSchema);
export default LegacyProfile;
