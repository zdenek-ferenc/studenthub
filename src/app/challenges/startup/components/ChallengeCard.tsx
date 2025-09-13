"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';
import DeadlineTag from '../../../../components/DeadlineTag';

type Skill = {
    id: string;
    name: string;
};

type Challenge = {
    id: string;
    title: string;
    short_description: string | null;
    reward_first_place: number | null;
    reward_second_place: number | null;
    reward_third_place: number | null;
    deadline: string | null;
    created_at: string;
    max_applicants: number | null;
    ChallengeSkill: { Skill: Skill }[];
    Submission: { id: string, status: string }[];
};

const formatDateRange = (start: string, end: string | null) => {
    if (!end) return 'Nespecifikováno';
    const startDate = new Date(start).toLocaleDateString('cs-CZ');
    const endDate = new Date(end).toLocaleDateString('cs-CZ');
    return `${startDate} – ${endDate}`;
};

const StatItem = ({ iconSrc, text }: { iconSrc: string, text: ReactNode }) => (
    <div className="flex items-center gap-2 text-[var(--barva-tmava)] leading-none">
        <Image src={iconSrc} alt="" width={20} height={20} />
        <span className="text-md leading-none">{text}</span>
    </div>
);

export default function ChallengeCard({ challenge }: { challenge: Challenge }) {
    const applicantCount = challenge.Submission.length;
    const completedCount = challenge.Submission.filter(s => s.status === 'submitted').length;
    const totalBudget = (challenge.reward_first_place || 0) + (challenge.reward_second_place || 0) + (challenge.reward_third_place || 0);

    // --- NOVÁ LOGIKA PRO UPOZORNĚNÍ ---
    const isPastDeadline = challenge.deadline ? new Date() > new Date(challenge.deadline) : false;
    const hasSubmissions = challenge.Submission.length > 0;
    // Zjistíme, jestli existuje alespoň jedno řešení, které ještě nebylo ohodnoceno (není 'winner', 'rejected' atd.)
    const hasUnreviewedSubmissions = challenge.Submission.some(
        s => s.status === 'applied' || s.status === 'submitted'
    );
    // Pokud je po termínu a existují neohodnocená řešení, karta vyžaduje pozornost
    const needsAttention = isPastDeadline && hasSubmissions && hasUnreviewedSubmissions;

    return (
        // --- ZMĚNA ZDE: Přidání podmíněného stylu pro rámeček ---
        <div className={`bg-white p-6 rounded-2xl shadow-xs flex flex-col h-full hover:shadow-xl transition-all duration-300
            ${needsAttention 
                ? 'border-2 border-red-500 ring-4 ring-red-50' // Styl pro upozornění
                : 'border border-gray-100'                      // Standardní styl
            }`}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-2xl text-[var(--barva-tmava)] pr-2">{challenge.title}</h3>
                <div className="flex-shrink-0">
                    {/* Pokud je potřeba akce, zobrazíme speciální tag, jinak standardní odpočet */}
                    {needsAttention ? (
                         <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-red-100 text-red-700">
                            <span>Vyžaduje hodnocení</span>
                        </div>
                    ) : (
                        <DeadlineTag deadline={challenge.deadline} />
                    )}
                </div>
            </div>

            <div className="flex-grow">
                <p className="text-gray-500 text-base mt-2 min-h-[4rem]">{challenge.short_description}</p>        
                <div className="flex flex-wrap items-center gap-2 mt-4">
                    {challenge.ChallengeSkill.slice(0, 5).map(({ Skill }) => (
                        <span key={Skill.id} className="px-3 py-1 text-sm rounded-full border-2 border-[var(--barva-primarni)] text-[var(--barva-primarni)] font-medium">
                            {Skill.name}
                        </span>
                    ))}
                    {challenge.ChallengeSkill.length > 5 && (
                        <span className="px-3 py-1 leading-none text-md font-medium text-[var(--barva-primarni)]">
                            +{challenge.ChallengeSkill.length - 5}
                        </span>
                    )}
                </div>
            </div>

            <div className="mt-4 border-t-2 border-[var(--barva-svetle-pozadi)] pt-4 space-y-3">
                <div className="flex flex-col gap-4 border-b-2 border-[var(--barva-svetle-pozadi)] pb-3">
                    <div className='flex items-center gap-8 font-semibold'>
                        <StatItem 
                            iconSrc="/icons/users.svg"
                            text={<><span className="font-bold text-[var(--barva-primarni)]">{applicantCount}</span>
                            {" / "}
                        <span className="font-normal">{challenge.max_applicants || '∞'}</span></>}
                        />
                        <StatItem 
                            iconSrc="/icons/award.svg"
                            text={totalBudget > 0 ? `${totalBudget} Kč` : 'Nefinanční'}
                        />
                    </div>
                    <StatItem 
                        iconSrc="/icons/check-circle.svg"
                        text={`${completedCount} hotové řešení`}
                    />
                </div>
                <div className='flex justify-between items-center'>
                    <div className="flex justify-between items-center pt-2 opacity-80">
                    <StatItem iconSrc="/icons/calendar.svg" text={formatDateRange(challenge.created_at, challenge.deadline)}/>
                    </div>
                    <Link href={`/challenges/${challenge.id}`} className="text-md rounded-full text-[var(--barva-primarni)] font-semibold hover:text-[#014688] transition-all duration-300">
                        Detail výzvy
                    </Link>
                </div>
                
            </div>
        </div>
    );
}