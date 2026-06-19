import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PACKAGES = {
  'price_1TjyccIHappXpeB7OqkCa7J3': { name: 'Starter', credits: 10 },  // €6,99
  'price_1TjycyIHappXpeB7tPyIvj4l': { name: 'Plus',    credits: 30 },  // €14,99
  'price_1TjydAIHappXpeB7IHIVpoXL': { name: 'Pro',     credits: 100 }, // €34,99
};

async function fulfillOrder(session) {
  const { user_id, credits, price_id } = session.metadata || {};
  const pkg = PACKAGES[price_id];

  if (!user_id || !credits || !pkg) {
    console.error('Missing metadata in session:', session.id);
    return { ok: false, status: 400, error: 'Missing metadata' };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Add credits to user profile
  const { error: creditError } = await supabase.rpc('increment_credits', {
    user_id_input: user_id,
    amount: parseInt(credits),
  });

  if (creditError) {
    console.error('Error adding credits:', creditError);
    return { ok: false, status: 500, error: 'Failed to add credits' };
  }

  // Log order
  await supabase.from('orders').insert({
    user_id,
    stripe_session_id: session.id,
    stripe_payment_intent: session.payment_intent,
    package_name: pkg.name,
    credits_added: parseInt(credits),
    amount_eur: session.amount_total / 100,
    status: 'completed',
  });

  console.log(`Credits added: ${credits} for user ${user_id}`);
  return { ok: true };
}

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Card / instant payments: session completed and already paid
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    if (session.payment_status === 'paid') {
      const result = await fulfillOrder(session);
      if (!result.ok) {
        return Response.json({ error: result.error }, { status: result.status });
      }
    } else {
      console.log(`Session ${session.id} completed but not yet paid (${session.payment_status}) — waiting for async confirmation`);
    }
  }

  // iDEAL / delayed methods: payment confirmed later
  if (event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object;
    const result = await fulfillOrder(session);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status });
    }
  }

  // Async payment failed: log only, no credits
  if (event.type === 'checkout.session.async_payment_failed') {
    const session = event.data.object;
    console.warn(`Async payment failed for session ${session.id}`);
  }

  return Response.json({ received: true });
}
