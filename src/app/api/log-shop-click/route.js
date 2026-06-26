import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Controleert server-side of de aanvrager is ingelogd met een toegestaan
// admin-e-mailadres (ADMIN_EMAIL). Faalt dicht.
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

// POST: log een klik op een shop-aanbeveling. BLIJFT OPEN — wordt aangeroepen
// vanuit de scanner door (ook niet-ingelogde) bezoekers.
export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { shop_name, shop_city, user_id, scan_query, source } = body || {};

  if (!shop_name || typeof shop_name !== 'string') {
    return NextResponse.json({ error: 'shop_name is required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('shop_clicks').insert({
    shop_name: shop_name.slice(0, 200),
    shop_city: shop_city ? String(shop_city).slice(0, 100) : null,
    user_id: user_id || null,
    scan_query: scan_query ? String(scan_query).slice(0, 300) : null,
    source: source ? String(source).slice(0, 50) : 'scan',
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// GET: analytics-overzicht. ALLEEN voor admins — bevat user_id's en zoekopdrachten.
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: clicks, error } = await supabaseAdmin
    .from('shop_clicks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const counts = {};
  for (const c of clicks || []) {
    counts[c.shop_name] = (counts[c.shop_name] || 0) + 1;
  }

  return NextResponse.json({
    total: (clicks || []).length,
    per_shop: Object.entries(counts)
      .map(([shop_name, count]) => ({ shop_name, count }))
      .sort((a, b) => b.count - a.count),
    recent: (clicks || []).slice(0, 20),
  });
}
