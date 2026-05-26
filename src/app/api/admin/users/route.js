import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: profiles } = await supabaseAdmin.from('profiles').select('*');
  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));

  const merged = users.map(u => ({
    ...profileMap[u.id],
    id: u.id,
    email: u.email,
    full_name: u.user_metadata?.full_name || profileMap[u.id]?.full_name || null,
    country: u.user_metadata?.country || profileMap[u.id]?.country || null,
    created_at: u.created_at,
  }));

  return NextResponse.json({ users: merged });
}
