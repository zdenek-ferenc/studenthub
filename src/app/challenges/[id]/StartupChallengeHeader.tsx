"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Award, Users, Calendar, ChevronDown, Download } from 'lucide-react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

type Skill = { id: string; name: string; };
type StartupProfile = { company_name: string; logo_url: string | null; };
type Challenge = {
id: string; status: 'draft' | 'open' | 'closed' | 'archived'; title: string;
description: string; goals: string; expected_outputs: string;
reward_first_place: number | null; reward_second_place: number | null; reward_third_place: number | null;
reward_description: string | null; 
attachments_urls: string[] | null; 
number_of_winners: number | null;
max_applicants: number | null; deadline: string;
Submission: { id: string, student_id: string }[];
ChallengeSkill: { Skill: Skill }[];
StartupProfile: StartupProfile | null;
};

const StatItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | React.ReactNode }) => (
    <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2 text-gray-500 font-semibold">
            <Icon size={16} />
            <span className="text-xs md:text-sm">{label}</span>
        </div>
        <span className="font-bold text-sm sm:text-lg text-[var(--barva-tmava)] mt-1">{value}</span>
    </div>
);

const RewardsDisplay = ({ challenge }: { challenge: Challenge }) => {
const rewards = [
    { place: '1.', amount: challenge.reward_first_place },
    { place: '2.', amount: challenge.reward_second_place },
    { place: '3.', amount: challenge.reward_third_place },
].filter(r => r.amount && r.amount > 0); 

if (rewards.length === 0) {
    return <span className="font-bold text-sm sm:text-lg text-[var(--barva-tmava)]">{challenge.reward_description || 'Nefinanční'}</span>;
}

const topReward = Math.max(...rewards.map(r => r.amount || 0));
return <span className="font-bold text-sm sm:text-lg text-[var(--barva-tmava)]">{topReward.toLocaleString('cs-CZ')} Kč</span>;
};

const getFileNameFromUrl = (url: string) => {
    try {
        const name = url.split('/').pop()?.split('-').slice(1).join('-') || 'Soubor ke stažení';
        return decodeURIComponent(name);
    } catch { return 'Soubor ke stažení'; }
};

export default function StartupChallengeHeader({ challenge }: { challenge: Challenge }) {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

const expectedOutputsArray = useMemo(() => challenge.expected_outputs.split('\n').filter(line => line.trim() !== ''), [challenge.expected_outputs]);
const deadlineFormatted = format(new Date(challenge.deadline), 'd. M. yyyy', { locale: cs });

return (
    <div className="bg-white px-4 3xl:px-6 pt-4 3xl:pt-6 sm:pb-4 rounded-2xl shadow-xs border border-gray-100 3xl:mb-8">
    <header className="flex items-center gap-4 3xl:gap-6  mb-2 3xl:mb-4">
        <Image
            src={challenge.StartupProfile?.logo_url || '/logo.svg'}
            alt={challenge.StartupProfile?.company_name || 'logo firmy'}
            width={80}
            height={80}
            className="rounded-xl w-14 h-14 3xl:w-16 3xl:h-16 object-contain flex-shrink-0"
        />
        <div>
            <h1 className="text-xl 3xl:text-2xl font-bold text-[var(--barva-tmava)] -mt-1">{challenge.title}</h1>
        </div>
    </header>

    <section className="grid grid-cols-3 gap-4 py-4 border-gray-100 mb-4">
        <StatItem icon={Award} label="Odměna" value={<RewardsDisplay challenge={challenge} />} />
        <StatItem icon={Users} label="Kapacita" value={`${challenge.Submission.length} / ${challenge.max_applicants || '∞'}`} />
        <StatItem icon={Calendar} label="Termín" value={deadlineFormatted} />
    </section>

    <button
        onClick={() => setIsDetailsVisible(!isDetailsVisible)}
        className="w-full flex pb-4 sm:pb-0 justify-between cursor-pointer items-center text-left 3xl:text-lg font-semibold text-[var(--barva-tmava)] hover:text-[var(--barva-tmava)]/80 transition-colors ease-in-out duration-200"
    >
        <span>{isDetailsVisible ? 'Skrýt původní zadání' : 'Zobrazit původní zadání'}</span>
        <motion.div animate={{ rotate: isDetailsVisible ? 180 : 0 }}>
        <ChevronDown className="cursor-pointer" size={24} />
        </motion.div>
    </button>

    <AnimatePresence initial={false}>
        {isDetailsVisible && (
        <motion.section
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
            open: { opacity: 1, height: 'auto', marginTop: '6px' },
            collapsed: { opacity: 0, height: 0, marginTop: '0px' }
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
        >
            <div className="grid grid-cols-1 lg:pt-4 md:grid-cols-3 gap-8">
                <main className="md:col-span-2 prose prose-sm max-w-none text-gray-800 prose-headings:font-bold prose-headings:text-lg prose-headings:text-[var(--barva-primarni)] prose-headings:mb-2 prose-ul:list-disc prose-ul:pl-5 space-y-4">
                    <div>
                        <h3 className='3xl:text-lg text-[var(--barva-primarni)] font-semibold'>Popis výzvy</h3>
                        <p className='text-sm 3xl:text-base p-2'>{challenge.description}</p>
                    </div>
                    <div>
                    <h3 className='3xl:text-lg text-[var(--barva-primarni)] font-semibold'>Cíle</h3>
                    <p className='text-sm 3xl:text-base p-2'>{challenge.goals}</p>
                    </div>
                    <div>
                    <h3 className='3xl:text-lg text-[var(--barva-primarni)] font-semibold'>Očekávané výstupy</h3>
                    <ul className='list-disc text-sm 3xl:text-base pl-5 p-2 space-y-2'>
                        {expectedOutputsArray.map((output, index) => <li key={index}>{output}</li>)}
                    </ul>
                    </div>
                    {challenge.attachments_urls && challenge.attachments_urls.length > 0 && (
                        <div>
                            <h3>Podklady ke stažení</h3>
                            <div className="not-prose space-y-2">
                                {challenge.attachments_urls.map((url, index) => (
                                    <a key={index} href={url} target="_blank" rel="noopener noreferrer" download className="flex items-center gap-2 w-full sm:w-auto sm:inline-flex px-3 py-1.5 text-[var(--barva-primarni)] bg-blue-50 rounded-lg font-semibold hover:bg-blue-100 transition-colors text-xs">
                                        <Download size={16} />
                                        <span>{getFileNameFromUrl(url)}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
                <aside className="md:col-span-1 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-[var(--barva-primarni)] mb-3">Potřebné dovednosti</h3>
                        <div className="flex flex-wrap gap-2">
                            {challenge.ChallengeSkill.map(({ Skill }) => (
                                <span
                                    key={Skill.id}
                                    className='px-2 py-1 3xl:px-3 3xl:py-1.5 rounded-full text-xs 3xl:text-sm font-semibold bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)] border border-[var(--barva-primarni)]'
                                >
                                    {Skill.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </motion.section>
        )}
    </AnimatePresence>
    </div>
);
}