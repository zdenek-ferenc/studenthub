"use client";

import { useState } from 'react';
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
import { Briefcase, TrendingUp, LayoutGrid } from 'lucide-react';

type TabId = 'challenges' | 'growth' | 'activities';

const PillButton = ({ id, label, icon: Icon, activeTab, setActiveTab }: { id: TabId, label: string, icon: React.ElementType, activeTab: TabId, setActiveTab: (id: TabId) => void }) => {
  const isActive = activeTab === id;
  return (
    <button onClick={() => setActiveTab(id)} className="relative flex-1 flex items-center justify-center gap-2 p-2 m-1 text-xs sm:text-sm font-semibold transition-colors z-10">
      {isActive && ( <motion.div className="absolute inset-0 bg-[var(--barva-primarni)] rounded-full shadow-md" layoutId="activePill" /> )}
      <div className={`relative transition-colors ${isActive ? 'text-white' : 'cursor-pointer text-gray-500'}`}><Icon size={20} /></div>
      <span className={`relative transition-colors ${isActive ? 'text-white' : 'cursor-pointer text-gray-500'}`}>{label}</span>
    </button>
  );
};

function DashboardClientView() {
  const { profile, loading: authLoading } = useAuth();
  const { studentProfile, loading: dashboardLoading } = useDashboard();
  const [activeTab, setActiveTab] = useState<TabId>('challenges');
  const displayName = studentProfile?.username ? studentProfile.username : "zpět";

  if (authLoading || dashboardLoading) {
    return <div className='md:pt-32'><LoadingSpinner /></div>;
  }
  if (profile?.role !== 'student') return <p className="text-center py-20">Tato stránka je určena pouze pro studenty.</p>;

  return (
    <div className="h-full flex flex-col sm:max-w-5/6 mx-auto px-4 py-4 sm:py-8 md:py-28 3xl:py-32">
      <div className="hidden lg:flex flex-col item-center lg:flex-row items-start gap-6 3xl:gap-5">
        <div className="w-full mx-auto space-y-6 3xl:space-y-5">
            <StudentChallengesWidget />
            <div className="grid grid-cols-1 md:grid-cols-[4fr_3fr] 3xl:grid-cols-[2fr_1fr] gap-6 3xl:md:gap-5">
                <NotificationsWidget />
                <StatsWidget />
            </div>
            <RecommendedChallengesWidget />
        </div>
        <div className="w-1/2">
            <CareerGrowthWidget />
        </div>
      </div>
      <div className="lg:hidden">
        <div className="relative flex items-center justify-around bg-white p-1 rounded-full mb-3 border border-gray-100 shadow-sm" >
          <PillButton id="challenges" label="Výzvy" icon={Briefcase} activeTab={activeTab} setActiveTab={setActiveTab} />
          <PillButton id="growth" label="Růst" icon={TrendingUp} activeTab={activeTab} setActiveTab={setActiveTab} />
          <PillButton id="activities" label="Aktivity" icon={LayoutGrid} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {activeTab === 'challenges' && ( <div className="space-y-3"><StudentChallengesWidget /><RecommendedChallengesWidget /></div> )}
            {activeTab === 'growth' && ( <CareerGrowthWidget /> )}
            {activeTab === 'activities' && ( <div className="space-y-3"><StatsWidget /><NotificationsWidget /></div> )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default withAuth(DashboardClientView);