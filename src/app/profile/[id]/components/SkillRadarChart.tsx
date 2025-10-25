"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

type SkillData = {
    name: string;
    level: number;
    xp: number;
};

type SkillRadarChartProps = {
    skills: SkillData[];
};

export default function SkillRadarChart({ skills }: SkillRadarChartProps) {
    const topSkills = skills
        .sort((a, b) => b.level - a.level || b.xp - a.xp)
        .slice(0, 6)
        .map(skill => ({
            subject: skill.name,
            level: skill.level,
            fullMark: 10,
        }));
    
    if (topSkills.length < 3) {
        return (
            <div className="text-center text-gray-500 text-sm py-8 h-[250px] flex items-center justify-center">
                Student potřebuje alespoň 3 dovednosti pro zobrazení grafu.
            </div>
        );
    }

    return (
        <div className="skill-radar-chart-container focus:outline-none" style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer className="focus:ring-0">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={topSkills} className="focus:ring-0">
                    <PolarGrid stroke="var(--barva-podtext)" strokeOpacity={0.2} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--barva-tmava)', fontSize: 12 }} />
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