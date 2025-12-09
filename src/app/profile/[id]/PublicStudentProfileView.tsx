"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import SkillRadarChart from './components/SkillRadarChart';
import ProfilePortfolioSection from './components/ProfilePortfolioSection';
import ProfileSkillsSection from './components/ProfileSkillsSection';
import ProfileInfoCard from './components/ProfileInfoCard';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StudentProfile } from './types';
import LogoutButton from '@/components/auth/LogoutButton';

export default function PublicStudentProfileView({ profileId }: { profileId: string }) {
    const { user, profile: viewerProfile } = useAuth();
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
                const { data, error } = await supabase
                    .from('StudentProfile')
                    .select(`
                        user_id, 
                        first_name, 
                        last_name, 
                        username, 
                        bio, 
                        profile_picture_url,
                        university, 
                        field_of_study, 
                        level, 
                        xp,
                        github_url, 
                        linkedin_url,
                        dribbble_url, 
                        personal_website_url,
                        recruitment_status, 
                        StudentSkill (level, xp, Skill (name)),
                        StudentLanguage (Language (name)),
                        Submission ( rating, position, is_public_on_profile, Challenge (*, ChallengeSkill(Skill(name)), StartupProfile(company_name, logo_url)) )
                    `)
                    .eq('user_id', profileId)
                    .eq('Submission.is_public_on_profile', true)
                    .single();

                if (data) {
                    setProfile(data as unknown as StudentProfile);
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
        <div className="flex min-h-screen flex-col md:mx-20 2xl:mx-28 3xl:mx-32 py-4 md:py-32 px-4">
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
                <aside className="lg:col-span-1 space-y-3 sm:space-y-8 lg:top-28">
                    <ProfileInfoCard
                        profile={profile}
                        isOwner={isOwner}
                        viewerProfile={viewerProfile}
                    />
                    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-gray-100">
                        <h3 className="font-bold text-base sm:text-xl text-[var(--barva-tmava)] mb-2">Top dovednosti</h3>
                        <SkillRadarChart skills={skillsForChart} isOwner={isOwner} />
                    </div>
                </aside>
                <main className="lg:col-span-2 space-y-3 sm:space-y-8">
                    <ProfilePortfolioSection isOwner={isOwner} submissions={profile.Submission} />
                    <ProfileSkillsSection skills={profile.StudentSkill} languages={profile.StudentLanguage} isOwner={isOwner} />
                </main>
                {isOwner && <LogoutButton />}
            </div>
        </div>
    );
}