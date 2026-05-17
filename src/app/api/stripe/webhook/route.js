import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Use service role for webhook (no user session available)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature failed:', error.message);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Only handle successful payments
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.user_id;
    const creditsToAdd = parseInt(session.metadata?.credits || '0');

    if (!userId || !creditsToAdd) {
      console.error('Missing metadata:', session.metadata);
      return Response.json({ error: 'Missing metadata' }, { status: 400 });
    }

    // Get current credits
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Failed to fetch profile:', fetchError);
      return Response.json({ error: 'Profile not found' }, { status: 500 });
    }

    // Add credits
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: (profile.credits || 0) + creditsToAdd })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update credits:', updateError);
      return Response.json({ error: 'Update failed' }, { status: 500 });
    }

    console.log(`Added ${creditsToAdd} credits to user ${userId}`);
  }

  return Response.json({ received: true });
}
