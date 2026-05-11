import nodemailer from "nodemailer";
import { welcomeEmailTemplate } from "./templates/welcome";
import { passwordResetEmailTemplate } from "./templates/password-reset";
import {
  emailVerificationTemplate,
  emailChangeNotificationTemplate,
} from "./templates/email-verification";
import { securityAlertTemplate } from "./templates/security-alert";
import { reportReadyEmailTemplate } from "./templates/report-ready";
import { therapistApprovedTemplate } from "./templates/therapist-approved";

const FROM_ADDRESS = process.env.EMAIL_FROM || "Maand <noreply@maand.tech>";

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    const toStr = Array.isArray(to) ? to.join(", ") : to;
    console.log("─── [EMAIL] Dev Mock (No SMTP Credentials) ──────────");
    console.log(`  To:      ${toStr}`);
    console.log(`  Subject: ${subject}`);
    console.log("──────────────────────────────────────────────────────");
    return { success: true, id: "dev-mock" };
  }

  try {
    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
    });

    return { success: true, id: info.messageId };
  } catch (err: any) {
    console.error("[Email Service] SMTP error:", err?.message ?? err);
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
  email: string,
  name: string,
  otp: string
): Promise<SendResult> {
  return sendEmail({
    to: email,
    subject: `Your Maand verification code: ${otp}`,
    html: emailVerificationTemplate({ name, otp, email }),
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
  summary?: string,
  pdfBuffer?: Buffer
): Promise<SendResult> {
  const reportUrl = `${process.env.NEXTAUTH_URL}/dashboard/reports?id=${reportId}`;
  return sendEmail({
    to: email,
    subject: "Your Maand session report is ready 📄",
    html: reportReadyEmailTemplate({ name, sessionTitle, reportUrl, pdfUrl, summary }),
    attachments: pdfBuffer ? [
      {
        filename: `Maand_Report_${sessionTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`,
        content: pdfBuffer,
      }
    ] : undefined
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
