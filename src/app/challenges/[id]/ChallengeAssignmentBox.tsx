"use client";

import Image from 'next/image';
import { Download, Lock, Trophy, Users, CalendarClock, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

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
    created_at: string;
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
    applicantCount: number | null;
};

const getFileNameFromUrl = (url: string) => {
    try {
        const name = url.split('/').pop()?.split('-').slice(1).join('-') || 'Soubor';
        return decodeURIComponent(name);
    } catch { return 'Soubor ke stažení'; }
};

const getInitials = (name: string) => {
    if (!name) return '?';
    return name
        .split(' ')
        .filter(part => part.length > 0)
        .slice(0, 2)
        .map(part => part[0])
        .join('')
        .toUpperCase();
};

export default function ChallengeAssignmentBox({ challenge, isApplied, studentSkillIds, onApply, isApplying, isChallengeFull, applicantCount }: Props) {
    const { user } = useAuth();
    const router = useRouter();

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

    const daysRemaining = differenceInCalendarDays(new Date(challenge.deadline), new Date());
    const currentApplicants = applicantCount ?? challenge.Submission.length;

    const rewardsContent = useMemo(() => {
        const rewards = [];
        if (challenge.reward_first_place) rewards.push({ label: '1.', value: challenge.reward_first_place });
        if (challenge.reward_second_place) rewards.push({ label: '2.', value: challenge.reward_second_place });
        if (challenge.reward_third_place) rewards.push({ label: '3.', value: challenge.reward_third_place });

        if (rewards.length > 0) {
            if (rewards.length > 1) {
                return (
                    <div className="flex flex-col gap-1 w-full max-w-[200px]">
                        {rewards.map((r, i) => (
                            <div key={i} className="flex justify-between items-center text-sm w-full border-b border-gray-100 last:border-0 pb-1 last:pb-0">
                                <span className="font-bold text-[var(--barva-primarni)] bg-[var(--barva-svetle-pozadi)] w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                    {r.label}
                                </span>
                                <span className="font-semibold text-gray-700">{r.value.toLocaleString('cs-CZ')} Kč</span>
                            </div>
                        ))}
                    </div>
                );
            }
            return (
                <div className="text-xl sm:text-2xl font-bold text-[var(--barva-primarni)]">
                    {rewards[0].value.toLocaleString('cs-CZ')} Kč
                </div>
            );
        }
        return <span className="text-gray-600 font-medium">{challenge.reward_description || 'Nefinanční odměna'}</span>;
    }, [challenge]);

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 md:px-10 md:pt-10 pb-2">
                <header className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-4 md:mb-8">
                    {challenge.StartupProfile?.logo_url ? (
                        <Image
                            src={challenge.StartupProfile.logo_url}
                            alt="logo firmy"
                            width={80}
                            height={80}
                            className="hidden md:block rounded-full w-20 h-20 object-contain bg-white shadow-sm border border-gray-100 p-2"
                        />
                    ) : (
                        <div className="hidden w-20 h-20 rounded-full md:flex items-center justify-center bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)] text-2xl font-bold border border-[var(--barva-primarni)]/10">
                            {getInitials(challenge.StartupProfile?.company_name || '')}
                        </div>
                    )}
                    
                    <div className='flex-1 space-y-1 px-2 md:px-0'>
                        <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            {challenge.StartupProfile?.company_name}
                            <ChevronRight size={14} />
                            <span>Výzva</span>
                        </div>
                        <h1 className="text-xl md:text-2xl xl:text-3xl font-bold text-[var(--barva-tmava)] leading-tight">{challenge.title}</h1>
                    </div>
                </header>
                <div className="grid grid-cols-3 items-start md:items-center md:divide-y-0 md:divide-x divide-gray-100 md:bg-gray-50/50 rounded-2xl md:border border-gray-100 mb-4 xl:mb-6">
                    <div className="p-2 md:p-6 flex flex-col items-center justify-center text-center group transition-colors duration-300 first:rounded-t-2xl md:first:rounded-l-2xl md:first:rounded-tr-none">
                        <div className="mb-2 text-[var(--barva-primarni)] transition-colors">
                            <Trophy size={24} strokeWidth={1.5} />
                        </div>
                        <span className="text-xs font-bold text-[var(--barva-tmava)] uppercase tracking-wider mb-2">Odměna</span>
                        <div className="flex items-center justify-center w-full">
                            {rewardsContent}
                        </div>
                    </div>
                    <div className="p-2 md:p-6 flex flex-col items-center justify-center text-center group transition-colors duration-300">
                        <div className="mb-2 text-[var(--barva-primarni)] transition-colors">
                            <Users size={24} strokeWidth={1.5} />
                        </div>
                        <span className="text-xs font-bold text-[var(--barva-tmava)] uppercase tracking-wider mb-1">Kapacita</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl md:text-2xl font-bold text-[var(--barva-tmava)]">{currentApplicants}</span>
                            <span className="text-gray-400 font-medium text-lg">/ {challenge.max_applicants || '∞'}</span>
                        </div>
                        <span className="text-[10px] md:text-xs text-gray-400 mt-1">přihlášených studentů</span>
                    </div>
                    <div className="p-2 md:p-6 flex flex-col items-center justify-center text-center group transition-colors duration-300 last:rounded-b-2xl md:last:rounded-r-2xl md:last:rounded-bl-none">
                        <div className="mb-2 text-[var(--barva-primarni)] transition-colors">
                            <CalendarClock size={24} strokeWidth={1.5} />
                        </div>
                        <span className="text-xs font-bold text-[var(--barva-tmava)] uppercase tracking-wider mb-1">Deadline</span>
                        <div className={`text-xl md:text-2xl font-bold ${daysRemaining < 3 ? 'text-red-500' : 'text-[var(--barva-tmava)]'}`}>
                            {daysRemaining >= 0 ? `${daysRemaining} dní` : 'Ukončeno'}
                        </div>
                        <span className="text-[10px] md:text-xs text-gray-400 mt-1">
                            {new Date(challenge.deadline).toLocaleDateString('cs-CZ')}
                        </span>
                    </div>
                </div>
            </div>
            <div className="px-6 sm:px-10 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-14">
                    <main className="md:col-span-2 space-y-8">
                        <div className="prose max-w-none text-gray-600">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--barva-tmava)] mb-3">
                                <span className="w-1.5 h-6 rounded-full bg-[var(--barva-primarni)] block"></span>
                                Popis výzvy
                            </h3>
                            <p className="leading-relaxed text-sm lg:text-base">{challenge.description}</p>
                        </div>

                        <div className="prose max-w-none text-gray-600">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--barva-tmava)] mb-3">
                                <span className="w-1.5 h-6 rounded-full bg-[var(--barva-primarni)] block"></span>
                                Cíle spolupráce
                            </h3>
                            <p className="leading-relaxed text-sm lg:text-base">{challenge.goals}</p>
                        </div>

                        <div>
                            <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--barva-tmava)] mb-4">
                                <span className="w-1.5 h-6 rounded-full bg-[var(--barva-primarni)] block"></span>
                                Očekávané výstupy
                            </h3>
                            <ul className="grid gap-3">
                                {expectedOutputsArray.map((output, index) => (
                                    <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg text-gray-700 text-sm">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--barva-primarni)] flex-shrink-0" />
                                        <span className="leading-snug">{output}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {challenge.attachments_urls && challenge.attachments_urls.length > 0 && (
                            <div>
                                <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--barva-tmava)] mb-4">
                                    <span className="w-1.5 h-6 rounded-full bg-[var(--barva-primarni)] block"></span>
                                    Podklady ke stažení
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {challenge.attachments_urls.map((url, index) => (
                                        isApplied ? (
                                            <a key={index} href={url} target="_blank" rel="noopener noreferrer" download className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-[var(--barva-primarni)] rounded-xl font-semibold hover:bg-blue-100 transition-all border border-blue-100 group">
                                                <div className="p-1.5 bg-white rounded-lg group-hover:scale-110 transition-transform">
                                                    <Download size={18} />
                                                </div>
                                                <span className="text-sm">{getFileNameFromUrl(url)}</span>
                                            </a>
                                        ) : (
                                            <div key={index} className="group relative flex items-center gap-3 px-4 py-3 bg-gray-50 text-gray-400 rounded-xl border border-gray-100 cursor-not-allowed">
                                                <Lock size={18} />
                                                <span className="text-sm">{getFileNameFromUrl(url)}</span>
                                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                                    Pro stažení se musíte přihlásit
                                                </span>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </main>
                    <aside className="md:col-span-1 space-y-4 md:space-y-6 lg:space-y-8">
                        <div className="bg-gray-50 p-4 lg:p-6 rounded-2xl border border-gray-100">
                            <h3 className="font-bold text-[var(--barva-tmava)] mb-4 flex items-center gap-2">
                                Potřebné dovednosti
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {sortedSkills.map(({ Skill }) => {
                                    const isMatch = studentSkillIds.has(Skill.id);
                                    return (
                                        <span
                                            key={Skill.id}
                                            className={`px-3 py-1.5 rounded-3xl text-sm font-medium transition-colors ${isMatch
                                                ? 'bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)] border border-[var(--barva-primarni)]'
                                                : 'bg-white text-gray-500 border border-gray-200'
                                                }`}
                                        >
                                            {Skill.name}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 lg:p-6 rounded-2xl border border-gray-100">
                             <h3 className="font-bold text-[var(--barva-tmava)] mb-4">Informace</h3>
                             <div className="space-y-4 text-sm">
                                <div className='flex justify-between items-center'>
                                    <span className='text-gray-500'>Vytvořeno</span>
                                    <span className='font-medium text-gray-800'>{new Date(challenge.created_at).toLocaleDateString('cs-CZ')}</span>
                                </div>
                                <div className='w-full h-px bg-gray-200'></div>
                                <div className='flex justify-between items-center'>
                                    <span className='text-gray-500'>Stav</span>
                                    <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${isChallengeFull ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        {isChallengeFull ? 'Plno' : 'Otevřeno'}
                                    </span>
                                </div>
                             </div>
                        </div>
                    </aside>
                </div>
                {!isApplied && (
                    <div className="flex justify-center pt-8">
                        {user ? (
                            <button 
                                onClick={onApply} 
                                disabled={isApplying || isChallengeFull} 
                                className="group relative px-8 py-4 bg-[var(--barva-primarni)] hover:opacity-95 cursor-pointer text-white rounded-full lg:text-lg font-bold transition-all duration-200 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:translate-y-0 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {isApplying ? 'Přihlašuji...' : (isChallengeFull ? 'Kapacita naplněna' : 'Chci se přihlásit k výzvě')}
                                    {!isApplying && !isChallengeFull && <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform"/>}
                                </span>
                            </button>
                        ) : (
                            <button onClick={() => router.push('/register')} className="px-8 cursor-pointer py-4 bg-[var(--barva-primarni)] text-white rounded-full text-lg font-bold shadow-lg transition-all">
                                Zaregistrujte se pro účast
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}