export function securityAlertTemplate({
  name,
  event,
  details,
  timestamp,
}: {
  name: string;
  event: "password_changed" | "login_new_device" | "2fa_enabled" | "2fa_disabled";
  details?: string;
  timestamp?: string;
}): string {
  const eventMessages: Record<string, { title: string; body: string; emoji: string }> = {
    password_changed: {
      title: "Your password was changed",
      body: "Your Maand account password was successfully updated. All other active sessions have been invalidated.",
      emoji: "🔑",
    },
    login_new_device: {
      title: "New sign-in detected",
      body: "Your account was accessed from a new device or location. If this was you, no action is needed.",
      emoji: "📍",
    },
    "2fa_enabled": {
      title: "Two-factor authentication enabled",
      body: "Two-factor authentication has been enabled on your account. Your account is now more secure.",
      emoji: "🛡️",
    },
    "2fa_disabled": {
      title: "Two-factor authentication disabled",
      body: "Two-factor authentication has been turned off. If you didn't do this, please re-enable it and change your password immediately.",
      emoji: "⚠️",
    },
  };

  const ev = eventMessages[event] || { title: "Security Event", body: details || "", emoji: "🔔" };
  const ts = timestamp || new Date().toUTCString();

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>${ev.title} — Maand</title></head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:48px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1a1a24;border-radius:24px;border:1px solid #2a2a3a;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:40px;"><span style="font-size:22px;font-weight:800;color:#fff;">Maand — Security Alert</span></td></tr>
        <tr>
          <td style="padding:40px;">
            <div style="font-size:36px;margin-bottom:16px;">${ev.emoji}</div>
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#f1f1f5;">${ev.title}</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#9090a8;line-height:1.6;">Hi ${name}, ${ev.body}</p>
            ${details ? `<p style="margin:0 0 16px;font-size:14px;color:#9090a8;">${details}</p>` : ""}
            <div style="background:#252535;border:1px solid #3a3a4a;border-radius:12px;padding:16px;">
              <p style="margin:0;font-size:12px;color:#6060748;">Time: <strong style="color:#f1f1f5;">${ts}</strong></p>
            </div>
            <p style="margin:24px 0 0;font-size:13px;color:#ef4444;">If you did not perform this action, please change your password immediately and contact support.</p>
          </td>
        </tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #2a2a3a;"><p style="margin:0;font-size:12px;color:#505060;text-align:center;">© ${new Date().getFullYear()} Maand AI</p></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
