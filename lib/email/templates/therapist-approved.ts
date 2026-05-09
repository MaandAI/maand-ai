export function therapistApprovedTemplate({
  name,
  loginUrl,
}: {
  name: string;
  loginUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Your therapist request was approved — Maand</title></head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:48px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1a1a24;border-radius:24px;border:1px solid #2a2a3a;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#059669,#047857);padding:40px;"><span style="font-size:22px;font-weight:800;color:#fff;">Maand</span></td></tr>
        <tr>
          <td style="padding:40px;">
            <div style="font-size:48px;margin-bottom:16px;">🎉</div>
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#f1f1f5;">Congratulations, ${name}!</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#9090a8;line-height:1.6;">Your application to join Maand as a licensed therapist has been reviewed and approved. You now have full access to the therapist dashboard.</p>
            <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#059669,#047857);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;">Access Therapist Dashboard →</a>
          </td>
        </tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #2a2a3a;"><p style="margin:0;font-size:12px;color:#505060;text-align:center;">© ${new Date().getFullYear()} Maand AI</p></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
