"use client";

import Image from 'next/image';
import { Download, Lock } from 'lucide-react';
import { useMemo } from 'react';

type Challenge = {
    id: string;
    title: string;
    description: string;
    goals: string;
    expected_outputs: string;
    reward_first_place: number | null;
    reward_second_place: number | null;
    reward_third_place: number | null;
    reward_description: string | null;
    attachments_urls: string[] | null;
    deadline: string;
    ChallengeSkill: { Skill: { id: string, name: string } }[];
    StartupProfile: { company_name: string, logo_url: string | null } | null;
    Submission: { student_id: string }[];
    max_applicants: number;
};

type Props = {
    challenge: Challenge;
    isApplied: boolean;
    studentSkillIds: Set<string>;
    onApply: () => void;
    isApplying: boolean;
    isChallengeFull: boolean;
};

// Pomocné komponenty (přesunuty sem)
const getFileNameFromUrl = (url: string) => {
    try {
        const name = url.split('/').pop()?.split('-').slice(1).join('-') || 'Soubor';
        return decodeURIComponent(name);
    } catch { return 'Soubor ke stažení'; }
};

const RewardsDisplay = ({ challenge }: { challenge: Challenge }) => {
    const rewards = [
      { place: '1. místo', amount: challenge.reward_first_place },
      { place: '2. místo', amount: challenge.reward_second_place },
      { place: '3. místo', amount: challenge.reward_third_place },
    ].filter(r => r.amount);

    if (rewards.length === 0) return <>{challenge.reward_description || 'Nefinanční'}</>;
    if (rewards.length === 1 && rewards[0].amount) return <>{rewards[0].amount.toLocaleString('cs-CZ')} Kč</>;
    
    return (
      <div className="flex items-baseline gap-4">
        {rewards.map(({ place, amount }) => (
          <div key={place} className="text-center">
            <span className="text-sm font-semibold text-gray-400 block">{place}</span>
            <span className="font-bold text-lg sm:text-xl">{amount?.toLocaleString('cs-CZ')} Kč</span>
          </div>
        ))}
      </div>
    );
};

export default function ChallengeAssignmentBox({ challenge, isApplied, studentSkillIds, onApply, isApplying, isChallengeFull }: Props) {
    const expectedOutputsArray = useMemo(() => challenge.expected_outputs.split('\n').filter(line => line.trim() !== ''), [challenge.expected_outputs]);

    const sortedSkills = useMemo(() => {
        return [...challenge.ChallengeSkill].sort((a, b) => {
            const aIsMatch = studentSkillIds.has(a.Skill.id);
            const bIsMatch = studentSkillIds.has(b.Skill.id);
            if (aIsMatch && !bIsMatch) return -1;
            if (!aIsMatch && bIsMatch) return 1;
            return 0;
        });
    }, [challenge.ChallengeSkill, studentSkillIds]);

    return (
        <div className="bg-white p-6 sm:p-8 md:p-12 rounded-2xl shadow-xs">
            <div className="text-center mb-8">
                <Image 
                    src={challenge.StartupProfile?.logo_url || '/logo.svg'} 
                    alt="logo firmy" 
                    width={80} 
                    height={80} 
                    className="mx-auto rounded-lg mb-4 w-16 h-16 sm:w-20 sm:h-20"
                />
                <p className="font-semibold text-gray-800">{challenge.StartupProfile?.company_name}</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-[var(--barva-tmava)]">{challenge.title}</h1>
            </div>

            <div className="border-t border-b border-gray-100 py-6">
                <h2 className="text-lg sm:text-xl font-semibold text-[var(--barva-tmava)] mb-4">Potřebné dovednosti</h2>
                <div className="flex flex-wrap gap-2">
                    {sortedSkills.map(({ Skill }) => {
                        const isMatch = studentSkillIds.has(Skill.id);
                        return (
                            <span 
                                key={Skill.id} 
                                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-semibold transition-colors ${
                                    isMatch 
                                    ? 'bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)] border border-[var(--barva-primarni)]' 
                                    : 'bg-white text-gray-600 border border-gray-300'
                                }`}
                            >
                                {Skill.name}
                            </span>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center text-[var(--barva-tmava)] py-4 text-base sm:text-lg font-semibold gap-4">
                <span>Přihlášeno: <strong>{challenge.Submission.length} / {challenge.max_applicants}</strong></span>
                <span className='flex flex-col items-center gap-1 sm:gap-2 justify-between'>Odměna: <strong><RewardsDisplay challenge={challenge} /></strong></span>
            </div>
            
            <div className="prose max-w-none text-[var(--barva-tmava)] prose-headings:font-semibold prose-h3:text-lg prose-h3:mt-3 prose-h3:border-b-2 prose-h3:pb-2">
                <p>{challenge.description}</p>
                <h3 className='text-xl md:text-2xl py-4 font-bold'>Cíle výzvy:</h3>
                <p>{challenge.goals}</p>
                <h3 className='text-xl md:text-2xl py-4 font-bold'>Co má být odevzdáno:</h3>
                <ul className='mt-3 list-disc pl-8 space-y-2'>
                    {expectedOutputsArray.map((output, index) => <li key={index}>{output}</li>)}
                </ul>
                
                {challenge.attachments_urls && challenge.attachments_urls.length > 0 && (
                    <>
                        <h3>Podklady ke stažení</h3>
                        <div className="mt-4 space-y-3">
                            {challenge.attachments_urls.map((url, index) => (
                                isApplied ? (
                                    <a key={index} href={url} target="_blank" rel="noopener noreferrer" download className="flex items-center gap-3 w-full sm:w-auto sm:inline-flex p-3 text-[var(--barva-primarni)] rounded-lg font-semibold hover:bg-blue-100 transition-colors">
                                        <Download size={20} />
                                        <span>{getFileNameFromUrl(url)}</span>
                                    </a>
                                ) : (
                                    <div key={index} className="group relative flex items-center gap-3 w-full sm:w-auto sm:inline-flex p-3 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed">
                                        <Lock size={20} />
                                        <span>{getFileNameFromUrl(url)}</span>
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            Pro stažení se přihlaste k výzvě
                                        </span>
                                    </div>
                                )
                            ))}
                        </div>
                    </>
                )}
                
                <p className='font-semibold text-lg sm:text-xl mt-6'>Termín odevzdání do: <strong className='ml-3'>{new Date(challenge.deadline).toLocaleDateString('cs-CZ')}</strong></p>
            </div>
            
            {!isApplied && (
                <div className="mt-10 text-center">
                    <button onClick={onApply} disabled={isApplying || isChallengeFull} className="px-6 py-3 sm:px-7 sm:py-3 text-white bg-[var(--barva-primarni)] rounded-full font-normal text-xl sm:text-2xl outline-2 transition-colors duration-200 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {isApplying ? 'Přihlašuji...' : (isChallengeFull ? 'Kapacita naplněna' : 'Přihlásit se k výzvě')}
                    </button>
                </div>
            )}
        </div>
    );
}