"use client";

import { useMemo, useState } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import ActiveChallengeCard, { type ActiveChallengeData } from './ActiveChallengeCard';
import CompletedChallengeCard, { type CompletedChallengeData } from './CompletedChallengeCard';
import SavedChallengeCard from './SavedChallengeCard';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Bookmark } from 'lucide-react';


type View = 'active' | 'completed' | 'saved';

export default function StudentChallengesWidget() {
    const { submissions: allSubmissions, savedChallenges, loading } = useDashboard();
    const [view, setView] = useState<View>('active'); 
    const { activeChallenges, completedChallenges } = useMemo(() => {
        if (!allSubmissions) return { activeChallenges: [], completedChallenges: [] };
        const active = allSubmissions
            .filter(s =>
                s.status === 'applied' ||
                s.status === 'submitted' ||
                (s.status === 'reviewed' && s.Challenge?.status === 'open')
            )
            .sort((a) => (a.status === 'applied' ? -1 : 1));

        const completed = allSubmissions
            .filter(s =>
                s.status === 'winner' ||
                s.status === 'rejected' ||
                (s.status === 'reviewed' && s.Challenge?.status === 'closed')
            );

        return { activeChallenges: active, completedChallenges: completed };
    }, [allSubmissions]);

    const SwitchButton = ({ buttonView, label, count, icon: Icon }: { buttonView: View, label: string, count: number, icon?: React.ElementType }) => (
        <button
            onClick={() => setView(buttonView)}
            className={`px-3 sm:px-4 pb-2 rounded-lg text-xs sm:text-xs font-semibold transition-colors relative flex items-center gap-1.5 ${view === buttonView ? 'text-[var(--barva-primarni)]' : 'cursor-pointer text-gray-500 hover:text-[var(--barva-tmava)]'}`}
        >
            {Icon && <Icon size={14} className="hidden sm:inline-block" />} {/* Volitelná ikona */}
            {label}
            <span className="ml-1 p-1 text-xs">{count}</span>
            {view === buttonView && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--barva-primarni)]" layoutId="underline" />}
        </button>
    );

    return (
        <div className="bg-white p-3 sm:p-4 3xl:p-6 rounded-2xl shadow-xs border-2 border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h3 className="3xl:text-xl pb-2 md:pb-0 font-semibold text-[var(--barva-tmava)]">Výzvy</h3>
                {/* Přidáme nové tlačítko do přepínače */}
                <div className="flex items-center rounded-lg p-1 space-x-1 sm:space-x-2">
                    <SwitchButton buttonView="active" label="Aktivní" count={activeChallenges.length} />
                    <SwitchButton buttonView="completed" label="Hotové" count={completedChallenges.length} />
                    <SwitchButton buttonView="saved" label="Uložené" count={savedChallenges.length} />
                </div>
            </div>

            <div>
                <AnimatePresence mode="wait">
                    <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        {loading ? <LoadingSpinner /> : (
                            view === 'active' ? (
                                activeChallenges.length > 0 ? (
                                    <div className="space-y-4">
                                        {activeChallenges.map(sub => (
                                            <ActiveChallengeCard key={sub.id} submission={sub as unknown as ActiveChallengeData} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm 3xl:text-base text-center py-5 3xl:py-8">
                                        <p className="text-gray-500">Momentálně nepracuješ na žádné výzvě.</p>
                                        <Link href="/challenges" className="inline-block mt-4 px-6 py-2 rounded-full bg-[var(--barva-primarni)] text-white font-semibold cursor-pointer text-xs 3xl:text-sm hover:opacity-90 transition-all ease-in-out duration-200">
                                            Najít novou výzvu
                                        </Link>
                                    </div>
                                )
                            ) : view === 'completed' ? (
                                completedChallenges.length > 0 ? (
                                    <div className="space-y-4">
                                        {completedChallenges.map(sub => (
                                            <CompletedChallengeCard key={sub.id} submission={sub as unknown as CompletedChallengeData} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">Zatím jsi nedokončil žádnou výzvu.</p>
                                    </div>
                                )
                            ) : (
                                savedChallenges.length > 0 ? (
                                    <div className="space-y-4">
                                        {savedChallenges.map(saved => (
                                            <SavedChallengeCard key={saved.Challenge?.id} savedChallenge={saved} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">Zatím nemáš žádné uložené výzvy.</p>
                                        <Link href="/challenges" className="inline-block mt-4 px-6 py-2 rounded-full bg-[var(--barva-primarni)] text-white font-semibold cursor-pointer text-xs 3xl:text-sm hover:opacity-90 transition-all ease-in-out duration-200">
                                            Procházet výzvy
                                        </Link>
                                    </div>
                                )
                            )
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}