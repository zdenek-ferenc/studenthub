"use client";

import { Languages, PlusCircle } from 'lucide-react';
import Link from 'next/link';

type StudentSkill = {
    level: number;
    xp: number; 
    Skill: { name: string };
};
type Language = {
    Language: { name: string };
};

const calculateXpForNextSkillLevel = (level: number) => {
    return Math.floor(75 * (level ** 1.4));
};

export default function ProfileSkillsSection({ skills, languages, isOwner }: { skills: StudentSkill[], languages: Language[], isOwner: boolean }) {

    const sortedValidSkills = skills
        .filter(s => s.Skill)
        .sort((a, b) => b.level - a.level || b.xp - a.xp); 

    const validLanguages = languages.filter(l => l.Language);

    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-gray-100">
            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold text-gray-500 uppercase text-xs mb-3">Dovednosti a level</h3>
                    <div className="flex flex-wrap gap-2 items-center">
                        {sortedValidSkills.length > 0 ? (
                            sortedValidSkills.map((s, i) => {
                                const xpForNextLevel = calculateXpForNextSkillLevel(s.level);
                                const percentage = xpForNextLevel > 0 ? (s.xp / xpForNextLevel) * 100 : 0;
                                return (
                                    <span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-[var(--barva-svetle-pozadi)] border border-[var(--barva-primarni)] text-[var(--barva-primarni)] rounded-full text-sm font-medium">
                                        <span>{s.Skill!.name}</span>
                                        <div 
                                            className="relative w-6 h-6 rounded-full"
                                            style={{
                                                background: `conic-gradient(var(--barva-primarni) ${percentage}%, var(--barva-primarni2) ${percentage}%)`
                                            }}
                                            title={`${s.xp} / ${xpForNextLevel} XP do dalšího levelu`}
                                        >
                                            <div className="absolute top-1/2 left-1/2 w-5 h-5 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full" />
                                            <span className="absolute inset-0 grid place-items-center text-[var(--barva-primarni)] text-xs font-bold">
                                                {s.level}
                                            </span>
                                        </div>
                                    </span>
                                );
                            })
                        ) : (
                            !isOwner && (
                                <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-sm font-medium italic">
                                    Student zatím nevyplnil žádné dovednosti.
                                </span>
                            )
                        )}
                        {isOwner && (
                            <Link href="/profile/edit?tab=skills" title="Přidat dovednosti nebo jazyky" className="text-gray-400 flex items-center gap-1 hover:text-[var(--barva-primarni)] transition-colors ml-1">
                                <PlusCircle size={22} />
                                <span className='text-sm'>Přidat dovednosti</span>
                            </Link>
                        )}
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-500 uppercase text-xs mb-3 flex items-center gap-2"><Languages size={14} /> Jazyky</h3>
                    <div className="flex flex-wrap gap-2">
                        {validLanguages.map((l, i) => (
                            <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                {l.Language.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}