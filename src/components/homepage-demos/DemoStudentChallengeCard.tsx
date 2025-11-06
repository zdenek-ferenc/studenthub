"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, Calendar, BarChart2, Gift } from 'lucide-react';
import { differenceInCalendarDays } from 'date-fns';
import type { MockChallenge } from './mock-data'; 

type DemoCardProps = {
  challenge: MockChallenge;
  isBookmarked: boolean;
};

const DeadlineTag = ({ deadline }: { deadline: string | null }) => {
  if (!deadline) return null;
  const daysRemaining = differenceInCalendarDays(new Date(deadline), new Date());
  
  let text: string;
  if (daysRemaining < 0) text = 'Po termínu';
  else if (daysRemaining === 0) text = 'Končí dnes!';
  else if (daysRemaining === 1) text = 'Zbývá 1 den';
  else text = `Zbývá ${daysRemaining} dní`;

  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">
      <Calendar size={14} className="text-gray-500" />
      {text}
    </div>
  );
};

const RewardTag = ({ type, financial, nonfinancial }: { type: MockChallenge['reward_type'], financial: MockChallenge['reward_financial'], nonfinancial: MockChallenge['reward_nonfinancial'] }) => {
  let text = 'Odměna';
  if (type === 'financial' && financial?.first_place) {
    text = `${financial.first_place.toLocaleString('cs-CZ')} Kč`;
  } else if (type === 'internship') {
    text = 'Stáž';
  } else if (type === 'non-financial' && nonfinancial) {
    text = nonfinancial.length > 20 ? 'Věcná odměna' : nonfinancial;
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
      <Gift size={14} />
      {text}
    </div>
  );
};


export default function DemoStudentChallengeCard({ challenge, isBookmarked }: DemoCardProps) {
  const skills = challenge.ChallengeSkill.map(cs => cs.Skill.name);
  const matchPercentage = (skills.filter(s => ['React', 'Figma'].includes(s)).length / skills.length) * 100;

  return (
    <Link href="/register" className="block">
      <div className="bg-white border-2 border-gray-100 rounded-2xl shadow-xs hover:shadow-none hover:border-blue-200 transition-all ease-in-out duration-200 overflow-hidden h-full flex flex-col">
        {/* Hlavička karty */}
        <div className="p-5">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-4">
              <Image
                src={challenge.StartupProfile?.logo_url || '/logo.svg'}
                alt={challenge.StartupProfile?.company_name || 'Logo'}
                width={48}
                height={48}
                className="rounded-lg w-12 h-12 object-contain p-2 bg-[var(--barva-primarni)] border border-gray-100"
              />
              <div>
                <h3 className="text-sm md:text-lg font-bold text-[var(--barva-tmava)] group-hover:text-[var(--barva-primarni)] transition-colors">
                  {challenge.title}
                </h3>
                <p className="text-sm font-medium text-gray-500">{challenge.StartupProfile?.company_name}</p>
              </div>
            </div>
            <button
              className={`hidden sm:block p-1.5 rounded-full transition-colors duration-200
                ${isBookmarked
                  ? 'text-yellow-500 bg-yellow-100 hover:bg-yellow-200'
                  : 'text-gray-400 hover:bg-yellow-50 hover:text-yellow-400 transition-all ease-in-out duration-200'
                }`}
              title={isBookmarked ? "Odebrat z uložených" : "Uložit výzvu"}
            >
              <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        <div className="px-5 pb-5 mt-auto space-y-4">
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 3).map(skillName => (
              <span key={skillName} className="px-2.5 py-1 bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)] border border-[var(--barva-primarni)] rounded-full text-xs font-semibold">
                {skillName}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-bold">
                +{skills.length - 3}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-between items-center">
            <RewardTag type={challenge.reward_type} financial={challenge.reward_financial} nonfinancial={challenge.reward_nonfinancial} />
            <DeadlineTag deadline={challenge.deadline} />
          </div>
        </div>

        {matchPercentage > 0 && (
          <div className="border-t border-gray-100 bg-blue-50/50 px-5 py-2.5">
            <div className="flex items-center gap-2">
              <BarChart2 size={16} className="text-[var(--barva-primarni)]" />
              <span className="text-xs font-bold text-[var(--barva-primarni)]">
                {Math.round(matchPercentage)}% shoda s tvými dovednostmi
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}