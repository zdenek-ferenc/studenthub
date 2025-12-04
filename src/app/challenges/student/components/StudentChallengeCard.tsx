"use client";

import Image from 'next/image';
import Link from 'next/link';

import { Bookmark, ChevronRight, Users, Trophy, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { useDashboard } from '../../../../contexts/DashboardContext';


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
  created_at: string;
  Submission: { student_id: string }[];
  ChallengeSkill: { Skill: Skill }[];
  StartupProfile: StartupProfile | null;
  location?: string;
};



const RewardsDisplay = ({ challenge }: { challenge: Challenge }) => {

  const rewards = [
    challenge.reward_first_place,
    challenge.reward_second_place,
    challenge.reward_third_place,
  ].filter((r): r is number => r !== null && r > 0);

  if (rewards.length === 0) {
    return <span className="font-semibold text-xs 3xl:text-sm text-gray-500">Nefinanční</span>;
  }

  const topReward = Math.max(...rewards);
  return <span className="text-xs 3xl:text-sm font-bold text-[var(--barva-primarni)]">{topReward.toLocaleString('cs-CZ')} Kč</span>
};

export default function StudentChallengeCard({ challenge, studentSkillIds = [], isApplied }: { challenge: Challenge, studentSkillIds?: string[], isApplied: boolean }) {
  const { user, showToast } = useAuth();
  const { refreshSavedChallenges } = useDashboard();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isHoveringButton, setIsHoveringButton] = useState(false);
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
    } finally {
      setIsSaving(false);
      await refreshSavedChallenges();
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
    <div 
      className={`group relative bg-white rounded-[20px] shadow-sm transition-all duration-400 ease-in-out border border-gray-100 flex flex-col h-full overflow-hidden ${isHoveringButton ? '-translate-y-1' : ''}`}
    >
      
      {isApplied && (
        <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-20 shadow-sm">
          PŘIHLÁŠENO
        </div>
      )}

      {!isApplied && (
        <button
          onClick={handleSaveToggle}
          disabled={isSaving}
          className={`absolute cursor-pointer top-4 right-4 z-20 p-2 rounded-full transition-all duration-400 ${
            isSaved
              ? 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 hover:text-yellow-600'
              : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          }`}
        >
          <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      )}

      <div className="p-5 sm:p-6 flex flex-col h-full">
        
        <div className="flex items-start gap-4 mb-4">
          <div className="hidden sm:block relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
            {challenge.StartupProfile?.logo_url ? (
              <Image 
                src={challenge.StartupProfile.logo_url} 
                alt={challenge.StartupProfile.company_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-xl">
                {challenge.StartupProfile?.company_name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-0.5 truncate">
              {challenge.StartupProfile?.company_name}
            </p>
            <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-[var(--barva-primarni)] transition-colors">
              {challenge.title}
            </h3>
          </div>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4 sm:mb-6 flex-grow">
          {challenge.short_description}
        </p>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2 sm:mb-6">
          {sortedSkills.slice(0, 3).map(({ Skill }) => {
            const isMatch = studentSkillIds.includes(Skill.id);
            return (
              <span
                key={Skill.id}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-sm font-semibold tracking-wide ${
                  isMatch
                    ? 'bg-[var(--barva-svetle-pozadi)] border border-[var(--barva-primarni)] text-[var(--barva-primarni)]'
                    : 'bg-gray-100 border border-gray-500 text-gray-500'
                }`}
              >
                {Skill.name}
              </span>
            );
          })}
          {sortedSkills.length > 3 && (
            <span className="rounded-full text-[11px] font-semibold text-gray-500">
              +{sortedSkills.length - 3}
            </span>
          )}
        </div>
        <div className="pt-4 border-gray-100 grid grid-cols-2 gap-y-3">
          
          <div className="flex items-center gap-2 text-gray-500">
            <Users size={14} />
            <span className="text-xs font-medium">
              <span className="text-gray-900 font-bold">{applicantCount}</span>
              <span className="text-gray-400 mx-0.5">/</span>
              {challenge.max_applicants || '∞'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-500 justify-end">
            <Trophy size={16} className="text-amber-500" />
            <RewardsDisplay challenge={challenge} />
          </div>

          <div className="flex items-center gap-2 text-gray-500 col-span-2">
            <Calendar size={14} />
            <span className="text-xs font-medium">
              Do {new Date(challenge.deadline).toLocaleDateString('cs-CZ')}
            </span>
          </div>

        </div>

        <div className="mt-5">
            <Link href={`/challenges/${challenge.id}`} className="block w-full">
                <button 
                  onMouseEnter={() => setIsHoveringButton(true)}
                  onMouseLeave={() => setIsHoveringButton(false)}
                  className="w-full cursor-pointer py-2.5 rounded-xl bg-[var(--barva-primarni)]/90 text-white text-sm font-semibold hover:bg-[var(--barva-primarni)]/100 transition-colors duration-300 flex items-center justify-center gap-2"
                >
                    Zobrazit detail
                    <ChevronRight size={16} className="opacity-70 group-hover:translate-x-1 transition-transform" />
                </button>
            </Link>
        </div>

      </div>
    </div>
  );
}