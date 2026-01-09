"use client";

import Link from 'next/link';
import { Zap, Globe, PlusCircle } from 'lucide-react';
import { StudentSkill, StudentLanguage } from '../types';

type Props = {
    skills: StudentSkill[];
    languages: StudentLanguage[];
    isOwner: boolean; 
};

const calculateNextLevelXp = (level: number) => Math.floor(75 * (level ** 1.4));

export default function ModernSkillsWidget({ skills, languages, isOwner }: Props) {
    
    const sortedSkills = [...skills].sort((a, b) => {
        if (b.level !== a.level) return b.level - a.level;
        return b.xp - a.xp;
    });

    return (
        <div className="bg-[#0B1623]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-6 flex flex-col gap-6 relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                        <div className="p-1.5 text-blue-400">
                            <Zap size={18} />
                        </div>
                        <h3 className="md:text-lg font-bold text-white">Dovednosti & Jazyky</h3>
                    </div>
                    {isOwner && (
                        <Link 
                            href="/profile/edit?tab=skills" 
                            className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-blue-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                        >
                            <PlusCircle size={14} /> <span>Upravit</span>
                        </Link>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    {sortedSkills.length > 0 ? (
                        sortedSkills.map((s, i) => {
                            const xpForNextLevel = calculateNextLevelXp(s.level);
                            const percentage = xpForNextLevel > 0 ? (s.xp / xpForNextLevel) * 100 : 0;
                            
                            return (
                                <div 
                                    key={i} 
                                    className="group flex items-center gap-2 pl-3 pr-2 py-1 md:py-1.5 bg-[#001224]/60 border border-blue-500/30 hover:border-blue-500/30 rounded-full transition-all cursor-default relative overflow-hidden"
                                    title={`${s.xp} / ${xpForNextLevel} XP do dalšího levelu`}
                                >
                                    <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors"></div>

                                    <span className="text-xs md:text-sm font-medium text-gray-200 group-hover:text-white transition-colors relative z-10">
                                        {s.Skill.name}
                                    </span>

                                    {/* Level Circle (Conic Gradient) */}
                                    <div 
                                        className="relative w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                        style={{
                                            background: `conic-gradient(#3B82F6 ${percentage}%, rgba(255,255,255,0.1) ${percentage}%)`
                                        }}
                                    >
                                        {/* Inner Circle (Hole) */}
                                        <div className="absolute inset-[2px] bg-[#0B1623] rounded-full z-10"></div>
                                        
                                        {/* Level Number */}
                                        <span className="relative z-20 text-[10px] font-bold text-blue-400">
                                            {s.level}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-gray-500 text-sm italic py-2">
                            Zatím žádné přidané dovednosti.
                        </div>
                    )}
                </div>

                {/* LANGUAGES LIST */}
                {languages.length > 0 && (
                    <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2 items-center">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2 flex items-center gap-1">
                            <Globe size={12} /> Jazyky:
                        </div>
                        {languages.map((lang, i) => (
                            <span 
                                key={i} 
                                className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-xs text-gray-300 font-medium"
                            >
                                {lang.Language.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}