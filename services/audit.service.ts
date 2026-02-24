import { adminDb } from "@/lib/firebase-admin";

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
    await adminDb.collection("audit_logs").add({
      userId,
      action,
      metadata,
      timestamp: new Date().toISOString(),
      // Ensure no PII like raw passwords/messages is logged here directly
      systemContext: "SERVER_ACTION",
    });
  } catch (e) {
    // We log locally if remote audit fails to prevent crashing the main request,
    // but it still needs to be recorded.
    console.error("FATAL: Failed to write to audit log:", e);
  }
}
