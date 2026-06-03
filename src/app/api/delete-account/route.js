import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '').trim();

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verifieer het token en haal het echte user-id op (vertrouw geen client-id's)
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const userId = user.id;

    // Leg e-mail + naam vast VOORDAT we verwijderen.
    const email = user.email;
    const name =
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      null;

    // 1. Orders NIET verwijderen, maar anonimiseren: koppel ze los van de gebruiker.
    //    Bedrag en datum blijven bewaard voor je boekhouding/omzetadministratie.
    try {
      await supabaseAdmin.from('orders').update({ user_id: null }).eq('user_id', userId);
    } catch (e) {
      console.error('orders anonimiseren mislukt (non-fatal):', e?.message);
    }

    // 2. Profiel verwijderen (bevat persoonsgegevens zoals naam en zoekgeschiedenis).
    try {
      await supabaseAdmin.from('profiles').delete().eq('id', userId);
    } catch (e) {
      console.error('profiles delete mislukt (non-fatal):', e?.message);
    }

    // 3. Verwijder de échte auth-gebruiker — hierdoor kan er niet meer ingelogd worden.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // 4. Stuur de bevestigingsmail (mag het verwijderen niet blokkeren).
    if (email) {
      try {
        await resend.emails.send({
          from: 'Gemly <noreply@gemly.org>',
          to: email,
          subject: 'Your Gemly account has been deleted',
          html: `
            <div style="font-family:'Outfit',sans-serif;max-width:520px;margin:0 auto;">
              <div style="background:#1A1612;padding:28px 36px;">
                <p style="font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#F5F0E8;margin:0;">Gemly</p>
              </div>
              <div style="padding:32px 36px;background:#fff;">
                <p style="font-size:14px;color:#7A7268;font-weight:300;margin:0 0 4px;">Hi ${name || 'there'},</p>
                <h1 style="font-size:22px;font-weight:300;color:#1A1612;margin:0 0 12px;">Your account has been deleted.</h1>
                <div style="background:#FDF0EE;border:1px solid #E8C8C0;border-radius:2px;padding:12px 16px;margin-bottom:20px;font-size:13px;color:#8A3A30;line-height:1.5;font-weight:300;">Your account and all associated data have been permanently removed from Gemly. This cannot be undone.</div>
                <p style="font-size:14px;color:#7A7268;line-height:1.7;font-weight:300;">We're sorry to see you go. If you deleted your account by mistake, you're always welcome to create a new account.</p>
                <a href="https://gemly.org/login" style="display:inline-block;background:transparent;color:#8A3A30;font-size:11px;font-weight:400;letter-spacing:.16em;text-transform:uppercase;padding:12px 24px;border-radius:2px;border:1px solid #E8C8C0;text-decoration:none;margin:8px 0 20px;">Create a new account →</a>
                <hr style="border:none;border-top:1px solid #EDEAE4;margin:20px 0;">
                <p style="font-size:12px;color:#9A9080;line-height:1.6;font-weight:300;">If you didn't request this deletion, please contact us immediately by replying to this email.</p>
              </div>
              <div style="background:#F9F7F4;padding:16px 36px;border-top:1px solid #EDEAE4;">
                <p style="font-size:11px;color:#9A9080;margin:0;line-height:1.6;font-weight:300;">This is a transactional email sent because your Gemly account was deleted.</p>
              </div>
            </div>
          `,
        });
      } catch (e) {
        console.error('deletion email mislukt (non-fatal):', e?.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
