"use client";

import { mockCareerData } from './mock-data';
import Link from 'next/link';

const LevelProgress = ({ level, xp, xpForNextLevel }: { level: number; xp: number; xpForNextLevel: number }) => {
  const percentage = xpForNextLevel > 0 ? (xp / xpForNextLevel) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-end mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-3xl font-bold text-[var(--barva-primarni)]">Level {level}</span>
        </div>
        <span className="text-sm font-semibold text-gray-600">{xp} / {xpForNextLevel} XP</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-[var(--barva-primarni)]/50 to-[var(--barva-primarni)] h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const SkillProgress = ({ name, level, xp, nextLevelXp }: { name: string; level: number; xp: number; nextLevelXp: number }) => {
  const percentage = nextLevelXp > 0 ? (xp / nextLevelXp) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center text-sm mb-0.5">
        <span className="font-semibold text-gray-800">{name}</span>
        <span className="font-bold text-gray-600">Lvl {level}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div className="bg-gradient-to-r from-amber-300 to-amber-500 h-1.5 rounded-full" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

export default function DemoCareerGrowthWidget() {
  const { totalLevel, totalXp, xpForNextLevel, topSkills } = mockCareerData;

  return (
    <div className="p-5 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100 mt-4 sm:mt-0">
      <div className="flex justify-between items-center mb-4">
        <Link href="/register/student" className="text-sm font-semibold text-[var(--barva-primarni)] hover:underline">
          Chci taky růst
        </Link>
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-blue-50/50 rounded-xl border-2 border-blue-100">
          <LevelProgress level={totalLevel} xp={totalXp} xpForNextLevel={xpForNextLevel} />
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Top Dovednosti</h4>
          <div className="space-y-4">
            {topSkills.map((skill) => (
              <SkillProgress
                key={skill.name}
                name={skill.name}
                level={skill.level}
                xp={skill.xp}
                nextLevelXp={skill.nextLevelXp}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}