import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PACKAGES = {
  'price_1TYoLOIy2dxBbN1tDEDjrvAo': { name: 'Starter', credits: 10 },
  'price_1TYoMIIy2dxBbN1tMsacEGz0': { name: 'Plus',    credits: 30 },
  'price_1TY4ljIy2dxBbN1tUdUGl47a': { name: 'Pro',     credits: 100 },
};

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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { user_id, credits, price_id } = session.metadata;
    const pkg = PACKAGES[price_id];

    if (!user_id || !credits || !pkg) {
      console.error('Missing metadata in session:', session.id);
      return Response.json({ error: 'Missing metadata' }, { status: 400 });
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
      return Response.json({ error: 'Failed to add credits' }, { status: 500 });
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
  }

  return Response.json({ received: true });
}
