import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import ChallengeDetailView from './ChallengeDetailView' 


async function createSupabaseServerClient() {
    const cookieStore = await cookies() 
    return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
                cookieStore.set({ name, value, ...options })
            },
            remove(name: string, options: CookieOptions) {
                cookieStore.set({ name, value: '', ...options })
            },
        },
    }
)
}

type Props = {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params 

    const supabase = await createSupabaseServerClient()

    const { data: challenge } = await supabase
        .from('Challenge')
        .select('title, short_description')
        .eq('id', id)
        .single()

    if (!challenge) {
        return {
            title: 'Výzva nenalezena',
        }
    }

    return {
        title: challenge.title,
        description: challenge.short_description || 'Detail výzvy na RiseHigh.',
    }
}


export default function ChallengeDetailPage() {
    return <ChallengeDetailView />
}