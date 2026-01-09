"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import Link from 'next/link'; 
import { PlusCircle } from 'lucide-react'; 

type SkillData = {
    name: string;
    level: number;
    xp: number;
};

type SkillRadarChartProps = {
    skills: SkillData[];
    isOwner: boolean; 
};

export default function SkillRadarChart({ skills, isOwner }: SkillRadarChartProps) {
    const topSkills = skills
        .sort((a, b) => b.level - a.level || b.xp - a.xp)
        .slice(0, 6)
        .map(skill => ({
            subject: skill.name,
            level: skill.level,
            fullMark: 10, 
        }));

    if (topSkills.length < 3) {
        if (isOwner) {
            return (
                <div className="text-center text-gray-500 text-xs sm:text-sm py-4 sm:py-8 sm:h-[250px] flex flex-col items-center justify-center gap-3">
                    <p>Pro zobrazení grafu potřebuješ alespoň 3 dovednosti.</p>
                    <Link
                        href="/profile/edit?tab=skills"
                        className="flex items-center gap-2 my-2 sm:my-4 px-4 py-2 rounded-full bg-[var(--barva-primarni)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                    >
                        <PlusCircle size={16} />
                        Přidat dovednosti
                    </Link>
                </div>
            );
        } else {
            return (
                <div className="text-center text-gray-500 text-sm py-8 h-[250px] flex items-center justify-center">
                    Student má méně než 3 dovednosti pro zobrazení grafu.
                </div>
            );
        }
    }

    return (
        <div className="skill-radar-chart-container h-[50px] sm:h-[250px] xs:h-[180px] focus:outline-none">
            <ResponsiveContainer className="focus:ring-0">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={topSkills} className="focus:ring-0">
                    <PolarGrid stroke="#fff" strokeOpacity={0.2} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--barva-primarni)', fontSize: 12 }} />
                    <Radar name="Level" dataKey="level" stroke="var(--barva-primarni)" fill="var(--barva-primarni)" fillOpacity={0.6} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        }}
                        labelStyle={{ fontWeight: 'bold', color: 'var(--barva-tmava)' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}