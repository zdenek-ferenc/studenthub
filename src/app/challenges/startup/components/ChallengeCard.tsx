"use client";

import Link from 'next/link';
import Image from 'next/image'; // Přidali jsme import pro Image

// Definujeme si typy pro data, která bude karta zobrazovat
type Skill = {
id: string;
name: string;
};

type Challenge = {
id: string;
title: string;
short_description: string | null;
budget_in_cents: number | null;
deadline: string | null;
created_at: string;
max_applicants: number | null;
ChallengeSkill: { Skill: Skill }[];
Submission: { id: string }[];
};

// Funkce pro formátování data
const formatDateRange = (start: string, end: string | null) => {
if (!end) return 'Nespecifikováno';
const startDate = new Date(start).toLocaleDateString('cs-CZ');
const endDate = new Date(end).toLocaleDateString('cs-CZ');
return `${startDate} – ${endDate}`;
};

// Komponenta pro malou statistiku s ikonou
// ZMĚNA: Místo JSX elementu teď přijímá cestu k obrázku (src)
const StatItem = ({ iconSrc, text }: { iconSrc: string, text: string }) => (
<div className="flex items-center gap-2 text-[var(--barva-tmava)]">
    <Image src={iconSrc} alt="" width={20} height={20} />
    <span className="text-md font-medium">{text}</span>
</div>
);

export default function ChallengeCard({ challenge }: { challenge: Challenge }) {
const applicantCount = challenge.Submission.length;
const completedCount = 0; // Zatím napevno

return (
    <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
    <div className="flex-grow">
        <h3 className="font-bold text-2xl text-[var(--barva-tmava)]">{challenge.title}</h3>
        <p className="text-gray-500 text-base mt-2 min-w-4">{challenge.short_description}</p>        
            <div className="flex flex-wrap items-center gap-2 mt-4">
                {challenge.ChallengeSkill.slice(0, 5).map(({ Skill }) => (
                <span key={Skill.id} className="px-5 py-1 text-md rounded-full border-2 border-[var(--barva-primarni)] text-[var(--barva-primarni)] font-medium">
                    {Skill.name}
                </span>))}
                {challenge.ChallengeSkill.length > 5 && (
                <span className="px-3 py-1 leading-none text-md font-medium text-[var(--barva-primarni)]">
                +{challenge.ChallengeSkill.length - 5}
                </span>)}
        </div>
    </div>

      {/* Spodní část */}
    <div className="mt-4 border-t-2 border-[var(--barva-svetle-pozadi)] pt-4 space-y-3">
        <div className="flex flex-col gap-4 border-b-2 border-[var(--barva-svetle-pozadi)] pb-3">
            {/* ZMĚNA: Používáme cesty k tvým ikonám */}
            <div className='flex items-center gap-8 font-semibold'>
                <StatItem 
                iconSrc="/icons/users.svg"
                text={`${applicantCount} / ${challenge.max_applicants || '∞'}`}
                />
                <StatItem 
                iconSrc="/icons/award.svg"
                text={challenge.budget_in_cents ? `${challenge.budget_in_cents} Kč` : 'Nefinanční'}
                />
            </div>
            
            <StatItem 
                iconSrc="/icons/check-circle.svg"
                text={`${completedCount} hotové řešení`}
            />
        </div>
        <div className="flex justify-between items-center pt-2">
            <StatItem 
                iconSrc="/icons/calendar.svg"
                text={formatDateRange(challenge.created_at, challenge.deadline)}
            />
            <Link href={`/challenges/${challenge.id}`} className="text-md rounded-full text-[var(--barva-primarni)] font-semibold hover:text-[#014688] transition-all duration-300">
                Detail výzvy
            </Link>
        </div>
    </div>
    </div>
);
}
