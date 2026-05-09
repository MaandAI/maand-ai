export function passwordResetEmailTemplate({
  name,
  resetUrl,
  expiresInMinutes = 60,
}: {
  name: string;
  resetUrl: string;
  expiresInMinutes?: number;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Reset your Maand password</title></head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:48px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1a1a24;border-radius:24px;border:1px solid #2a2a3a;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:40px 40px 32px;">
            <span style="font-size:22px;font-weight:800;color:#fff;">Maand</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <div style="width:56px;height:56px;background:#7c3aed1a;border-radius:16px;margin-bottom:24px;display:flex;align-items:center;justify-content:center;">
              🔐
            </div>
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#f1f1f5;">Reset your password</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#9090a8;line-height:1.6;">Hi ${name}, we received a request to reset your Maand account password. Click the button below to choose a new one.</p>
            <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;margin-bottom:24px;">Reset Password →</a>
            <div style="background:#252535;border:1px solid #3a3a4a;border-radius:12px;padding:16px;margin-top:16px;">
              <p style="margin:0;font-size:13px;color:#9090a8;">⏱ This link expires in <strong style="color:#f1f1f5;">${expiresInMinutes} minutes</strong>. If you didn't request a reset, you can safely ignore this email — your password won't change.</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #2a2a3a;">
            <p style="margin:0;font-size:12px;color:#505060;text-align:center;">© ${new Date().getFullYear()} Maand AI · All rights reserved</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
