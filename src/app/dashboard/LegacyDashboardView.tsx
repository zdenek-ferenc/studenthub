// src/app/dashboard/LegacyDashboardView.tsx
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CareerGrowthWidget from './CareerGrowthWidget';
import StudentChallengesWidget from './StudentChallengesWidget';
import RecommendedChallengesWidget from './RecommendedChallengesWidget';
import NotificationsWidget from './NotificationsWidget';
import StatsWidget from './StatsWidget';
import { Briefcase, TrendingUp, LayoutGrid, Sparkles, ToggleRight } from 'lucide-react';

type TabId = 'challenges' | 'growth' | 'activities';

export default function LegacyDashboardView({ onSwitch }: { onSwitch: () => void }) {
    const [activeTab, setActiveTab] = useState<TabId>('challenges');
    type PillButtonProps = { id: TabId; label: string; icon: React.ComponentType<{ size?: number }> };
    const PillButton = ({ id, label, icon: Icon }: PillButtonProps) => (
        <button onClick={() => setActiveTab(id)} className={`relative flex-1 flex items-center justify-center gap-2 p-2 rounded-full text-sm font-semibold transition-colors ${activeTab === id ? 'bg-[var(--barva-primarni)] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>
            <Icon size={18} /> {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-4 md:pt-32 pb-12 px-4 sm:px-6">
            <div className="max-w-[1600px] mx-auto">
                <div className="bg-[var(--barva-primarni)] text-white rounded-2xl p-4 mb-4 md:mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg"><Sparkles size={20} className="text-white"/></div>
                        <div>
                            <p className="font-bold text-sm">Nový Dashboard 2.0</p>
                            <p className="text-xs text-blue-200">Vyzkoušej tmavý režim a nové widgety.</p>
                        </div>
                    </div>
                    <button onClick={onSwitch} className="px-4 py-2 bg-white text-[var(--barva-primarni)] rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors flex items-center gap-2">
                        Přepnout na nový <ToggleRight size={16}/>
                    </button>
                </div>

                <div className="hidden lg:flex flex-row items-start gap-6 xl:gap-8">
                    <div className="flex-1 min-w-0 space-y-6">
                        <StudentChallengesWidget />
                        <div className="grid grid-cols-1 2xl:grid-cols-[1.5fr_1fr] gap-6">
                            <NotificationsWidget />
                            <StatsWidget />
                        </div>
                        <RecommendedChallengesWidget />
                    </div>
                    <div className="w-[340px] xl:w-[400px] flex-shrink-0 sticky top-32">
                        <CareerGrowthWidget />
                    </div>
                </div>
                
                <div className="lg:hidden">
                    <div className="flex bg-white p-1 rounded-full mb-6 border border-gray-100 shadow-sm">
                        <PillButton id="challenges" label="Výzvy" icon={Briefcase} />
                        <PillButton id="growth" label="Růst" icon={TrendingUp} />
                        <PillButton id="activities" label="Aktivity" icon={LayoutGrid} />
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            {activeTab === 'challenges' && <div className="space-y-4"><StudentChallengesWidget /><RecommendedChallengesWidget /></div>}
                            {activeTab === 'growth' && <CareerGrowthWidget />}
                            {activeTab === 'activities' && <div className="space-y-4"><StatsWidget /><NotificationsWidget /></div>}
                        </motion.div>
                    </AnimatePresence>

                </div>
            </div>
        </div>
    );
}