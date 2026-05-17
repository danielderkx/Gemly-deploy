import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Credits per price ID
const CREDITS_MAP = {
  'price_1TY4j5Iy2dxBbN1t9i4D39r6': 10,  // Starter €4,99
  'price_1TY4kbIy2dxBbN1tAvOpw9IT': 30,  // Plus €11,99
  'price_1TY4ljIy2dxBbN1tUdUGl47a': 100, // Pro €29,99
};

export async function POST(request) {
  try {
    const { priceId } = await request.json();

    if (!CREDITS_MAP[priceId]) {
      return Response.json({ error: 'Invalid price' }, { status: 400 });
    }

    // Get current user
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { cookies: { getAll: () => cookieStore.getAll() } }
    );

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/scan?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?payment=cancelled`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        credits: CREDITS_MAP[priceId],
        price_id: priceId,
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
