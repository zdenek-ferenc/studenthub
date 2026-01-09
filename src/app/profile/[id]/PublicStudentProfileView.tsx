"use client";

import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { StudentProfile } from './types';
import ModernProfileLayout from './components/ModernProfileLayout';
import ModernStudentHeader from './components/ModernStudentHeader';
import ModernSkillsWidget from './components/ModernSkillsWidget';
import ModernSkillRadarWidget from './components/ModernSkillRadarWidget';
import ModernPortfolioWidget from './components/ModernPortfolioWidget';
import { ChevronLeft } from 'lucide-react';

type Props = {
    profile: StudentProfile;
}

export default function PublicStudentProfileView({ profile }: Props) {
    const { user } = useAuth();
    const router = useRouter();
    const isOwner = user?.id === profile.user_id;

    const skillsForChart = profile.StudentSkill.map(s => ({
        name: s.Skill.name,
        level: s.level,
        xp: s.xp,
    }));

    return (
        <ModernProfileLayout>
            <div className="mb-2">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium group"
                >
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 group-hover:border-white/20 transition-all">
                        <ChevronLeft size={16} />
                    </div>
                    Zpět na přehled
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEVÝ SLOUPEC (Šířka 4/12) - Identita & Radar */}
                <div className="lg:col-span-4 space-y-6 flex flex-col lg:sticky lg:top-24">
                    
                    {/* 1. Identity Widget */}
                    <ModernStudentHeader profile={profile} isOwner={isOwner} />

                    {/* 2. Radar Graph (Analýza zaměření) */}
                    <ModernSkillRadarWidget skills={skillsForChart} isOwner={isOwner} />
                </div>

                {/* PRAVÝ SLOUPEC (Šířka 8/12) - Skills & Portfolio */}
                <div className="lg:col-span-8 space-y-6">
                     
                     {/* 3. Skills & Languages Widget (TEĎ ZDE, ŠIROKÝ) */}
                     <ModernSkillsWidget 
                        skills={profile.StudentSkill} 
                        languages={profile.StudentLanguage} 
                        isOwner={isOwner}
                     />

                     {/* 4. Portfolio Widget */}
                     <ModernPortfolioWidget 
                        submissions={profile.Submission} 
                        isOwner={isOwner} 
                     />
                </div>

            </div>
        </ModernProfileLayout>
    );
}