"use client";

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, ChevronRight } from 'lucide-react';

type Skill = { id: string; name: string; };
type StartupProfile = { company_name: string; logo_url: string | null; };
type Challenge = {
  id: string;
  title: string;
  short_description: string;
  reward_first_place: number | null;
  reward_second_place: number | null;
  reward_third_place: number | null;
  max_applicants: number | null;
  deadline: string;
  Submission: { student_id: string }[];
  ChallengeSkill: { Skill: Skill }[];
  StartupProfile: StartupProfile | null;
};

const RewardsDisplay = ({ challenge }: { challenge: Challenge }) => {
    const rewards = [
      challenge.reward_first_place,
      challenge.reward_second_place,
      challenge.reward_third_place,
    ].filter((r): r is number => r !== null && r > 0);
  
    if (rewards.length === 0) {
      return <span className="font-bold text-sm 3xl:text-base text-[var(--barva-primarni)]">Nefinanční</span>;
    }
  
    const topReward = Math.max(...rewards);
    return <span className="text-sm 3xl:text-base"><span className='text-[var(--barva-primarni)] font-bold'>{topReward}</span> Kč</span>
};

export default function StudentChallengeCard({ challenge, studentSkillIds = [], isApplied }: { challenge: Challenge, studentSkillIds?: string[], isApplied: boolean }) {
  const applicantCount = challenge.Submission.length;

  const sortedSkills = [...challenge.ChallengeSkill].sort((a, b) => {
    const aIsMatch = studentSkillIds.includes(a.Skill.id);
    const bIsMatch = studentSkillIds.includes(b.Skill.id);
    if (aIsMatch && !bIsMatch) return -1;
    if (!aIsMatch && bIsMatch) return 1;
    return 0;
  });

  return (
    <div className="relative bg-white rounded-2xl shadow-xs hover:shadow-none transition-all duration-300 ease-in-out border border-gray-100 flex flex-col h-full">
        {isApplied && (
        <div className="absolute -top-2 -right-2 z-10 flex-shrink-0 flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold 3xl:px-3 px-2 py-1 3xl:py-1.5 rounded-full shadow-md border-2 border-white">
          <CheckCircle size={14} />
          <span>Přihlášeno</span>
        </div>
      )}
      <div className="flex-grow">
        <div className="flex items-start justify-between gap-4 p-4 md:p-5 3xl:p-6 rounded-t-2xl">
          <div className="flex items-center gap-4">
            {challenge.StartupProfile?.logo_url ? (
              <Image src={challenge.StartupProfile.logo_url} alt="logo firmy" 
                className='rounded-lg hidden xl:block'
                priority={true}
                height={50}
                width={50}
                style={{width:'56px', height: "56px" }}/>
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0"></div>
            )}
            <div className='flex flex-col gap-1'>
              <p className="text-sm 3xl:text-base font-semibold text-gray-700">{challenge.StartupProfile?.company_name}</p>
              <h3 className="text-[16px] 3xl:text-[18px] font-bold text-[var(--barva-tmava)] -mt-1 line-clamp-2 flex-grow">{challenge.title}</h3>
            </div>
          </div>
        </div>
        <p className="text-gray-600 mb-3 px-4 md:px-5 3xl:px-6 text-[13px] 3xl:text-base line-clamp-3 flex-grow min-h-[3em]">{challenge.short_description}</p>
        <div className="flex flex-wrap px-4 md:px-5 py-2 gap-2">
          {(
            [
              ...sortedSkills
                .filter(({ Skill }) => studentSkillIds.includes(Skill.id))
                .sort((a, b) => a.Skill.name.length - b.Skill.name.length),
              ...sortedSkills
                .filter(({ Skill }) => !studentSkillIds.includes(Skill.id))
                .sort((a, b) => a.Skill.name.length - b.Skill.name.length),
            ].slice(0, 4) // 3. Vezmi prvních 4
          ).map(({ Skill }) => {
            const isMatch = studentSkillIds.includes(Skill.id);
            return (
              <span
                key={Skill.id}
                className={`flex items-center justify-center gap-1.5 bg-[var(--barva-svetle-pozadi)] leading-none text-[var(--barva-primarni)] border border-[var(--barva-primarni)] px-2 py-1.5 3xl:px-3 3xl:py-2 rounded-full text-xs 3xl:text-sm font-semibold transition-colors ${
                  isMatch
                    ? 'bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)] border-[var(--barva-primarni)] font-semibold'
                    : 'bg-white text-gray-600 border-gray-300'
                }`}
              >
                {Skill.name}
              </span>
            );
          })}
          {sortedSkills.length > 4 && (
            <span className="text-xs 3xl:text-sm text-gray-500 font-medium self-center">
              +{sortedSkills.length - 4}
            </span>
          )}
        </div>
      </div>
      <div className="border-t border-gray-100 mt-3 pt-4 p-6 flex items-end justify-between">
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 lg:gap-x-4 lg:gap-y-2 text-sm text-gray-800 font-medium">
            <div className="flex items-center gap-2">
                <Image src="/icons/users.svg" alt="" width={16} height={16} />
                <span className='text-xs 3xl:text-base'><span className='text-[var(--barva-primarni)] font-bold'>{applicantCount}</span> / {challenge.max_applicants || '∞'}</span>
            </div>
            <div className="flex items-center gap-2">
                <Image src="/icons/award.svg" alt="" width={16} height={16} />
                <RewardsDisplay challenge={challenge} />
            </div>
            <div className="col-span-2 flex items-center gap-2">
                <Image src="/icons/calendar.svg" alt="" height={0}
                width={0}
                style={{width:'16px', height: "auto" }}/>
                <span className='text-xs 3xl:text-base'>{challenge.deadline ? new Date(challenge.deadline).toLocaleDateString('cs-CZ') : 'N/A'}</span>
            </div>
        </div>
        <Link href={`/challenges/${challenge.id}`} className="absolute right-3 bottom-3 leading-none">
          <div className="hidden xl:flex items-center justify-center 3xl:px-4 px-3 py-2 3xl:py-2.5 text-sm 3xl:text-base rounded-full bg-[var(--barva-primarni)] text-white font-semibold hover:opacity-90 transition-opacity">
            Detail výzvy
          </div>
          <div className="flex xl:hidden items-center justify-center w-8 h-8 md:w-10 md:h-10 ring-2 ring-[var(--barva-primarni)] bg-[var(--barva-primarni)]  text-white rounded-full transition-colors">
            <ChevronRight size={22} strokeWidth={3} />
          </div>
        </Link>
      </div>
    </div>
  );
}   