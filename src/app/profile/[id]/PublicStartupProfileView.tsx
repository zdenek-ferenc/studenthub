"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import IdealCandidateCard from './components/IdealCandidateCard';
import StartupQnA from './components/StartupQnA';
import StartupProfileChallengeCard from './components/StartupProfileChallengeCard';
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, Edit, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Skill = { id: string; name: string; };
type Technology = { name: string; };
type Category = { name: string; };
type Challenge = {
    id: string;
    title: string;
    status: 'open' | 'closed';
    deadline: string;
    ChallengeSkill: { Skill: Skill }[];
};
type StartupProfile = {
    user_id: string;
    company_name: string;
    description: string | null;
    vision: string | null;
    website: string | null;
    logo_url: string | null;
    ideal_candidate_description: string | null;
    StartupCategory: { Category: Category }[];
    StartupTechnology: { Technology: Technology }[];
    Challenge: Challenge[];
};



const StartupInfoCard = ({ profile, isOwner }: { profile: StartupProfile, isOwner: boolean }) => {
    const { user, showToast } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [descriptionText, setDescriptionText] = useState(profile?.description || '');
    const [saving, setSaving] = useState(false);

    const websiteUrl: string | undefined = profile.website 
    ? (profile.website.startsWith('http') 
    ? profile.website 
    : `https://${profile.website}`) 
    : undefined;

    const handleSaveDescription = async () => {
        if (!user) return;
        setSaving(true);
        const { error } = await supabase.from('StartupProfile').update({ description: descriptionText }).eq('user_id', user.id);
        if (error) {
            showToast(`Chyba: ${error.message}`, 'error');
        } else {
            setIsEditing(false);
            showToast('Popis byl úspěšně uložen!', 'success');
        }
        setSaving(false);
    };

    return (
        <div className="bg-white p-4 3xl:p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col gap-2">
            <div className="flex items-start justify-start gap-4">
                <div>
                    <Image src={profile.logo_url || '/logo.svg'} alt={`${profile.company_name} logo`} width={96} height={96}
                    className="w-16 h-16 3xl:w-20 3xl:h-20 rounded-2xl mx-auto mb-2 sm:mb-4 object-contain"
                />
                </div>
                
                <div>
                    <h1 className="text-xl 3xl:text-2xl font-bold text-[var(--barva-tmava)]">{profile.company_name}</h1>
                    {websiteUrl && (
                    <a 
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--barva-primarni)] hover:underline break-all"
                    >
                        {profile.website}
                    </a>
                )}
                </div>
                
            </div>
            <div className="">
                {isEditing ? (
                    <div className="space-y-2">
                        <textarea value={descriptionText} onChange={(e) => setDescriptionText(e.target.value)} placeholder="Popište vaši firmu..."
                            className="w-full min-h-[120px] text-[10px] 3xl:text-sm rounded-lg border text-[var(--barva-tmava)] border-gray-200 bg-gray-50 p-2 focus:border-[var(--barva-primarni)] focus:ring-1 focus:ring-[var(--barva-primarni)] focus:outline-none"
                        />
                        <div className="flex items-center gap-2">
                            <button onClick={handleSaveDescription} disabled={saving} className="text-sm font-semibold text-[var(--barva-primarni)] disabled:text-gray-400">{saving ? 'Ukládám...' : 'Uložit'}</button>
                            <button onClick={() => setIsEditing(false)} className="text-sm text-gray-500">Zrušit</button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-800 whitespace-pre-wrap 3xl:text-base text-[13px]">{descriptionText || (isOwner && "Zatím nemáte žádný popis. Kliknutím ho můžete přidat.")}</p>
                )}
                {isOwner && !isEditing && (
                    <button onClick={() => setIsEditing(true)} className="flex items-center cursor-pointer gap-1.5 text-xs 3xl:text-sm font-semibold text-gray-400 hover:text-[var(--barva-primarni)] transition-colors mt-3">
                        <Edit size={12} /> Upravit popis
                    </button>
                )}
            </div>
        </div>
    );
};

export default function PublicStartupProfileView({ profileId }: { profileId: string }) {
    const { user, profile: viewerProfile } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<StartupProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [studentSkillIds, setStudentSkillIds] = useState<string[]>([]);
    const [appliedChallengeIds, setAppliedChallengeIds] = useState<string[]>([]);
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
                const { data: profileData, error: profileError } = await supabase
                    .from('StartupProfile')
                    .select(`
                        *,
                        StartupCategory (Category (name)),
                        StartupTechnology (Technology (name)),
                        Challenge (id, title, status, deadline, ChallengeSkill(Skill(id, name)))
                    `)
                    .eq('user_id', profileId)
                    .single();

                if (profileData) {
                    setProfile(profileData as StartupProfile);
                } else {
                    console.error("Nepodařilo se načíst data startupu:", profileError);
                }

                if (viewerProfile?.role === 'student' && user) {
                    const [skillData, submissionData] = await Promise.all([
                        supabase.from('StudentSkill').select('skill_id').eq('student_id', user.id),
                        supabase.from('Submission').select('challenge_id').eq('student_id', user.id)
                    ]);
                    if (skillData.data) setStudentSkillIds(skillData.data.map(s => s.skill_id));
                    if (submissionData.data) setAppliedChallengeIds(submissionData.data.map(s => s.challenge_id));
                }
                setLoading(false);
                setHasFetched(true);
            };
            fetchProfileData();
        }
    }, [profileId, hasFetched, user, viewerProfile]);
    
    if (loading || !profile) {
        return <div className='pt-32'><LoadingSpinner /></div>;
    }

    const now = new Date();
    const activeChallenges = profile.Challenge.filter(c => c.status === 'open' && new Date(c.deadline) >= now);
    
    const hasIdealCandidateInfo = !!profile.ideal_candidate_description || profile.StartupTechnology.length > 0;
    
    const showIdealCandidateSection = hasIdealCandidateInfo || isOwner;

    return (
        <div className="flex flex-col md:mx-20 2xl:mx-28 3xl:mx-32 py-5 md:py-28 3xl:py-32 px-4">
            {!isOwner && (
                <button
                    onClick={() => router.back()}
                    className="flex items-center cursor-pointer gap-1 text-sm font-semibold text-gray-500 hover:text-[var(--barva-primarni)] transition-colors mb-4"
                >
                    <ChevronLeft size={16} />
                    Zpět na přehled
                </button>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 3xl:gap-6 items-start">
                <aside className="lg:col-span-1 space-y-3 sm:space-y-5 3xl:space-y-6 lg:top-28">
                    <StartupInfoCard profile={profile} isOwner={isOwner} />
                    <div className="bg-white p-4 3xl:p-6 rounded-2xl shadow-xs border border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-lg text-[var(--barva-tmava)]">Kategorie</h3>
                            {isOwner && (
                                <Link href="/profile/edit?tab=categories" title="Upravit kategorie" className="text-gray-400 hover:text-[var(--barva-primarni)] transition-colors">
                                    <PlusCircle size={20} />
                                </Link>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {profile.StartupCategory.map((cat, i) => (
                                <span key={i} className="3xl:px-3 px-2 py-1 3xl:py-1.5 bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)] border border-[var(--barva-primarni)] rounded-lg text-xs 3xl:text-sm font-medium">
                                    {cat.Category.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </aside>

                <main className="lg:col-span-2 space-y-3 sm:space-y-5 3xl:space-y-6">
                    {showIdealCandidateSection && (
                        <div className="relative">
                            {isOwner && hasIdealCandidateInfo && (
                                <Link href="/profile/recruitment" className="absolute -top-2 -right-2 p-1.5 bg-white rounded-full shadow border text-gray-400 hover:text-[var(--barva-primarni)] transition-colors z-10">
                                    <Edit size={16} />
                                </Link>
                            )}
                            <IdealCandidateCard 
                                description={profile.ideal_candidate_description} 
                                technologies={profile.StartupTechnology}
                                isOwner={isOwner}
                                hasData={hasIdealCandidateInfo}
                            />
                        </div>
                    )}
                    {activeChallenges.length > 0 && (
                        <div className="bg-white p-4 3xl:p-6 rounded-2xl shadow-xs border border-gray-100">
                            <h2 className="text-lg 3xl:text-2xl font-bold text-[var(--barva-tmava)] mb-4">Aktivní výzvy</h2>
                            <div className="space-y-3">
                                {activeChallenges.map(challenge => (
                                    <StartupProfileChallengeCard 
                                        key={challenge.id} 
                                        challenge={challenge} 
                                        studentSkillIds={studentSkillIds}
                                        appliedChallengeIds={appliedChallengeIds}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="relative">
                        {isOwner && (
                            <Link href="/profile/recruitment?tab=qna" className="absolute -top-2 -right-2 p-1.5 bg-white rounded-full shadow border text-gray-400 hover:text-[var(--barva-primarni)] transition-colors z-10">
                                <Edit size={16} />
                            </Link>
                        )}
                        <StartupQnA startupId={profile.user_id} />
                    </div>
                </main>
            </div>
        </div>
    );
}