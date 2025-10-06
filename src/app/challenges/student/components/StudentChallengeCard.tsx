"use client";

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, ChevronRight } from 'lucide-react';

// Typy zůstávají stejné
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

// Komponenta pro zobrazení odměny (beze změny)
const RewardsDisplay = ({ challenge }: { challenge: Challenge }) => {
    const rewards = [
      challenge.reward_first_place,
      challenge.reward_second_place,
      challenge.reward_third_place,
    ].filter((r): r is number => r !== null && r > 0);
  
    if (rewards.length === 0) {
      return <span className="font-semibold">Nefinanční</span>;
    }
  
    const topReward = Math.max(...rewards);
    return <span className="font-bold text-lg">{topReward} Kč</span>
};

// Hlavní komponenta karty
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
    <div className="relative bg-white p-6 rounded-2xl shadow-xs hover:shadow-none transition-all duration-300 ease-in-out border border-gray-100 flex flex-col h-full">
      
      {/* --- ZMĚNA #1: Štítek je posunutý mimo kartu pomocí "-top-2 -right-2" --- */}
      {isApplied && (
        <div className="absolute -top-2 -right-2 z-10 flex-shrink-0 flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-md border-2 border-white">
          <CheckCircle size={14} />
          <span>Přihlášeno</span>
        </div>
      )}

      <div className="flex-grow">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {challenge.StartupProfile?.logo_url ? (
              <Image src={challenge.StartupProfile.logo_url} alt="logo firmy" width={56} height={56} className="rounded-lg" />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-gray-200 flex-shrink-0"></div>
            )}
            <div className='flex flex-col gap-1'>
              <p className="font-semibold text-gray-700">{challenge.StartupProfile?.company_name}</p>
              <h3 className="xl:text-xl font-bold text-[var(--barva-tmava)] -mt-1">{challenge.title}</h3>
            </div>
          </div>
        </div>

        <p className="text-gray-600 my-5 line-clamp-2 flex-grow">{challenge.short_description}</p>
        
        <div className="flex flex-wrap gap-2">
          {sortedSkills.slice(0, 4).map(({ Skill }) => {
              const isMatch = studentSkillIds.includes(Skill.id);
              return (
                  <span key={Skill.id} className={`flex items-center justify-center gap-1.5 bg-[var(--barva-svetle-pozadi)] leading-none text-[var(--barva-primarni)] border border-[var(--barva-primarni)] px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
                      isMatch 
                      ? 'bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)] border-[var(--barva-primarni)] font-semibold' 
                      : 'bg-white text-gray-600 border-gray-300'
                  }`}>
                      {Skill.name}
                  </span>
              )
          })}
          {sortedSkills.length > 4 && (
              <span className="text-sm text-gray-500 font-medium self-center">
                  +{sortedSkills.length - 4}
              </span>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 mt-4 pt-4 flex items-end justify-between">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-800 font-medium">
            <div className="flex items-center gap-2">
                <Image src="/icons/users.svg" alt="" width={16} height={16} />
                <span>{applicantCount} / {challenge.max_applicants || '∞'}</span>
            </div>
            <div className="flex items-center gap-2">
                <Image src="/icons/award.svg" alt="" width={16} height={16} />
                <RewardsDisplay challenge={challenge} />
            </div>
            <div className="col-span-2 flex items-center gap-2">
                <Image src="/icons/calendar.svg" alt="" width={16} height={16} />
                <span>{challenge.deadline ? new Date(challenge.deadline).toLocaleDateString('cs-CZ') : 'N/A'}</span>
            </div>
        </div>
        
        {/* --- ZMĚNA #2: Jeden Link, který mění vzhled podle velikosti obrazovky --- */}
        <Link href={`/challenges/${challenge.id}`} className="flex-shrink-0">
          {/* Toto se zobrazí na xl a větších obrazovkách */}
          <div className="hidden xl:flex items-center px-4 py-2 rounded-full bg-[var(--barva-primarni)] text-white font-semibold hover:opacity-90 transition-opacity">
              Detail výzvy
          </div>
          {/* Toto se zobrazí na obrazovkách menších než xl */}
          <div className="flex xl:hidden leading-none items-center justify-center w-7 h-7 md:w-10 md:h-10 ring-2 ring-[var(--barva-primarni)] text-blue-600 rounded-full hover:bg-[var(--barva-primarni2)] transition-colors">
              <ChevronRight size={22} />
          </div>
        </Link>
      </div>
    </div>
  );
}   