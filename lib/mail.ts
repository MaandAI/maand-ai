/**
 * Legacy mail.ts — now delegates to the unified email service (lib/email/index.ts).
 * Kept for backward compatibility with existing imports.
 * New code should import from "@/lib/email" directly.
 */
export {
  sendWelcomeEmail,
  sendTherapistApprovalEmail,
  sendPasswordResetEmail,
  sendSecurityAlertEmail,
  sendReportReadyEmail,
  sendEmailVerificationEmail,
  sendEmailChangeNotification,
} from "@/lib/email";
