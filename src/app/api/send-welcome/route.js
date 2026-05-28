import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  const { email, name, credits, referralCode } = await request.json();
  await resend.emails.send({
    from: 'Gemly <onboarding@resend.dev>',
    to: email,
    subject: 'Welcome to Gemly',
    html: `
      <div style="font-family:'Outfit',sans-serif;max-width:520px;margin:0 auto;">
        <div style="background:#1A1612;padding:28px 36px;">
          <p style="font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#F5F0E8;margin:0;">Gemly</p>
        </div>
        <div style="padding:32px 36px;background:#fff;">
          <p style="font-size:14px;color:#7A7268;font-weight:300;margin:0 0 4px;">Hi ${name || 'there'},</p>
          <h1 style="font-size:22px;font-weight:300;color:#1A1612;margin:0 0 12px;">Welcome to Gemly.</h1>
          <p style="font-size:14px;color:#7A7268;line-height:1.7;font-weight:300;">You're all set. Start scanning items to find the best secondhand deals across marketplaces worldwide — in seconds.</p>
          <div style="display:inline-block;background:#F5F0E8;border:1px solid #E0DADA;border-radius:2px;padding:10px 18px;margin:4px 0 20px;">
            <span style="font-size:26px;font-weight:200;color:#1A1612;">${credits || 2}</span>
            <span style="font-size:11px;color:#9A9080;letter-spacing:.12em;text-transform:uppercase;margin-left:10px;">free scans</span>
          </div><br>
          <a href="https://gemly.org/scan" style="display:inline-block;background:#1A1612;color:#fff;font-size:11px;font-weight:400;letter-spacing:.16em;text-transform:uppercase;padding:12px 24px;border-radius:2px;text-decoration:none;margin:8px 0 20px;">Start scanning →</a>
          <hr style="border:none;border-top:1px solid #EDEAE4;margin:20px 0;">
          <p style="font-size:12px;color:#9A9080;line-height:1.6;font-weight:300;">Invite a friend and get 3 extra scans for free. Your referral link: <strong style="color:#1A1612;font-weight:400;">gemly.org/join?ref=${referralCode}</strong></p>
        </div>
        <div style="background:#F9F7F4;padding:16px 36px;border-top:1px solid #EDEAE4;">
          <p style="font-size:11px;color:#9A9080;margin:0;line-height:1.6;font-weight:300;">You're receiving this because you created a Gemly account. Questions? Reply to this email.</p>
        </div>
      </div>
    `,
  });
  return Response.json({ ok: true });
}
