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

    const { data: profile, error: profileError } = await supabase
      .from('StudentProfile')
      .select('stripe_connect_id')
      .eq('user_id', user.id) 
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
        throw profileError;
    }

    let accountId = profile?.stripe_connect_id;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'CZ',
        email: user.email,
        business_type: 'individual', 
        capabilities: {
          transfers: { requested: true },
        },
        business_profile: {
            name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim(),
            url: 'https://www.risehigh.io', 
            product_description: 'Student přijímající odměny za výzvy na RiseHigh',
        },
      });

      accountId = account.id;

      const { error: updateError } = await supabase
        .from('StudentProfile')
        .update({ stripe_connect_id: accountId })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating profile with stripe ID:', updateError);
        throw updateError;
      }
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile/edit?tab=payouts`, 
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile/edit?tab=payouts&connected=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error('Stripe Onboarding Error Full:', error);
    
    return NextResponse.json(
        { message: error instanceof Error ? error.message : 'Internal Server Error' },
        { status: 500 }
    );
  }
}