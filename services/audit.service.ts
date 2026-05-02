import dbConnect from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";

export type AuditAction =
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "CREATE_LEGACY_PROFILE"
  | "DELETE_LEGACY_PROFILE"
  | "LEGACY_INTERACTION"
  | "CRISIS_ESCALATION";

export async function logAuditAction(
  userId: string,
  action: AuditAction,
  metadata: any,
) {
  try {
    await dbConnect();
    await AuditLog.create({
      userId,
      action,
      metadata,
    });
  } catch (e) {
    console.error("FATAL: Failed to write to audit log:", e);
  }
}
