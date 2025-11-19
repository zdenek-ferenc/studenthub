import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
            }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { challengeId, paymentType } = body; 

    if (!challengeId || !paymentType) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const { data: challenge } = await supabase
      .from('Challenge')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (!challenge) {
      return new NextResponse('Challenge not found', { status: 404 });
    }

    let lineItems = [];
    let metadata = {
      challengeId,
      type: paymentType,
      userId: user.id,
    };

    if (paymentType === 'fee') {
      lineItems.push({
        price_data: {
          currency: 'czk',
          product_data: {
            name: 'Challenge Publishing Fee',
            description: 'Fee to publish a challenge on RiseHigh',
          },
          unit_amount: 100000, 
        },
        quantity: 1,
      });
    } else if (paymentType === 'pool') {
      
      const totalPrizeAmount = (challenge.reward_first_place || 0) + 
                               (challenge.reward_second_place || 0) + 
                               (challenge.reward_third_place || 0);

      if (totalPrizeAmount <= 0) {
        return new NextResponse('Prize amount is zero or invalid', { status: 400 });
      }

      lineItems.push({
        price_data: {
          currency: 'czk',
          product_data: {
            name: 'Challenge Prize Pool',
            description: `Prize pool for challenge: ${challenge.title || 'Untitled'}`,
          },
          unit_amount: totalPrizeAmount * 100, 
        },
        quantity: 1,
      });
    } else {
      return new NextResponse('Invalid payment type', { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      invoice_creation: {
        enabled: true,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/challenges/${challengeId}?payment_success=true&type=${paymentType}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/challenges/${challengeId}?payment_cancelled=true`,
      metadata: metadata,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
