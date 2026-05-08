import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
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
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "therapist", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending", "suspended"],
      default: "active",
    },
    image: {
      type: String,
    },
    // Profile Metadata
    bio: { type: String, maxLength: 500 },
    phoneNumber: { type: String },
    location: { type: String },
    
    // OAuth Providers
    googleId: { type: String, unique: true, sparse: true },
    
    // Advanced Authentication & Security
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    backupCodes: [{ type: String, select: false }],
    
    // Legal & Compliance
    disclaimerAccepted: { type: Boolean, default: false },
    disclaimerAcceptedAt: { type: Date },
    disclaimerVersion: { type: String },
    
    // Verification & Recovery
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    
    // Auth Versioning (for global logout)
    authVersion: { type: Number, default: 0 },

    // Comprehensive Settings System
    settings: {
      theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
      language: { type: String, default: "en" },
      timezone: { type: String, default: "auto" },
      highContrast: { type: Boolean, default: false },
      notifications: {
        email: { type: Boolean, default: true },
        session: { type: Boolean, default: true },
        report: { type: Boolean, default: true },
        security: { type: Boolean, default: true },
      },
      aiPreferences: {
        autoReport: { type: Boolean, default: true },
        responseStyle: { type: String, enum: ["empathetic", "direct", "analytical"], default: "empathetic" },
        contextPreservation: { type: Boolean, default: true },
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = models.User || model("User", UserSchema);

export default User;
