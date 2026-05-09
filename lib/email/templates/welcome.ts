export function welcomeEmailTemplate({
  name,
  loginUrl,
  tempPassword,
}: {
  name: string;
  loginUrl: string;
  tempPassword?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Maand</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f13;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:48px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1a1a24;border-radius:24px;border:1px solid #2a2a3a;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:40px 40px 32px;">
            <table width="100%"><tr>
              <td>
                <div style="display:inline-flex;align-items:center;gap:12px;">
                  <div style="width:44px;height:44px;background:rgba(255,255,255,0.15);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#fff;text-align:center;line-height:44px;">M</div>
                  <span style="font-size:22px;font-weight:800;color:#fff;">Maand</span>
                </div>
              </td>
            </tr></table>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:#f1f1f5;">Welcome, ${name}! 👋</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#9090a8;line-height:1.6;">Your Maand account is ready. You now have access to AI-powered therapeutic support, clinical insights, and personalised mental wellness tools.</p>
            ${
              tempPassword
                ? `<div style="background:#252535;border:1px solid #3a3a4a;border-radius:12px;padding:20px;margin:24px 0;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#7c3aed;">Temporary Password</p>
              <code style="font-size:20px;font-weight:800;color:#f1f1f5;letter-spacing:0.1em;">${tempPassword}</code>
              <p style="margin:12px 0 0;font-size:12px;color:#9090a8;">Please change this immediately after signing in.</p>
            </div>`
                : ""
            }
            <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;margin:8px 0 24px;">Get Started →</a>
            <p style="margin:0;font-size:13px;color:#6060748;line-height:1.6;">If you didn't create this account, please ignore this email or contact our support team.</p>
          </td>
        </tr>
        <!-- Footer -->
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
