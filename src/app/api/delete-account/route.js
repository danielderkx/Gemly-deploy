import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const { userId } = await request.json();
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  // Verwijder profile eerst
  await supabaseAdmin.from('profiles').delete().eq('id', userId);

  // Verwijder auth user (heeft service role key nodig)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
