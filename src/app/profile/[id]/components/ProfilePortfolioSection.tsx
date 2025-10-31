"use client";

import { Award } from 'lucide-react';
import ProfilePortfolioCard from './ProfilePortfolioCard';
import Link from 'next/link'; 

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

type Props = {
    submissions: Submission[];
    isOwner: boolean; 
};

export default function ProfilePortfolioSection({ submissions, isOwner }: Props) {
    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-gray-100">
            <h2 className="text-lg sm:text-xl  font-bold text-[var(--barva-tmava)] mb-4">Portfolio úspěchů</h2>
            {submissions && submissions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {submissions.map((sub, index) => (
                        <ProfilePortfolioCard key={sub.Challenge?.id || index} submission={sub} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-4 sm:py-10 text-gray-500">
                    <Award size={40} className="mx-auto text-gray-300 mb-3" />
                    {isOwner ? (
                        <>
                            <p className='text-sm sm:text-base'>Zatím jsi nezveřejnil/a žádné úspěchy.</p>
                            <p className="mt-3 text-xs font-light text-gray-400 sm:text-sm">Získej reference dokončením výzev!</p>
                            <Link href="/challenges" className="inline-block mt-4 px-6 py-2 rounded-full bg-[var(--barva-primarni)] text-white font-semibold cursor-pointer text-sm hover:opacity-90 transition-opacity">
                                Prohlédnout výzvy
                            </Link>
                        </>
                    ) : (
                        <p>Student zatím nezveřejnil žádné úspěchy.</p>
                    )}
                </div>
            )}
        </div>
    );
}