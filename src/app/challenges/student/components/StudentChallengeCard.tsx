"use client";

import Image from 'next/image';
import Link from 'next/link';

import { Bookmark, CheckCircle, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient'; 
import { useAuth } from '../../../../contexts/AuthContext'; 


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
  const { user, showToast } = useAuth(); 
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const applicantCount = challenge.Submission.length;

  
  useEffect(() => {
    if (!user) return; 

    const checkSavedStatus = async () => {
      const { data, error } = await supabase
        .from('SavedChallenge') 
        .select('challenge_id')
        .eq('student_id', user.id)
        .eq('challenge_id', challenge.id)
        .maybeSingle(); 

      if (error) {
        console.error("Chyba při kontrole uložené výzvy:", error);
      } else if (data) {
        setIsSaved(true); 
      } else {
        setIsSaved(false); 
      }
    };
    checkSavedStatus();
  }, [user, challenge.id]);

  
  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    if (!user || isSaving) return; 

    setIsSaving(true);
    const currentlySaved = isSaved; 

    try {
      if (currentlySaved) {
        
        const { error } = await supabase
          .from('SavedChallenge')
          .delete()
          .eq('student_id', user.id)
          .eq('challenge_id', challenge.id);
        if (error) throw error;
        setIsSaved(false);
        showToast('Výzva odebrána z uložených.', 'success');
      } else {
        
        const { error } = await supabase
          .from('SavedChallenge')
          .insert({ student_id: user.id, challenge_id: challenge.id });
        if (error) throw error;
        setIsSaved(true);
        showToast('Výzva uložena.', 'success');
      }
    } catch (error: unknown) { 
      let errorMessage = "Akce se nezdařila: Neznámá chyba.";
      if (error instanceof Error) {
        errorMessage = `Akce se nezdařila: ${error.message}`;
      }
      showToast(errorMessage, 'error');
      setIsSaved(currentlySaved);
    } finally{
      setIsSaving(false);
    }
  };

  const sortedSkills = [...challenge.ChallengeSkill].sort((a, b) => {
    const aIsMatch = studentSkillIds.includes(a.Skill.id);
    const bIsMatch = studentSkillIds.includes(b.Skill.id);
    if (aIsMatch && !bIsMatch) return -1;
    if (!aIsMatch && bIsMatch) return 1;
    return 0;
  });

  return (
    
    <div className="relative bg-white rounded-2xl shadow-xs hover:shadow-none transition-all duration-300 ease-in-out border-2 border-gray-100 flex flex-col h-full pr-5 sm:pr-6">
      {isApplied ? (
    <div
      className={`absolute top-2  sm:top-4 sm:right-3 flex items-center w-4 h-4 bg-green-400 border border-green-300 inset-shadow-sm inset-shadow-white/50 font-bold rounded-full z-10 shadow-sm
                  transition-all duration-300 ease-in-out
                  group-hover:opacity-0 group-hover:scale-75 group-hover:-translate-y-2`}
    >
    </div>
  ) : (
    <button
      onClick={handleSaveToggle}
      disabled={isSaving}
      className={`absolute top-3 right-3 z-10 p-1.5 cursor-pointer rounded-full transition-colors duration-200 ${
        isSaving
          ? 'text-gray-300'
          : isSaved
          ? 'text-yellow-500 bg-yellow-100 hover:bg-yellow-200'
          : 'text-gray-400 hover:bg-yellow-50 hover:text-yellow-400 tranistion-all ease-in-out duration-200'
      }`}
      aria-label={isSaved ? 'Odebrat z uložených' : 'Uložit výzvu'}
    >
      <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
    </button>
  )}
      <div className="h-full flex flex-col">
          <div className="flex-grow">
            <div className="flex items-start justify-between gap-4 px-4 pt-4 pb-2 sm:pb-0 md:p-5 3xl:px-6 rounded-t-2xl">
              <div className="flex items-center gap-4">
                {challenge.StartupProfile?.logo_url ? (
                  <Image src={challenge.StartupProfile.logo_url} alt="logo firmy"
                    className='rounded-lg hidden sm:block sm:w-[56px] sm:h-[56px]'
                    priority={true}
                    height={50}
                    width={50}
                    />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0"></div>
                )}
                <div className='flex flex-col gap-2 sm:gap-1'>
                  <p className="text-sm 3xl:text-base font-semibold text-gray-600">{challenge.StartupProfile?.company_name}</p>
                  <h3 className="text-[16px] 3xl:text-[18px] font-semibold text-[var(--barva-tmava)] -mt-1 line-clamp-2 flex-grow">{challenge.title}</h3>
                </div>
              </div>
            </div>
            <p className="text-gray-600 sm:mb-3 px-4 md:px-5 3xl:px-6 text-[12px] 3xl:text-[15px] line-clamp-3 flex-grow min-h-[3em]">{challenge.short_description}</p>
            <div className="flex flex-wrap px-4 md:px-5 py-2 gap-1 sm:gap-2">
              {(
                [
                  ...sortedSkills
                    .filter(({ Skill }) => studentSkillIds.includes(Skill.id))
                    .sort((a, b) => a.Skill.name.length - b.Skill.name.length),
                  ...sortedSkills
                    .filter(({ Skill }) => !studentSkillIds.includes(Skill.id))
                    .sort((a, b) => a.Skill.name.length - b.Skill.name.length),
                ].slice(0, 4) 
              ).map(({ Skill }) => {
                const isMatch = studentSkillIds.includes(Skill.id);
                return (
                  <span
                    key={Skill.id}
                    className={`flex items-center justify-center sm:gap-1.5 bg-[var(--barva-svetle-pozadi)] leading-none text-[var(--barva-primarni)] border border-[var(--barva-primarni)] px-2 py-1.5 3xl:px-3 3xl:py-2 rounded-full text-xs 3xl:text-sm font-semibold transition-colors ${
                      isMatch
                        ? 'bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)] border-[var(--barva-primarni)] font-semibold'
                        : 'bg-gray-50 text-gray-600 border-gray-400'
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
          <div className=" sm:mt-3 pb-4 px-6 flex items-end justify-between">
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
            <div className="absolute right-3 bottom-3 leading-none">
              <Link href={`/challenges/${challenge.id}`} className="h-full flex flex-col">
                <div className="hidden xl:flex items-center justify-center 3xl:px-5 px-4 py-1.5 3xl:py-2 text-sm 3xl:text-base rounded-full bg-[var(--barva-primarni)] text-white hover:opacity-95 transition-all ease-in-out duration-200">
                  Detail výzvy
                </div>
              </Link>
              
              <Link href={`/challenges/${challenge.id}`} className="h-full flex flex-col">
                <div className="flex xl:hidden items-center justify-center w-8 h-8 md:w-10 md:h-10 ring-2 ring-[var(--barva-primarni)] bg-[var(--barva-primarni)]  text-white rounded-full transition-colors">
                  <ChevronRight size={22} strokeWidth={3} />
                </div>
              </Link>
              
            </div>
          </div>
      </div>
    </div>
  );
}