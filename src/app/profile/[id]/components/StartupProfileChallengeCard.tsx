"use client";

import Link from 'next/link';
import { useAuth } from '../../../../contexts/AuthContext';
import { differenceInCalendarDays } from 'date-fns';
import { Sparkles, Clock, ChevronRight, CheckCircle } from 'lucide-react';

type Challenge = {
    id: string;
    title: string;
    deadline: string;
    ChallengeSkill: { Skill: { id: string, name: string } }[];
};

type CardProps = {
    challenge: Challenge;
    studentSkillIds: string[];
    appliedChallengeIds: string[];
};

export default function StartupProfileChallengeCard({ challenge, studentSkillIds, appliedChallengeIds }: CardProps) {
    const { profile: viewerProfile } = useAuth();
    const isStudentViewer = viewerProfile?.role === 'student';

    const isApplied = isStudentViewer && appliedChallengeIds.includes(challenge.id);
    const requiredSkillIds = challenge.ChallengeSkill.map(cs => cs.Skill.id);
    const matchingSkillCount = isStudentViewer ? studentSkillIds.filter(id => requiredSkillIds.includes(id)).length : 0;
    const daysRemaining = differenceInCalendarDays(new Date(challenge.deadline), new Date());

    let deadlineText: string | null = null;
    let deadlineColor = 'text-gray-500';

    if (daysRemaining === 0) {
        deadlineText = 'Končí dnes!';
        deadlineColor = 'text-orange-500';
    } else if (daysRemaining === 1) {
        deadlineText = `Zbývá 1 den`;
        deadlineColor = 'text-orange-500';
    } else if (daysRemaining > 1 && daysRemaining <= 4) {
        deadlineText = `Zbývají ${daysRemaining} dny`;
        deadlineColor = 'text-orange-500';
    } else if (daysRemaining > 4) {
        deadlineText = `Zbývá ${daysRemaining} dní`;
    }

    return (
        <Link href={`/challenges/${challenge.id}`} className="block group relative">
            {isApplied && (
                <div className={`absolute top-2 -right-2 sm:top-4 sm:-right-3 flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-1 sm:px-2 py-1 rounded-full z-10 shadow-sm
                                transition-all duration-300 ease-in-out 
                                group-hover:opacity-0 group-hover:scale-75 group-hover:-translate-y-2`}>
                    <CheckCircle size={14} />
                    <span className='hidden sm:block'>Přihlášeno</span>
                </div>
            )}
            <div className="p-2 sm:p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md hover:bg-blue-50 transition-all duration-300 flex items-center relative">
                <div className="flex-grow min-w-0">
                    <p className="text-[var(--barva-tmava)] truncate sm:text-lg pr-4">{challenge.title}</p>
                    
                    <div className="flex items-end justify-between mt-2">
                        <div className="flex items-center gap-x-4 gap-y-1 flex-wrap">
                            {isStudentViewer && (
                                <div className={`flex items-center gap-1.5 text-xs font-semibold ${matchingSkillCount > 0 ? 'text-blue-500' : 'text-gray-500'}`}>
                                    <Sparkles size={14} />
                                    <span>Shoda {matchingSkillCount}/{requiredSkillIds.length}</span>
                                </div>
                            )}
                            <div className="hidden md:flex items-center gap-1.5 flex-wrap">
                                {challenge.ChallengeSkill.slice(0, 2).map(cs => (
                                    <span key={cs.Skill.id} className="text-xs font-medium border-1 bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)] px-3 py-1 rounded-xl">
                                        {cs.Skill.name}
                                    </span>
                                ))}
                                {challenge.ChallengeSkill.length > 2 && (
                                    <span className="text-xs font-bold text-[var(--barva-primarni)]">+{challenge.ChallengeSkill.length - 2}</span>
                                )}
                            </div>
                        </div>
                        {deadlineText && (
                            <div className={`flex items-center gap-1.5 text-xs font-semibold ${deadlineColor} flex-shrink-0 ml-4`}>
                                <Clock size={14} />
                                <span>{deadlineText}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="absolute top-1/3 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-300">
                    <ChevronRight size={24} strokeWidth={2.5} className="text-blue-500" />
                </div>
            </div>
        </Link>
    );
}