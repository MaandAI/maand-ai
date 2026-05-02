import mongoose, { Schema, model, models } from "mongoose";

const AnalyticsSchema = new Schema(
  {
    type: { type: String, required: true, unique: true }, // e.g., "dashboard_overview"
    data: { type: Schema.Types.Mixed },
    userActivity: [{ date: String, users: Number, sessions: Number }],
    revenueData: [{ month: String, revenue: Number, subscriptions: Number }],
  },
  {
    timestamps: true,
  }
);

const Analytics = models.Analytics || model("Analytics", AnalyticsSchema);
export default Analytics;
