import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST: log een klik op een shop-aanbeveling
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

// GET: snel overzicht om te checken of het werkt (totalen per shop + laatste 20 kliks)
export async function GET() {
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
