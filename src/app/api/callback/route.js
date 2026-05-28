import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const user = data.user;
      const isNewUser = new Date(user.created_at).getTime() > Date.now() - 10000;

      if (isNewUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits, referral_code')
          .eq('id', user.id)
          .single();

        await fetch(`${origin}/api/send-welcome`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.user_metadata?.full_name || '',
            credits: profile?.credits || 2,
            referralCode: profile?.referral_code || '',
          }),
        });
      }
    }
  }

  return NextResponse.redirect(`${origin}/scan`);
}
