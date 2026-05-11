export function emailVerificationTemplate({
  name,
  otp,
  email,
}: {
  name: string;
  otp: string;
  email: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Verify your email — Maand</title></head>
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
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#f1f1f5;">Verify your email</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#9090a8;line-height:1.6;">Hi ${name}, please use the code below to verify your email address (<strong style="color:#f1f1f5;">${email}</strong>).</p>
            
            <div style="background:#252535;border:1px solid #3a3a4a;border-radius:16px;padding:32px;margin:24px 0;text-align:center;">
              <span style="font-family:'Courier New',Courier,monospace;font-size:48px;font-weight:900;letter-spacing:8px;color:#fff;display:block;">${otp}</span>
            </div>

            <p style="margin:0 0 16px;font-size:13px;color:#9090a8;">⚠️ This code expires in <strong style="color:#f1f1f5;">10 minutes</strong>. If you didn't request this code, please ignore this email.</p>
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

export function emailChangeNotificationTemplate({
  name,
  oldEmail,
  newEmail,
}: {
  name: string;
  oldEmail: string;
  newEmail: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Email address changed — Maand</title></head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:48px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1a1a24;border-radius:24px;border:1px solid #2a2a3a;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:40px;"><span style="font-size:22px;font-weight:800;color:#fff;">Maand — Security Notice</span></td></tr>
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#f1f1f5;">Your email was changed</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#9090a8;line-height:1.6;">Hi ${name}, the email address for your Maand account has been changed from <strong style="color:#f1f1f5;">${oldEmail}</strong> to <strong style="color:#f1f1f5;">${newEmail}</strong>.</p>
            <p style="margin:0;font-size:14px;color:#ef4444;">If you did not make this change, please contact our support team immediately.</p>
          </td>
        </tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #2a2a3a;"><p style="margin:0;font-size:12px;color:#505060;text-align:center;">© ${new Date().getFullYear()} Maand AI</p></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
