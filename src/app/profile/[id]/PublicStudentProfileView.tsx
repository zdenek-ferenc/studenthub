"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import SkillRadarChart from './components/SkillRadarChart';
import ProfilePortfolioSection from './components/ProfilePortfolioSection';
import ProfileSkillsSection from './components/ProfileSkillsSection';
import { Github, Linkedin, Dribbble, Link as LinkIcon, Briefcase, GraduationCap, Edit, PlusCircle,ChevronLeft,Settings, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Skill = {
    name: string;
};

type Language = {
    name: string;
};

type ChallengeSkill = {
    Skill: Skill;
};

type StartupProfileInfo = {
    company_name: string;
    logo_url: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ChallengeInfo = {
    id: string;
    title: string;
    startup_id: string;
    ChallengeSkill: ChallengeSkill[];
    StartupProfile: StartupProfileInfo | null;
};

type Submission = {
    rating: number | null;
    position: number | null;
    Challenge: {
        id: string;
        title: string;
        startup_id: string; // <-- PŘIDEJ TENTO ŘÁDEK
        ChallengeSkill: { Skill: { name: string } }[];
        StartupProfile: {
            company_name: string;
            logo_url: string | null;
        } | null;
    } | null;
};

type StudentSkill = {
    level: number;
    xp: number;
    Skill: Skill;
};

type StudentLanguage = {
    Language: Language;
};

type StudentProfile = {
    first_name: string; last_name: string; username: string; bio: string | null; profile_picture_url: string | null;
    university: string | null; field_of_study: string | null; level: number; xp: number;
    github_url: string | null; linkedin_url: string | null;
    dribbble_url: string | null; personal_website_url: string | null;
    StudentSkill: StudentSkill[];
    StudentLanguage: StudentLanguage[];
    Submission: Submission[];
    recruitment_status: 'open_to_work' | 'not_looking' | null; // <-- KROK 2.2: PŘIDÁN TYP
};

const SocialLink = ({ href, Icon, label }: { href: string | null, Icon: React.ElementType, label: string }) => {
    if (!href) return null;
    const validHref = href.startsWith('http://') || href.startsWith('https://') ? href : `https://${href}`;
    return (
        <a href={validHref} target="_blank" rel="noopener noreferrer" title={label} className="text-gray-400 hover:text-[var(--barva-primarni)] transition-colors">
            <Icon size={24} />
        </a>
    );
};

// KROK 2.2: NOVÁ KOMPONENTA PRO ZOBRAZENÍ TAGU
const RecruitmentStatusTag = ({ status, isOwner, viewerRole }: { status: StudentProfile['recruitment_status'], isOwner: boolean, viewerRole: 'student' | 'startup' | null }) => {
    if (status === 'open_to_work') {
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs sm:text-sm font-semibold border border-green-200">
                <CheckCircle size={14} />
                Otevřený nabídkám
            </div>
        );
    }

    if (status === 'not_looking' && (isOwner || viewerRole === 'startup')) {
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs sm:text-sm font-semibold border border-gray-200">
                <XCircle size={14} />
                Momentálně nehledá
            </div>
        );
    }
    
    if (status === null && isOwner) {
         return (
             <Link href="/profile/edit?tab=personal" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-500 text-xs sm:text-sm font-medium border border-gray-200 hover:border-gray-400 transition-colors">
                <PlusCircle size={14} />
                Nastavit pracovní status
            </Link>
         );
    }

    return null;
}

const ProfileInfoCard = ({ profile, isOwner, viewerRole }: { profile: StudentProfile, isOwner: boolean, viewerRole: 'student' | 'startup' | null }) => {
    const { user, showToast } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [bioText, setBioText] = useState(profile?.bio || '');
    const [saving, setSaving] = useState(false);

    const handleSaveBio = async () => {
        if (!user) return;
        setSaving(true);
        const { error } = await supabase.from('StudentProfile').update({ bio: bioText }).eq('user_id', user.id);
        if (error) {
            showToast(`Chyba: ${error.message}`, 'error');
        } else {
            setIsEditing(false);
            showToast('Bio bylo úspěšně uloženo!', 'success');
        }
        setSaving(false);
    };

    const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`;
    const hasAnyLink = !!(profile.linkedin_url || profile.github_url || profile.dribbble_url || profile.personal_website_url);

    return (
        <div className="relative bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-gray-100">
            {isOwner && (
                <Link
                    href="/profile/edit"
                    title="Upravit profil"
                    className="absolute top-3 right-3 p-1.5 bg-gray-100 rounded-full text-gray-400 hover:bg-[var(--barva-primarni2)] hover:text-[var(--barva-primarni)] transition-colors z-10"
                >
                    <Settings size={16} />
                </Link>
            )}

            <div className="text-center">
                <div className="h-16 w-16 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 relative">
                    {profile.profile_picture_url ? (
                        <Image
                        src={profile.profile_picture_url}
                        alt={`Profilový obrázek ${profile.first_name} ${profile.last_name}`}
                        width={200}
                        height={200}
                        className="h-16 w-16 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-100"
                        key={profile.profile_picture_url}
                        />
                    ) : (
                        <div className="h-16 w-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-[var(--barva-primarni2)] to-[var(--barva-primarni2)]/70 text-[var(--barva-primarni)] flex items-center justify-center text-xl sm:text-4xl font-bold">
                        {initials}
                        </div>
                    )}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--barva-tmava)]">{profile.first_name} {profile.last_name}</h1>
                <p className="text-gray-500 text-sm sm:text-base">@{profile.username}</p>
                
                {/* KROK 2.2: VLOŽENÍ TAGU */}
                <div className="mt-3 h-8">
                    <RecruitmentStatusTag status={profile.recruitment_status} isOwner={isOwner} viewerRole={viewerRole} />
                </div>

                <div className="flex justify-center items-center gap-4 mt-2 sm:mt-4">
                    <SocialLink href={profile.linkedin_url} Icon={Linkedin} label="LinkedIn" />
                    <SocialLink href={profile.github_url} Icon={Github} label="GitHub" />
                    <SocialLink href={profile.dribbble_url} Icon={Dribbble} label="Dribbble" />
                    <SocialLink href={profile.personal_website_url} Icon={LinkIcon} label="Osobní web" />
                    {isOwner && (
                        <Link
                            href="/profile/edit?tab=links"
                            title="Upravit odkazy"
                            className="flex items-center gap-1 text-gray-400 hover:text-[var(--barva-primarni)] transition-colors"
                        >
                            <PlusCircle size={20} />
                            {!hasAnyLink && <span className="text-xs">(Přidat odkazy)</span>}
                        </Link>
                    )}
                </div>
            </div>
            <div className="text-sm space-y-4 mt-2 sm:mt-6 pt-4 border-t border-gray-100">
                <div className="text-gray-700">
                    {isEditing ? (
                        <div className="space-y-2">
                            <textarea
                                value={bioText}
                                onChange={(e) => setBioText(e.target.value)}
                                placeholder="Řekni něco o sobě, co tě zajímá, na čem pracuješ..."
                                className="w-full min-h-[100px] text-xs sm:text-sm rounded-lg border border-gray-200 bg-gray-50 p-2 focus:border-[var(--barva-primarni)] focus:ring-1 focus:ring-[var(--barva-primarni)] focus:outline-none"
                            />
                            <div className="flex items-center gap-2">
                                <button onClick={handleSaveBio} disabled={saving} className="text-sm font-semibold text-[var(--barva-primarni)] disabled:text-gray-400">{saving ? 'Ukládám...' : 'Uložit'}</button>
                                <button onClick={() => setIsEditing(false)} className="text-sm text-gray-500">Zrušit</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className={`text-xs sm:text-sm whitespace-pre-wrap ${!bioText ? 'text-gray-500' : ''}`}>
                                {bioText
                                    ? bioText 
                                    : isOwner
                                        ? "Přidej krátký popisek o sobě, aby startupy věděly, co tě zajímá a na čem pracuješ."
                                        : "Student o sobě zatím nic nenapsal." 
                                }
                            </p>
                            {isOwner && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className={`flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer font-semibold transition-colors mt-3 ${
                                        bioText
                                            ? 'text-gray-400 hover:text-[var(--barva-tmava)]' 
                                            : 'text-[var(--barva-primarni)] hover:opacity-80' 
                                    }`}
                                >
                                    <Edit size={12} />
                                    {bioText ? 'Upravit bio' : 'Přidat bio'}
                                </button>
                            )}
                        </>
                    )}
                </div>
                {profile.university && <div className="flex text-xs sm:text-sm items-center gap-3 text-gray-600 pt-4 border-t border-gray-100"><GraduationCap size={20} className="flex-shrink-0" /> <span>{profile.university}</span></div>}
                {profile.field_of_study && <div className="flex text-xs sm:text-sm items-center gap-3 text-gray-600"><Briefcase size={20} className="flex-shrink-0" /> <span>{profile.field_of_study}</span></div>}
            </div>
        </div>
    );
};

export default function PublicStudentProfileView({ profileId }: { profileId: string }) {
    const { user, profile: viewerProfile } = useAuth(); // KROK 2.2: Získáme profil diváka
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [hasFetched, setHasFetched] = useState(false);

    const isOwner = user?.id === profileId;

    useEffect(() => {
        setHasFetched(false);
        setProfile(null);
        setLoading(true);
    }, [profileId]);

    useEffect(() => {
        if (!hasFetched && profileId) {
            const fetchProfileData = async () => {
                // KROK 2.2: Upravíme dotaz, aby vždy obsahoval 'recruitment_status'
                const { data, error } = await supabase
                    .from('StudentProfile')
                    .select(`
                        *,
                        recruitment_status, 
                        StudentSkill (level, xp, Skill (name)),
                        StudentLanguage (Language (name)),
                        Submission ( rating, position, is_public_on_profile, Challenge (*, ChallengeSkill(Skill(name)), StartupProfile(company_name, logo_url)) )
                    `)
                    .eq('user_id', profileId)
                    .eq('Submission.is_public_on_profile', true)
                    .single();
                
                if (data) {
                    setProfile(data as StudentProfile);
                } else {
                    console.error("Nepodařilo se načíst data studenta:", error);
                }
                setLoading(false);
                setHasFetched(true);
            };
            fetchProfileData();
        }
    }, [profileId, hasFetched]);

    if (loading || !profile) {
        return <div className='pt-32'><LoadingSpinner /></div>;
    }

    const skillsForChart = profile.StudentSkill.map(s => ({
        name: s.Skill.name,
        level: s.level,
        xp: s.xp,
    }));

    return (
        <div className="flex flex-col md:mx-20 2xl:mx-28 3xl:mx-32 py-4 md:py-32 px-4">
            {!isOwner && (
                <button
                    onClick={() => router.back()}
                    className="flex items-center cursor-pointer gap-1 text-sm font-semibold text-gray-500 hover:text-[var(--barva-primarni)] transition-colors mb-4"
                >
                    <ChevronLeft size={16} />
                    Zpět na přehled
                </button>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-8 items-start">
                <aside className="lg:col-span-1 space-y-3 sm:space-y-8 lg:sticky lg:top-28">
                    <ProfileInfoCard 
                        profile={profile} 
                        isOwner={isOwner} 
                        viewerRole={
                            viewerProfile?.role === 'student' ? 'student' :
                            (viewerProfile?.role === 'startup' || viewerProfile?.role === 'admin') ? 'startup' :
                            null
                        }
                    />
                    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-gray-100">
                        <h3 className="font-bold text-lg sm:text-xl text-[var(--barva-tmava)] mb-2">Top dovednosti</h3>
                        <SkillRadarChart skills={skillsForChart} isOwner={isOwner} />
                    </div>
                </aside>
                <main className="lg:col-span-2 space-y-3 sm:space-y-8">
                    <ProfilePortfolioSection isOwner={isOwner} submissions={profile.Submission} />
                    <ProfileSkillsSection skills={profile.StudentSkill} languages={profile.StudentLanguage} isOwner={isOwner} />
                </main>
            </div>
        </div>
    );
}