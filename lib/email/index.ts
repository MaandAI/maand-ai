/**
 * Centralised email service for Maand.
 * Uses Resend as the primary transport provider.
 * Falls back to console logging in development when RESEND_API_KEY is absent.
 */
import { Resend } from "resend";
import { welcomeEmailTemplate } from "./templates/welcome";
import { passwordResetEmailTemplate } from "./templates/password-reset";
import {
  emailVerificationTemplate,
  emailChangeNotificationTemplate,
} from "./templates/email-verification";
import { securityAlertTemplate } from "./templates/security-alert";
import { reportReadyEmailTemplate } from "./templates/report-ready";
import { therapistApprovedTemplate } from "./templates/therapist-approved";

const FROM_ADDRESS =
  process.env.EMAIL_FROM || "Maand <noreply@maand.tech>";

let resend: Resend | null = null;
function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface SendResult {
  success: boolean;
  id?: string;
  error?: string;
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<SendResult> {
  // Dev mode without credentials → log only
  if (!process.env.RESEND_API_KEY) {
    const toStr = Array.isArray(to) ? to.join(", ") : to;
    console.log("─── [EMAIL] Dev Mock ──────────────────────────────────");
    console.log(`  To:      ${toStr}`);
    console.log(`  Subject: ${subject}`);
    console.log("──────────────────────────────────────────────────────");
    return { success: true, id: "dev-mock" };
  }

  try {
    const result = await getResend().emails.send({
      from: FROM_ADDRESS,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (result.error) {
      console.error("[Email Service] Resend error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (err: any) {
    console.error("[Email Service] Unexpected error:", err?.message ?? err);
    return { success: false, error: err?.message ?? "Unknown error" };
  }
}

// ── Public helpers ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(
  email: string,
  name: string,
  tempPassword?: string
): Promise<SendResult> {
  const loginUrl = `${process.env.NEXTAUTH_URL}/login`;
  return sendEmail({
    to: email,
    subject: "Welcome to Maand 👋",
    html: welcomeEmailTemplate({ name, loginUrl, tempPassword }),
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
): Promise<SendResult> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
  return sendEmail({
    to: email,
    subject: "Reset your Maand password",
    html: passwordResetEmailTemplate({ name, resetUrl }),
  });
}

export async function sendEmailVerificationEmail(
  newEmail: string,
  name: string,
  verificationToken: string
): Promise<SendResult> {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/user/email-change/confirm?token=${verificationToken}`;
  return sendEmail({
    to: newEmail,
    subject: "Verify your new Maand email address",
    html: emailVerificationTemplate({ name, verifyUrl, newEmail }),
  });
}

export async function sendEmailChangeNotification(
  oldEmail: string,
  name: string,
  newEmail: string
): Promise<SendResult> {
  return sendEmail({
    to: oldEmail,
    subject: "Your Maand email address was changed",
    html: emailChangeNotificationTemplate({ name, oldEmail, newEmail }),
  });
}

export async function sendSecurityAlertEmail(
  email: string,
  name: string,
  event: "password_changed" | "login_new_device" | "2fa_enabled" | "2fa_disabled",
  details?: string
): Promise<SendResult> {
  const eventSubjects = {
    password_changed: "Your Maand password was changed",
    login_new_device: "New sign-in to your Maand account",
    "2fa_enabled": "Two-factor authentication enabled",
    "2fa_disabled": "Two-factor authentication was disabled",
  };
  return sendEmail({
    to: email,
    subject: eventSubjects[event] || "Security alert — Maand",
    html: securityAlertTemplate({ name, event, details, timestamp: new Date().toUTCString() }),
  });
}

export async function sendReportReadyEmail(
  email: string,
  name: string,
  sessionTitle: string,
  reportId: string,
  pdfUrl?: string,
  summary?: string
): Promise<SendResult> {
  const reportUrl = `${process.env.NEXTAUTH_URL}/dashboard/reports?id=${reportId}`;
  return sendEmail({
    to: email,
    subject: "Your Maand session report is ready 📄",
    html: reportReadyEmailTemplate({ name, sessionTitle, reportUrl, pdfUrl, summary }),
  });
}

export async function sendTherapistApprovalEmail(
  email: string,
  name: string
): Promise<SendResult> {
  const loginUrl = `${process.env.NEXTAUTH_URL}/login`;
  return sendEmail({
    to: email,
    subject: "Your therapist application was approved — Maand",
    html: therapistApprovedTemplate({ name, loginUrl }),
  });
}
