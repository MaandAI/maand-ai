import mongoose, { Schema, model, models } from "mongoose";

const WaitlistSchema = new Schema(
  {
    email: { type: String, required: true },
    name: { type: String, required: true },
    interest: { type: String },
    message: { type: String },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "converted"],
      default: "pending",
    },
  },
  {
    timestamps: { createdAt: "joinedAt", updatedAt: true },
  }
);

const Waitlist = models.Waitlist || model("Waitlist", WaitlistSchema);

export default Waitlist;
