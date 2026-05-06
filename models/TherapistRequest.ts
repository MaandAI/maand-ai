import mongoose, { Schema, model, models } from "mongoose";

const TherapistRequestSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
    },
    licenseNumber: {
      type: String,
      required: [true, "License number is required"],
    },
    experience: {
      type: Number,
      required: [true, "Years of experience is required"],
    },
    bio: {
      type: String,
      required: [true, "Bio is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const TherapistRequest = models.TherapistRequest || model("TherapistRequest", TherapistRequestSchema);

export default TherapistRequest;
