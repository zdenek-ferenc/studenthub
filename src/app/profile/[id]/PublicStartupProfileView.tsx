"use client";

import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import IdealCandidateCard from './components/IdealCandidateCard';
import StartupQnA from './components/StartupQnA';
import StartupProfileChallengeCard from './components/StartupProfileChallengeCard';
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, Edit, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LogoutButton from '@/components/auth/LogoutButton';
import { StartupProfile } from './types';

// Zde musíme nechat StartupInfoCard, protože obsahuje interaktivní editaci
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
        <div className="bg-white pt-4 px-4 lg:p-4 3xl:p-6 rounded-2xl lg:shadow-xs lg:border lg:border-gray-100 flex flex-col gap-2">
            <div className="flex items-start justify-start gap-4">
                <div>
                    {profile.logo_url ? (
                        <Image 
                            src={profile.logo_url} 
                            alt={`${profile.company_name} logo`} 
                            width={96} 
                            height={96}
                            className="w-12 h-12 sm:w-16 sm:h-16 3xl:w-20 3xl:h-20 rounded-full mx-auto lg:mb-4 object-contain"
                        />
                    ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 3xl:w-20 3xl:h-20 rounded-full mx-auto mb-2 lg:mb-4 bg-gradient-to-b from-[var(--barva-primarni2)] to-[var(--barva-primarni2)]/70 text-[var(--barva-primarni)] flex items-center justify-center text-lg sm:text-xl 3xl:text-2xl font-bold">
                            {profile.company_name
                                .split(' ')
                                .map(word => word[0])
                                .filter(Boolean)
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                        </div>
                    )}
                </div>
                
                <div>
                    <h1 className="text-lg sm:text-xl 3xl:text-2xl font-bold text-[var(--barva-tmava)]">{profile.company_name}</h1>
                    {websiteUrl && (
                    <a 
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--barva-primarni)] text-sm sm:text-base hover:underline break-all"
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
                            <button onClick={handleSaveDescription} disabled={saving} className="text-sm cursor-pointer font-semibold text-[var(--barva-primarni)] disabled:text-gray-400">{saving ? 'Ukládám...' : 'Uložit'}</button>
                            <button onClick={() => setIsEditing(false)} className="text-sm cursor-pointer text-gray-500">Zrušit</button>
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

type Props = {
    profile: StartupProfile;
    viewerContext: {
        skillIds: string[];
        appliedChallengeIds: string[];
    }
}

export default function PublicStartupProfileView({ profile, viewerContext }: Props) {
    const { user } = useAuth();
    const router = useRouter();

    const isOwner = user?.id === profile.user_id;
    const { skillIds: studentSkillIds, appliedChallengeIds } = viewerContext;

    const now = new Date();
    const activeChallenges = profile.Challenge.filter(c => c.status === 'open' && new Date(c.deadline) >= now);
    
    const hasIdealCandidateInfo = !!profile.ideal_candidate_description || profile.StartupTechnology.length > 0;
    const showIdealCandidateSection = hasIdealCandidateInfo || isOwner;

    return (
        <div className="flex flex-col md:mx-20 min-h-screen 2xl:mx-28 3xl:mx-32 py-3 md:py-28 3xl:py-32 px-4">
            {!isOwner && (
                <button
                    onClick={() => router.back()}
                    className="flex items-center cursor-pointer gap-1 text-xs sm:text-sm font-semibold text-gray-500 hover:text-[var(--barva-primarni)] transition-colors mb-3 sm:mb-4"
                >
                    <ChevronLeft size={16} />
                    Zpět na přehled
                </button>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 3xl:gap-6 items-start">
                <aside className="lg:col-span-1 bg-white lg:bg-transparent space-y-3 lg:space-y-3 3xl:space-y-6 lg:top-28 rounded-2xl">
                    <StartupInfoCard profile={profile} isOwner={isOwner} />
                    <div className="bg-white p-4 pt-0 lg:pt-6 xl:p-6 rounded-2xl lg:shadow-xs lg:border lg:border-gray-100">
                        <div className="lg:block flex justify-between items-center mb-3">
                            <h3 className="hidden lg:flex font-bold text-lg text-[var(--barva-tmava)]">Kategorie</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {profile.StartupCategory.map((cat, i) => (
                                <span key={i} className="3xl:px-3 px-2 py-1 3xl:py-1.5 bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)] border border-[var(--barva-primarni)] rounded-lg text-xs 3xl:text-sm font-medium">
                                    {cat.Category.name}
                                </span>
                            ))}
                            {isOwner && (
                                <Link href="/profile/edit?tab=categories" title="Upravit kategorie" className="text-gray-400 hover:text-[var(--barva-primarni)] transition-colors">
                                    <PlusCircle size={20} />
                                </Link>
                            )}
                        </div>
                    </div>
                </aside>

                <main className="lg:col-span-2 space-y-3 sm:space-y-3 3xl:space-y-6">
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
            {isOwner && (
                <div className='md:hidden mt-6'>
                    <LogoutButton />
                </div>
            )}
        </div>
    );
}