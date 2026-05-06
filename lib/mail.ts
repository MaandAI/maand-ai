import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.ethereal.email",
  port: Number(process.env.EMAIL_PORT) || 587,
  auth: {
    user: process.env.EMAIL_USER || "mock_user",
    pass: process.env.EMAIL_PASS || "mock_pass",
  },
});

export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  // If in development and no email credentials, just log to console
  if (process.env.NODE_ENV === "development" && !process.env.EMAIL_USER) {
    console.log("------------------- MOCK EMAIL -------------------");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML: ${html}`);
    console.log("--------------------------------------------------");
    return { messageId: "mock-id" };
  }

  try {
    const info = await transporter.sendMail({
      from: '"Maand Support" <support@maand.tech>',
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

export const sendWelcomeEmail = async (email: string, name: string, tempPassword?: string) => {
  const subject = "Welcome to Maand!";
  const html = `
    <h1>Welcome to Maand, ${name}!</h1>
    <p>Your account has been created by an administrator.</p>
    ${tempPassword ? `<p>Your temporary password is: <strong>${tempPassword}</strong></p><p>Please change your password after logging in.</p>` : "<p>You can now log in using your email.</p>"}
    <a href="${process.env.NEXTAUTH_URL}/login">Login to your account</a>
  `;
  return sendEmail({ to: email, subject, html });
};

export const sendTherapistApprovalEmail = async (email: string, name: string) => {
  const subject = "Therapist Request Approved - Maand";
  const html = `
    <h1>Congratulations, ${name}!</h1>
    <p>Your request to join Maand as a therapist has been approved.</p>
    <p>Please check your email for a separate message with your login credentials.</p>
    <a href="${process.env.NEXTAUTH_URL}/login">Login to Maand</a>
  `;
  return sendEmail({ to: email, subject, html });
};
