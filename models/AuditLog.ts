import mongoose, { Schema, model, models } from "mongoose";

const AuditLogSchema = new Schema(
  {
    userId: { type: String, required: true },
    action: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    systemContext: { type: String, default: "SERVER_ACTION" },
  },
  {
    timestamps: true,
  }
);

const AuditLog = models.AuditLog || model("AuditLog", AuditLogSchema);
export default AuditLog;
