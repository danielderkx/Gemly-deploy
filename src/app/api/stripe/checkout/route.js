import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Credits per price ID
const CREDITS_MAP = {
  'price_1TjyccIHappXpeB7OqkCa7J3': 10,  // Starter €6,99
  'price_1TjycyIHappXpeB7tPyIvj4l': 30,  // Plus €14,99
  'price_1TjydAIHappXpeB7IHIVpoXL': 100, // Pro €34,99
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
