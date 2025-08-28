"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react'; // Přidali jsme import pro useMemo

// Definujeme si typy pro data, která bude karta zobrazovat
type Skill = { id: string; name: string; };
type StartupProfile = { company_name: string; logo_url: string | null; };
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
StartupProfile: StartupProfile | null;
};

// Komponenta teď přijímá i pole IDček dovedností přihlášeného studenta
export default function StudentChallengeCard({ challenge, studentSkillIds }: { challenge: Challenge, studentSkillIds: string[] }) {
const applicantCount = challenge.Submission.length;

  // --- ZMĚNA ZDE: Seřadíme dovednosti před jejich zobrazením ---
const sortedSkills = useMemo(() => {
    return [...challenge.ChallengeSkill].sort((a, b) => {
    const aIsMatch = studentSkillIds.includes(a.Skill.id);
    const bIsMatch = studentSkillIds.includes(b.Skill.id);
      // Jednoduchá logika: shodující se dovednosti mají vyšší prioritu
    return (bIsMatch ? 1 : 0) - (aIsMatch ? 1 : 0);
    });
}, [challenge.ChallengeSkill, studentSkillIds]);

return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
      {/* Horní část s logem a názvem */}
    <div className="flex items-center gap-4 mb-4">
        {challenge.StartupProfile?.logo_url ? (
        <Image src={challenge.StartupProfile.logo_url} alt={`${challenge.StartupProfile.company_name} logo`} width={48} height={48} className="rounded-lg object-cover" />
        ) : (
        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center font-bold text-gray-500">
            {challenge.StartupProfile?.company_name?.substring(0, 2)}
        </div>
        )}
        <div className='flex flex-col gap-1'>
        <p className="font-medium text-lg text-gray-800">{challenge.StartupProfile?.company_name}</p>
        <h3 className="font-bold text-xl text-[var(--barva-tmava)] -mt-1">{challenge.title}</h3>
        </div>
    </div>
      {/* Střední část */}
    <div className="flex-grow">
        <div className='min-h-12 flex items-center'>
            <p className="text-gray-600 text-md">{challenge.short_description}</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 border-t-2 pt-6">
          {/* Používáme nově seřazené pole 'sortedSkills' */}
        {sortedSkills.map(({ Skill }) => {
            const isMatch = studentSkillIds.includes(Skill.id);
            return (
            <span 
                key={Skill.id} 
                className={`px-4 py-1 text-sm rounded-full border-2 font-medium
                ${isMatch 
                    ? 'bg-[var(--barva-primarni2)] border-[var(--barva-primarni)] text-[var(--barva-primarni)]' // Zvýrazněný styl
                    : 'border-[var(--barva-primarni)] text-[var(--barva-primarni)]' 
                }`}
            >
                {Skill.name}
            </span>
            );
        })}
        </div>
    </div>

      {/* Spodní část */}
    <div className="mt-6 border-t border-gray-100 pt-4">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 text-sm text-gray-600 font-medium">
                <span>👤 {applicantCount}/{challenge.max_applicants || '∞'}</span>
                <span>🏆 {challenge.budget_in_cents ? `${challenge.budget_in_cents} Kč` : 'Nefinanční'}</span>
            </div>
            <Link href={`/challenges/${challenge.id}`} className="px-5 py-2 text-sm rounded-full bg-[var(--barva-primarni)] text-white font-semibold hover:opacity-90 transition-opacity">
                Přihlásit se
            </Link>
        </div>
    </div>
    </div>
);
}
