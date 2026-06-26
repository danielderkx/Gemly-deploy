import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Controleert server-side of de aanvrager is ingelogd met een toegestaan
// admin-e-mailadres (ADMIN_EMAIL, komma-gescheiden mogelijk). Faalt dicht:
// geen sessie of geen match -> geen toegang.
async function isAdmin() {
  const allow = (process.env.ADMIN_EMAIL || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  if (!allow.length) return false;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return !!user && allow.includes((user.email || '').toLowerCase());
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

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
