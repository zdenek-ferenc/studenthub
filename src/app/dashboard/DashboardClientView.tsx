"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import withAuth from '../../components/withAuth';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboard } from '../../contexts/DashboardContext';
import LoadingSpinner from '../../components/LoadingSpinner';

import CareerGrowthWidget from './CareerGrowthWidget';
import StudentChallengesWidget from './StudentChallengesWidget';
import RecommendedChallengesWidget from './RecommendedChallengesWidget';
import NotificationsWidget from './NotificationsWidget';
import StatsWidget from './StatsWidget';
import { Briefcase, TrendingUp, LayoutGrid, Sparkles, ToggleLeft, ToggleRight } from 'lucide-react';

import ModernDashboardView from './update/ModernDashboardView';

type TabId = 'challenges' | 'growth' | 'activities';

const LegacyDashboard = ({ onSwitch }: { onSwitch: () => void }) => {
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
                    {/* Desktop Toggle Button */}
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
};


function DashboardClientView() {
    const { profile, loading: authLoading } = useAuth();
    const { loading: dashboardLoading } = useDashboard();
    const router = useRouter();
    const [isModern, setIsModern] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedPref = localStorage.getItem('dashboard_v2_enabled');
        if (savedPref === 'true') setIsModern(true);
        if (!authLoading && profile?.role === 'startup') router.push('/challenges');
    }, [profile, authLoading, router]);

    const toggleDesign = () => {
        const newVal = !isModern;
        setIsModern(newVal);
        localStorage.setItem('dashboard_v2_enabled', String(newVal));
    };

    if (authLoading || dashboardLoading || profile?.role === 'startup' || !mounted) {
        return <div className='md:pt-32 flex justify-center'><LoadingSpinner /></div>;
    }

    if (profile?.role !== 'student') return <p className="text-center py-32 text-gray-500">Pouze pro studenty.</p>;

    return (
        <>
            {isModern ? (
                <>
                    {/* DESKTOP: Floating Toggle (Hidden on Mobile) */}
                    <div className="hidden md:block fixed bottom-6 left-6 z-40 animate-fade-in-up">
                        <button 
                            onClick={toggleDesign}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0B1623]/80 backdrop-blur-md border border-white/10 text-xs font-medium text-gray-400 hover:text-white hover:border-white/30 transition-all shadow-xl group"
                        >
                            <ToggleLeft size={16} className="text-blue-500 group-hover:text-blue-400"/>
                            <span className="hidden sm:inline">Zpět na starý design</span>
                        </button>
                    </div>

                    <ModernDashboardView />

                    {/* MOBILE: Static Toggle at the very bottom */}
                    <div className="md:hidden py-8 flex justify-center bg-[#001224] -mt-1">
                        <button 
                            onClick={toggleDesign}
                            className="flex items-center border rounded-full border-gray-500 gap-2 px-5 py-3 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            <ToggleLeft size={18} />
                            Zpět na starý design
                        </button>
                    </div>
                </>
            ) : (
                <LegacyDashboard onSwitch={toggleDesign} />
            )}
        </>
    );
}

export default withAuth(DashboardClientView);