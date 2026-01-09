import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import ProfileView from './ProfileView'
import { StudentProfile, StartupProfile} from './types'

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
                set() {
                    // Read-only on server component
                },
                remove() {
                   // Read-only on server component
                },
            },
        }
    )
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await props.params
    const supabase = await createSupabaseServerClient()
    
    const { data: user } = await supabase.from('User').select('role').eq('id', id).single()

    let title = 'Profil'
    let description = 'Profil uživatele na platformě RiseHigh.'

    if (user?.role === 'student') {
        const { data } = await supabase.from('StudentProfile').select('first_name, last_name, bio').eq('user_id', id).single()
        if (data) {
            title = `${data.first_name || ''} ${data.last_name || ''}`.trim()
            description = data.bio || `Profil studenta ${title}.`
        }
    } else if (user?.role === 'startup') {
        const { data } = await supabase.from('StartupProfile').select('company_name, description').eq('user_id', id).single()
        if (data) {
            title = data.company_name
            description = data.description || `Profil startupu ${title}.`
        }
    }
    return { title, description }
}

export default async function PublicProfilePage(props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params
    const supabase = await createSupabaseServerClient()

    // 1. Zjistíme roli profilu a kdo se dívá (viewer)
    const [userRes, viewerRes] = await Promise.all([
        supabase.from('User').select('role').eq('id', id).single(),
        supabase.auth.getUser()
    ])

    const profileRole = userRes.data?.role
    const viewerUser = viewerRes.data?.user

    let studentProfile: StudentProfile | null = null
    let startupProfile: StartupProfile | null = null
    const viewerData = {
        skillIds: [] as string[],
        appliedChallengeIds: [] as string[]
    }

    // 2. Načteme detailní data profilu
    if (profileRole === 'student') {
        const { data } = await supabase
            .from('StudentProfile')
            .select(`
                *,
                StudentSkill (level, xp, skill_id, Skill (id, name)), 
                StudentLanguage (Language (name)),
                Submission ( 
                    rating, position, is_public_on_profile, challenge_id,
                    Challenge (*, ChallengeSkill(Skill(name)), StartupProfile(company_name, logo_url)) 
                )
            `)
            .eq('user_id', id)
            .single()
        
        // Poznámka: Zde jsem přidal "id" do Skill (id, name), aby to sedělo s novým typem.

        if (data) {
            studentProfile = data as unknown as StudentProfile
        }

    } else if (profileRole === 'startup') {
        const { data } = await supabase
            .from('StartupProfile')
            .select(`
                *,
                StartupCategory (Category (name)),
                StartupTechnology (Technology (name)),
                Challenge (id, title, status, deadline, startup_id, ChallengeSkill(Skill(id, name)))
            `)
            .eq('user_id', id)
            .single()
        
        startupProfile = data as unknown as StartupProfile

        // 3. Pokud se student dívá na startup, načteme jeho kontext (shoda skills)
        if (viewerUser) {
            const { data: vSkills } = await supabase.from('StudentSkill').select('skill_id').eq('student_id', viewerUser.id)
            const { data: vSubs } = await supabase.from('Submission').select('challenge_id').eq('student_id', viewerUser.id)
            
            if (vSkills) viewerData.skillIds = vSkills.map(s => s.skill_id)
            if (vSubs) viewerData.appliedChallengeIds = vSubs.map(s => s.challenge_id)
        }
    }

    if (!profileRole) {
        return <div className="text-center py-20 text-white">Profil nenalezen.</div>
    }

    return (
        <ProfileView 
            profileId={id}
            role={profileRole as 'student' | 'startup'}
            studentData={studentProfile}
            startupData={startupProfile}
            viewerData={viewerData}
        />
    )
}