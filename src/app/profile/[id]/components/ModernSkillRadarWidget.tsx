"use client";

import { Radar } from 'lucide-react';
import SkillRadarChart from './SkillRadarChart'; // Tvůj existující graf

type Props = {
    skills: { name: string; level: number; xp: number }[];
    isOwner: boolean;
};

export default function ModernSkillRadarWidget({ skills, isOwner }: Props) {
    // Pokud nejsou data, nezobrazujeme prázdný box, nebo zobrazíme placeholder
    if (skills.length < 3) {
        return (
            <div className="bg-[#0B1623]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 min-h-[300px] flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                    <Radar size={24} className="text-gray-600" />
                </div>
                <h3 className="text-gray-400 font-bold mb-1">Nedostatek dat</h3>
                <p className="text-xs text-gray-600 max-w-[200px]">
                    Pro zobrazení radaru potřebuješ alespoň 3 různé dovednosti.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-[#0B1623]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-6 relative overflow-hidden flex flex-col h-full">
            <div className="flex items-center gap-1 mb-2 relative z-10">
                <div className="p-1.5 text-purple-400">
                    <Radar size={18} />
                </div>
                <h3 className="md:text-lg font-bold text-white">Analýza dovedností</h3>
            </div>
            
            <div className="flex-1 flex items-center justify-center relative z-10 -ml-4">
                <SkillRadarChart skills={skills} isOwner={isOwner} />
            </div>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        </div>
    );
}