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
                flex w-full items-center justify-center gap-2 px-2 md:px-3 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative
                ${view === id 
                ? 'bg-[var(--barva-primarni)] text-white shadow-lg shadow-blue-900/30' 
                : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'}
            `}
        >
            <span className='hidden md:block'><Icon size={16} /> </span>
            <span>{label}</span>
            <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] min-w-[20px] text-center ${view === id ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500'}`}>
                {count}
            </span>
        </button>
    );

    return (
        // ZDE JE TEN WRAPPER (CONTAINER) PODLE TVÉHO PŘÁNÍ
        <div className="bg-[#0B1623]/60 backdrop-blur-xl shadow-xl border border-white/5 rounded-3xl p-4 md:p-6 relative overflow-hidden h-full flex flex-col">
            
            {/* HLAVIČKA A NAVIGACE */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-3 md:mb-6">
                {/* UPRAVENÝ NADPIS PODLE VZORU */}
                <h3 className="font-bold text-sm md:text-base text-white flex items-center gap-2">
                    <LayoutList size={18} className="text-blue-400"/> 
                    Moje Výzvy
                </h3>
                
                {/* Taby pro přepínání */}
                <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    <div className="flex justify-between gap-1 p-1 bg-[#0B1623] border border-white/10 rounded-xl md:rounded-2xl min-w-max">
                        <TabButton id="active" label="Aktivní" icon={Layers} count={activeChallenges.length} />
                        <TabButton id="completed" label="Hotové" icon={CheckCircle2} count={completedChallenges.length} />
                        <TabButton id="saved" label="Uložené" icon={Bookmark} count={savedChallenges.length} />
                    </div>
                </div>
            </div>

            {/* OBSAH */}
            <div className="flex-1">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={view} 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }} 
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {loading ? (
                            <div className="flex justify-center py-12"><LoadingSpinner /></div>
                        ) : (
                            <div className="space-y-3">
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
        </div>
    );
}

const EmptyState = ({ title, text }: { title: string, text: string }) => (
    <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center h-full min-h-[200px]">
        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3 text-gray-500">
            <Layers size={20} />
        </div>
        <h4 className="text-white font-bold text-sm mb-1">{title}</h4>
        <p className="text-gray-500 text-xs mb-4 max-w-xs">{text}</p>
        <Link href="/challenges" className="btn-shiny inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--barva-primarni)] text-white font-bold text-xs hover:bg-blue-500 transition-all">
            Najít výzvu
        </Link>
    </div>
);