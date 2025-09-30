"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import SkillRadarChart from './components/SkillRadarChart';
import ProfilePortfolioSection from './components/ProfilePortfolioSection';
import ProfileSkillsSection from './components/ProfileSkillsSection';
import { Github, Linkedin, Dribbble, Link as LinkIcon, Briefcase, GraduationCap, Edit, PlusCircle } from 'lucide-react';
import Link from 'next/link';

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

type ChallengeInfo = {
    id: string;
    title: string;
    ChallengeSkill: ChallengeSkill[];
    StartupProfile: StartupProfileInfo | null;
};

type Submission = {
    rating: number | null;
    position: number | null;
    Challenge: ChallengeInfo | null;
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
    first_name: string; last_name: string; username: string; bio: string | null;
    university: string | null; field_of_study: string | null; level: number; xp: number;
    github_url: string | null; linkedin_url: string | null;
    dribbble_url: string | null; personal_website_url: string | null;
    StudentSkill: StudentSkill[];
    StudentLanguage: StudentLanguage[];
    Submission: Submission[];
};

// --- SUB-KOMPONENTY ---
const SocialLink = ({ href, Icon, label }: { href: string | null, Icon: React.ElementType, label: string }) => {
    if (!href) return null;
    const validHref = href.startsWith('http://') || href.startsWith('https://') ? href : `https://${href}`;
    return (
        <a href={validHref} target="_blank" rel="noopener noreferrer" title={label} className="text-gray-400 hover:text-[var(--barva-primarni)] transition-colors">
            <Icon size={24} />
        </a>
    );
};

const ProfileInfoCard = ({ profile, isOwner }: { profile: StudentProfile, isOwner: boolean }) => {
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

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
            <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-[var(--barva-primarni2)] text-[var(--barva-primarni)] flex items-center justify-center text-4xl font-bold mx-auto mb-4">
                    {initials}
                </div>
                <h1 className="text-2xl font-bold text-[var(--barva-tmava)]">{profile.first_name} {profile.last_name}</h1>
                <p className="text-gray-500">@{profile.username}</p>
                <div className="flex justify-center items-center gap-4 mt-4">
                    <SocialLink href={profile.linkedin_url} Icon={Linkedin} label="LinkedIn" />
                    <SocialLink href={profile.github_url} Icon={Github} label="GitHub" />
                    <SocialLink href={profile.dribbble_url} Icon={Dribbble} label="Dribbble" />
                    <SocialLink href={profile.personal_website_url} Icon={LinkIcon} label="Osobní web" />
                    {isOwner && (
                        <Link href="/profile/edit?tab=links" title="Upravit odkazy" className="text-gray-400 hover:text-[var(--barva-primarni)] transition-colors">
                            <PlusCircle size={20} />
                        </Link>
                    )}
                </div>
            </div>
            <div className="text-sm space-y-4 mt-6 pt-4 border-t border-gray-100">
                <div className="text-gray-700">
                    {isEditing ? (
                        <div className="space-y-2">
                            <textarea
                                value={bioText}
                                onChange={(e) => setBioText(e.target.value)}
                                placeholder="Řekni něco o sobě..."
                                className="w-full min-h-[100px] text-sm rounded-lg border border-gray-200 bg-gray-50 p-2 focus:border-[var(--barva-primarni)] focus:ring-1 focus:ring-[var(--barva-primarni)] focus:outline-none"
                            />
                            <div className="flex items-center gap-2">
                                <button onClick={handleSaveBio} disabled={saving} className="text-sm font-semibold text-[var(--barva-primarni)] disabled:text-gray-400">{saving ? 'Ukládám...' : 'Uložit'}</button>
                                <button onClick={() => setIsEditing(false)} className="text-sm text-gray-500">Zrušit</button>
                            </div>
                        </div>
                    ) : (
                        <p className="whitespace-pre-wrap">{bioText || (isOwner && "Zatím nemáš žádné bio. Kliknutím ho můžeš přidat.")}</p>
                    )}
                    {isOwner && !isEditing && (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-[var(--barva-primarni)] transition-colors mt-3">
                            <Edit size={12} /> Upravit bio
                        </button>
                    )}
                </div>
                {profile.university && <div className="flex items-center gap-3 text-gray-600 pt-4 border-t border-gray-100"><GraduationCap size={20} className="flex-shrink-0" /> <span>{profile.university}</span></div>}
                {profile.field_of_study && <div className="flex items-center gap-3 text-gray-600"><Briefcase size={20} className="flex-shrink-0" /> <span>{profile.field_of_study}</span></div>}
            </div>
        </div>
    );
};

export default function PublicStudentProfileView({ profileId }: { profileId: string }) {
    const { user } = useAuth();
    const [profile, setProfile] = useState<StudentProfile | null>(null);
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
                const { data, error } = await supabase
                    .from('StudentProfile')
                    .select(`
                        *,
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
        return <LoadingSpinner />;
    }

    const skillsForChart = profile.StudentSkill.map(s => ({
        name: s.Skill.name,
        level: s.level,
        xp: s.xp,
    }));

    return (
        <div className="container mx-auto py-5 md:py-32 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <aside className="lg:col-span-1 space-y-8 lg:sticky lg:top-28">
                    <ProfileInfoCard profile={profile} isOwner={isOwner} />
                    <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
                        <h3 className="font-bold text-lg text-[var(--barva-tmava)] mb-2">Top dovednosti</h3>
                        <SkillRadarChart skills={skillsForChart} />
                    </div>
                </aside>
                <main className="lg:col-span-2 space-y-8">
                    <ProfilePortfolioSection submissions={profile.Submission} />
                    <ProfileSkillsSection skills={profile.StudentSkill} languages={profile.StudentLanguage} isOwner={isOwner} />
                </main>
            </div>
        </div>
    );
}