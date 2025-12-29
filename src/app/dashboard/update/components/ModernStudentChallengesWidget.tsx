"use client";

import { useMemo, useState } from 'react';
import { useDashboard } from '../../../../contexts/DashboardContext';
import ModernActiveChallengeCard from './ModernActiveChallengeCard';
import ModernCompletedChallengeCard from './ModernCompletedChallengeCard';
import ModernSavedChallengeCard from './ModernSavedChallengeCard';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import { Layers, CheckCircle2, Bookmark, LayoutList } from 'lucide-react';

type View = 'active' | 'completed' | 'saved';

export default function ModernStudentChallengesWidget() {
    const { submissions: allSubmissions, savedChallenges, loading } = useDashboard();
    const [view, setView] = useState<View>('active');

    const { activeChallenges, completedChallenges } = useMemo(() => {
        if (!allSubmissions) return { activeChallenges: [], completedChallenges: [] };
        
        const active = allSubmissions.filter(s => 
            ['applied', 'submitted'].includes(s.status) || 
            (s.status === 'reviewed' && s.Challenge?.status === 'open')
        );
        
        const completed = allSubmissions.filter(s => 
            ['winner', 'rejected'].includes(s.status) || 
            (s.status === 'reviewed' && s.Challenge?.status === 'closed')
        );
        
        return { activeChallenges: active, completedChallenges: completed };
    }, [allSubmissions]);

    type TabButtonProps = { id: View; label: string; icon: React.ComponentType<{ size?: number }>; count: number };
    
    const TabButton = ({ id, label, icon: Icon, count }: TabButtonProps) => (
        <button 
            onClick={() => setView(id)}
            className={`
                flex w-full items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative
                ${view === id 
                ? 'bg-[var(--barva-primarni)] text-white shadow-lg shadow-blue-900/30' 
                : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'}
            `}
        >
            <span className='hidden md:block'><Icon size={16} /> </span>
            <span>{label}</span>
            {/* ZDE JE ZMĚNA: Zobrazujeme vždy, i když je 0 */}
            <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] min-w-[20px] text-center ${view === id ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500'}`}>
                {count}
            </span>
        </button>
    );

    return (
        <section className="space-y-2 md:space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 px-1">
                    <LayoutList size={20} className="text-blue-500"/>
                    Moje Výzvy
                </h2>
                
                <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    <div className="flex justify-between gap-1 p-1 bg-[#0B1623] border border-white/10 rounded-2xl min-w-max">
                        <TabButton id="active" label="Aktivní" icon={Layers} count={activeChallenges.length} />
                        <TabButton id="completed" label="Hotové" icon={CheckCircle2} count={completedChallenges.length} />
                        <TabButton id="saved" label="Uložené" icon={Bookmark} count={savedChallenges.length} />
                    </div>
                </div>
            </div>

            <div>
                <AnimatePresence mode="wait">
                    <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        {loading ? (
                            <div className="flex justify-center py-12"><LoadingSpinner /></div>
                        ) : (
                            <div className="space-y-4">
                                {view === 'active' && (activeChallenges.length > 0 
                                    ? activeChallenges.map(sub => <ModernActiveChallengeCard key={sub.id} submission={sub} />) 
                                    : <EmptyState title="Žádné aktivní výzvy" text="Vyber si projekt v katalogu a začni tvořit." />)}
                                
                                {view === 'completed' && (completedChallenges.length > 0 
                                    ? completedChallenges.map(sub => <ModernCompletedChallengeCard key={sub.id} submission={sub} />) 
                                    : <EmptyState title="Zatím prázdno" text="Tvé úspěšně dokončené projekty se objeví zde." />)}
                                
                                {view === 'saved' && (savedChallenges.length > 0 
                                    ? savedChallenges.map(saved => <ModernSavedChallengeCard key={saved.Challenge?.id} savedChallenge={saved} />) 
                                    : <EmptyState title="Nic uloženého" text="Ukládej si zajímavé výzvy na později." />)}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}

const EmptyState = ({ title, text }: { title: string, text: string }) => (
    <div className="text-center py-6 px-4 md:py-10 md:px-6 rounded-3xl border border-dashed border-white/10 bg-[#0B1623]/30">
        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-600">
            <Layers size={20} />
        </div>
        <h4 className="text-white font-bold text-sm mb-1">{title}</h4>
        <p className="text-gray-500 text-xs mb-4 max-w-xs mx-auto">{text}</p>
        <Link href="/challenges" className="btn-shiny inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--barva-primarni)] text-white font-bold text-xs hover:bg-blue-500 transition-all">
            Najít výzvu
        </Link>
    </div>
);