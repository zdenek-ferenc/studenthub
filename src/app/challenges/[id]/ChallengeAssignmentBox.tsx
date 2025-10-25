"use client";

import Image from 'next/image';
import { Download, Lock, Award, Users, Calendar } from 'lucide-react';
import { useMemo } from 'react';
import { differenceInDays } from 'date-fns';

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

const getFileNameFromUrl = (url: string) => {
    try {
        const name = url.split('/').pop()?.split('-').slice(1).join('-') || 'Soubor';
        return decodeURIComponent(name);
    } catch { return 'Soubor ke stažení'; }
};

const StatItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | React.ReactNode }) => (
    <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2 text-gray-500 font-semibold">
            <Icon size={16} />
            <span className="text-xs md:text-sm">{label}</span>
        </div>
        <span className="font-bold sm:text-lg text-[var(--barva-tmava)] mt-1">{value}</span>
    </div>
);

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

    const topReward = useMemo(() => {
        const rewards = [challenge.reward_first_place, challenge.reward_second_place, challenge.reward_third_place].filter(r => r !== null) as number[];
        if (rewards.length === 0) return challenge.reward_description || 'Nefinanční';
        return `${Math.max(...rewards).toLocaleString('cs-CZ')} Kč`;
    }, [challenge]);

    const daysRemaining = differenceInDays(new Date(challenge.deadline), new Date());

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-gray-100">
            <header className="flex items-center gap-4 sm:gap-6 mb-6">
                <Image
                    src={challenge.StartupProfile?.logo_url || '/logo.svg'}
                    alt="logo firmy"
                    width={80}
                    height={80}
                    className="rounded-full p-1 w-16 h-16 sm:w-20 sm:h-20 object-fill flex-shrink-0"
                />
                <div className='space-y-1'>
                    <h3 className="font-bold text-xs sm:text-base text-gray-800/70">{challenge.StartupProfile?.company_name}</h3>
                    <h1 className="text-base sm:text-2xl font-bold text-[var(--barva-tmava)] -mt-1">{challenge.title}</h1>
                </div>
            </header>
            <section className="flex justify-between md:grid grid-cols-3 gap-4 py-4 border-y border-gray-100 mb-4 sm:mb-5">
                <StatItem icon={Award} label="Hlavní odměna" value={topReward} />
                <StatItem icon={Users} label="Kapacita" value={`${challenge.Submission.length} / ${challenge.max_applicants || '∞'}`} />
                <StatItem icon={Calendar} label="Termín" value={daysRemaining >= 0 ? `${daysRemaining} dní` : 'Ukončeno'} />
            </section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <main className="md:col-span-2 prose max-w-none text-gray-800 prose-h3:font-bold prose-h3:text-xl prose-h3:text-[var(--barva-tmava)] prose-h3:mb-2 prose-ul:list-disc prose-ul:pl-5">
                    <h3 className='sm:text-lg text-[var(--barva-primarni)] font-semibold'>Popis výzvy</h3>
                    <p className='text-sm sm:text-base p-2'>{challenge.description}</p>

                    <h3 className='sm:text-lg text-[var(--barva-primarni)] font-semibold'>Cíle</h3>
                    <p className='text-sm sm:text-base p-2'>{challenge.goals}</p>

                    <h3 className='sm:text-lg text-[var(--barva-primarni)] font-semibold'>Očekávané výstupy</h3>
                    <ul className='text-sm sm:text-base list-disc pl-5 p-2 space-y-2'>
                        {expectedOutputsArray.map((output, index) => <li key={index}>{output}</li>)}
                    </ul>

                    {challenge.attachments_urls && challenge.attachments_urls.length > 0 && (
                        <>
                            <h3>Podklady ke stažení</h3>
                            <div className="not-prose space-y-3">
                                {challenge.attachments_urls.map((url, index) => (
                                    isApplied ? (
                                        <a key={index} href={url} target="_blank" rel="noopener noreferrer" download className="flex items-center gap-3 w-full sm:w-auto sm:inline-flex p-3 text-[var(--barva-primarni)] bg-blue-50 rounded-lg font-semibold hover:bg-blue-100 transition-colors">
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
                </main>
                <aside className="md:col-span-1 space-y-6">
                    <div>
                        <h3 className="sm:text-lg font-bold text-[var(--barva-tmava)] mb-3">Potřebné dovednosti</h3>
                        <div className="flex flex-wrap gap-2">
                            {sortedSkills.map(({ Skill }) => {
                                const isMatch = studentSkillIds.has(Skill.id);
                                return (
                                    <span
                                        key={Skill.id}
                                        className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${isMatch
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
                </aside>
            </div>
            {!isApplied && (
                        <div className="flex justify-center mt-6">
                            <button onClick={onApply} disabled={isApplying || isChallengeFull} className="px-6 py-2 cursor-pointer text-white bg-[var(--barva-primarni)] rounded-full text-lg transition-all ease-in-out duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed hover:opacity-90">
                                {isApplying ? 'Přihlašuji...' : (isChallengeFull ? 'Kapacita naplněna' : 'Přihlásit se k výzvě')}
                            </button>
                        </div>
                    )}
        </div>
    );
}