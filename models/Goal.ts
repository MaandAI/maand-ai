import mongoose, { Schema, model, models } from "mongoose";

const GoalSchema = new Schema(
  {
    userId: { type: String, required: true },
    sessionId: { type: String }, // Optional: link to the session where it was created
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    category: { type: String, default: "personal" },
    dueDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Goal = models.Goal || model("Goal", GoalSchema);
export default Goal;
