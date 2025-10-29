"use client";

import { Languages, PlusCircle } from 'lucide-react';
import Link from 'next/link';

type Skill = {
    Skill: { name: string };
};
type Language = {
    Language: { name: string };
};

export default function ProfileSkillsSection({ skills, languages, isOwner }: { skills: Skill[], languages: Language[], isOwner: boolean }) {

    const validSkills = skills.filter(s => s.Skill);
    const validLanguages = languages.filter(l => l.Language);

    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-gray-100">
            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold text-gray-500 uppercase text-xs mb-3">Dovednosti</h3>
                    <div className="flex flex-wrap gap-2 items-center">
                        {validSkills.length > 0 ? (
                            validSkills.map((s, i) => (
                                <span key={i} className="px-3 py-1.5 bg-[var(--barva-svetle-pozadi)] border border-[var(--barva-primarni)] text-[var(--barva-primarni)] rounded-full text-sm font-medium">
                                    {s.Skill!.name} 
                                </span>
                            ))
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
                        {languages.map((l, i) => (
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