export function reportReadyEmailTemplate({
  name,
  sessionTitle,
  reportUrl,
  pdfUrl,
  summary,
}: {
  name: string;
  sessionTitle: string;
  reportUrl: string;
  pdfUrl?: string;
  summary?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Your clinical report is ready — Maand</title></head>
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
            <div style="display:inline-block;background:#7c3aed1a;border:1px solid #7c3aed33;border-radius:12px;padding:8px 16px;margin-bottom:20px;">
              <span style="font-size:12px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.08em;">📄 Clinical Report Ready</span>
            </div>
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#f1f1f5;">Your session report is ready</h1>
            <p style="margin:0 0 8px;font-size:14px;color:#9090a8;">Session: <strong style="color:#f1f1f5;">${sessionTitle}</strong></p>
            ${summary ? `<div style="background:#252535;border-left:3px solid #7c3aed;border-radius:0 12px 12px 0;padding:16px 20px;margin:24px 0;"><p style="margin:0;font-size:14px;color:#c0c0d0;line-height:1.6;font-style:italic;">"${summary}"</p></div>` : ""}
            <p style="margin:0 0 24px;font-size:15px;color:#9090a8;line-height:1.6;">Your AI-generated clinical report is now available. It includes emotional trend analysis, key topics discussed, and personalised recommendations.</p>
            <a href="${reportUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;margin-right:12px;margin-bottom:12px;">View Report →</a>
            ${pdfUrl ? `<a href="${pdfUrl}" style="display:inline-block;background:#252535;border:1px solid #3a3a4a;color:#f1f1f5;text-decoration:none;padding:14px 24px;border-radius:12px;font-weight:700;font-size:15px;margin-bottom:12px;">⬇ Download PDF</a>` : ""}
            <p style="margin:24px 0 0;font-size:13px;color:#9090a8;">This report is for personal insight only and is not a substitute for professional clinical care.</p>
          </td>
        </tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #2a2a3a;"><p style="margin:0;font-size:12px;color:#505060;text-align:center;">© ${new Date().getFullYear()} Maand AI · All rights reserved</p></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
