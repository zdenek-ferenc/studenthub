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
    return (
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[var(--barva-tmava)]">Dovednosti a jazyky</h2>
                {isOwner && (
                    <Link href="/profile/edit?tab=skills" title="Přidat dovednosti nebo jazyky" className="text-gray-400 hover:text-[var(--barva-primarni)] transition-colors">
                        <PlusCircle size={22} />
                    </Link>
                )}
            </div>
            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold text-gray-500 uppercase text-xs mb-3">Dovednosti</h3>
                    <div className="flex flex-wrap gap-2">
                        {skills.map((s, i) => (
                            <span key={i} className="px-3 py-1.5 bg-[var(--barva-svetle-pozadi)] border border-[var(--barva-primarni)] text-[var(--barva-primarni)] rounded-full text-sm font-medium">
                                {s.Skill.name}
                            </span>
                        ))}
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