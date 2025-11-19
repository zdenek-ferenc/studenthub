import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const { challengeId, type } = session.metadata;

        if (type === 'fee') {
          await supabaseAdmin
            .from('Challenge')
            .update({
              entry_fee_paid: true,
              payment_status: 'fee_paid',
              stripe_fee_intent_id: session.payment_intent,
              status: 'active', 
            })
            .eq('id', challengeId);
        } else if (type === 'pool') {
          await supabaseAdmin
            .from('Challenge')
            .update({
              prize_pool_paid: true,
              payment_status: 'fully_paid',
            })
            .eq('id', challengeId);
        }
        break;
      }
      case 'account.updated': {
        const account = event.data.object as any;
        if (account.charges_enabled) {
          await supabaseAdmin
            .from('StudentProfile')
            .update({ charges_enabled: true })
            .eq('stripe_connect_id', account.id);
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }

  return new NextResponse('Received', { status: 200 });
}
