"use client";

import { Award } from 'lucide-react';
import ProfilePortfolioCard from './ProfilePortfolioCard';

type Submission = {
    rating: number | null;
    position: number | null;
    Challenge: {
        id: string;
        title: string;
        ChallengeSkill: { Skill: { name: string } }[];
        StartupProfile: {
            company_name: string;
            logo_url: string | null;
        } | null;
    } | null;
};

export default function ProfilePortfolioSection({ submissions }: { submissions: Submission[] }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
            <h2 className="text-xl font-bold text-[var(--barva-tmava)] mb-4">Portfolio úspěchů</h2>
            {submissions && submissions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {submissions.map((sub, index) => (
                        <ProfilePortfolioCard key={sub.Challenge?.id || index} submission={sub} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500">
                    <Award size={40} className="mx-auto text-gray-300 mb-3" />
                    <p>Student zatím nezveřejnil žádné úspěchy.</p>
                </div>
            )}
        </div>
    );
}