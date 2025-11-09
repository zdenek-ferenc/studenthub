import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import ProfileView from './ProfileView' 

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


export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await props.params 

    const supabase = await createSupabaseServerClient()

    let title = 'Profil'
    let description = 'Profil uživatele na platformě RiseHigh.'


    const { data: user } = await supabase
        .from('User')
        .select('role')
        .eq('id', id)
        .single()

    if (user?.role === 'student') {
        const { data: student } = await supabase
        .from('StudentProfile')
        .select('first_name, last_name, bio')
        .eq('user_id', id)
        .single()
    if (student) {
        title = `${student.first_name || ''} ${student.last_name || ''}`.trim()
        description = student.bio || `Profil studenta ${title} na RiseHigh.`
    }
    } else if (user?.role === 'startup') {
    const { data: startup } = await supabase
        .from('StartupProfile')
        .select('company_name, description')
        .eq('user_id', id)
        .single()
    if (startup) {
        title = startup.company_name
        description =
        startup.description || `Profil startupu ${title} na RiseHigh.`
    }
    }

return { title, description }
}


export default function PublicProfilePage() {
    return <ProfileView />
}
