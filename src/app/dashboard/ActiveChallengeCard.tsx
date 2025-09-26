"use client";

import Link from 'next/link';
import Image from 'next/image';
import { CheckSquare, Clock, Edit3, ChevronRight, Star } from 'lucide-react'; // <-- PŘIDÁNA IKONA Star

export type ActiveChallengeData = {
  id: string;
  completed_outputs: string[];
  status: string;
  Challenge: {
    id: string;
    title: string;
    expected_outputs: string;
    StartupProfile: {
      company_name: string;
      logo_url: string | null;
    } | null;
    ChallengeSkill: {
      Skill: {
        name: string;
      }
    }[];
  } | null;
};

const ProgressBar = ({ value, maxValue }: { value: number, maxValue: number }) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
      <div className="bg-green-300 h-1.5 rounded-full" style={{ width: `${percentage}%` }} />
    </div>
  );
};

// --- ZDE JE DRUHÁ KLÍČOVÁ ZMĚNA LOGIKY ---
const StatusInfo = ({ status }: { status: string }) => {
    let text = '';
    let icon = null;
    let colorClass = 'text-gray-500';

    if (status === 'applied') {
        text = 'Čeká na tvé řešení';
        icon = <Edit3 size={14} />;
        colorClass = 'text-blue-500';
    } else if (status === 'submitted') {
        text = 'Čeká na vyhodnocení';
        icon = <Clock size={14} />;
        colorClass = 'text-amber-500';
    } else if (status === 'reviewed') { // <-- NOVÝ STAV
        text = 'Ohodnoceno';
        icon = <Star size={14} />;
        colorClass = 'text-green-500';
    }
    else {
        return null;
    }

    return (
        <div className={`flex items-center gap-1.5 text-sm font-semibold leading-none ${colorClass}`}>
            {icon}
            <span>{text}</span>
        </div>
    );
};


export default function ActiveChallengeCard({ submission }: { submission: ActiveChallengeData }) {
  if (!submission || !submission.Challenge) {
    return null;
  }

  const { Challenge } = submission;
  const totalOutputs = Challenge.expected_outputs.split('\n').filter(line => line.trim() !== '').length;
  const completedCount = submission.completed_outputs?.length || 0;

  return (
    <Link href={`/challenges/${Challenge.id}`} className="block group">
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:bg-blue-50 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center gap-4">
        {/* Levá část karty */}
        <div className="flex items-center gap-4 flex-grow w-full">
            <div className="flex-shrink-0">
                <Image 
                    src={Challenge.StartupProfile?.logo_url || '/logo.svg'} 
                    alt="logo" 
                    width={64} 
                    height={64} 
                    className="rounded-xl w-14 h-14 sm:w-16 sm:h-16 object-cover" 
                />
            </div>
            <div className="flex flex-col flex-grow min-w-0">
                <h4 className="text-md sm:text-lg font-bold text-gray-800 truncate">{Challenge.title}</h4>
                <div className="mt-2">
                    <div className="hidden md:flex xl:hidden flex-wrap gap-1.5">
                        {Challenge.ChallengeSkill.slice(0, 2).map(({ Skill }, index) => (
                            <span key={index} className="text-xs font-medium border-1 bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)] px-2 py-1 rounded-xl">{Skill.name}</span>
                        ))}
                        {Challenge.ChallengeSkill.length > 2 && <span className="text-xs font-medium text-gray-500 self-center bg-gray-100 px-2 py-1 rounded-md">+{Challenge.ChallengeSkill.length - 2}</span>}
                    </div>
                     <div className="hidden xl:flex flex-wrap gap-1.5">
                        {Challenge.ChallengeSkill.slice(0, 4).map(({ Skill }, index) => (
                            <span key={index} className="text-xs font-medium border-1 bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)] px-2 py-1 rounded-xl">{Skill.name}</span>
                        ))}
                        {Challenge.ChallengeSkill.length > 4 && <span className="text-xs font-bold text-blue-500 self-center  px-2 py-1">+{Challenge.ChallengeSkill.length - 4}</span>}
                    </div>
                </div>
            </div>
        </div>
        
        {/* Pravá část karty */}
        <div className="flex-shrink-0 w-full md:w-56 mt-2 md:mt-0 flex flex-col justify-between">
            <div className='w-full'>
                <div className="flex justify-between items-center text-sm font-semibold text-gray-600">
                    <span className='flex items-center gap-1.5'><CheckSquare size={14}/> Checklist</span>
                    <span>{completedCount} / {totalOutputs}</span>
                </div>
                <ProgressBar value={completedCount} maxValue={totalOutputs} />
            </div>
            <div className="w-full flex justify-end md:justify-start items-end mt-3 h-5">
                <div className="group-hover:opacity-0 opacity-100 transition-opacity duration-200">
                    <StatusInfo status={submission.status} />
                </div>
                <div className="hidden sm:block opacity-0 group-hover:opacity-100 group-hover:translate-x-2 -translate-x-0 transition-all duration-400 text-sm font-bold text-[var(--barva-primarni)]">
                    <ChevronRight size={18} strokeWidth={2.5}/>
                </div>
            </div>
        </div>
      </div>
    </Link>
  );
}