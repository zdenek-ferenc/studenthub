"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import withAuth from '../../components/withAuth';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import CareerGrowthWidget from './CareerGrowthWidget';
import StudentChallengesWidget from './StudentChallengesWidget';
import RecommendedChallengesWidget from './RecommendedChallengesWidget';
import NotificationsWidget from './NotificationsWidget';
import StatsWidget from './StatsWidget';
import { Briefcase, TrendingUp, LayoutGrid } from 'lucide-react';

// ZMĚNA #1: Nový typ pro ID záložek a vylepšená komponenta pro tlačítko
type TabId = 'challenges' | 'growth' | 'activities';

const PillButton = ({
  id,
  label,
  icon: Icon,
  activeTab,
  setActiveTab
}: {
  id: TabId,
  label: string,
  icon: React.ElementType,
  activeTab: TabId,
  setActiveTab: (id: TabId) => void
}) => {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => setActiveTab(id)}
      className="relative flex-1 flex items-center justify-center gap-2 p-3 text-sm font-semibold transition-colors z-10"
    >
      {/* Animovaný podklad pro aktivní tlačítko */}
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-[var(--barva-primarni)] rounded-full shadow-md"
          layoutId="activePill"
        />
      )}
      {/* Ikona a text */}
      <div className={`relative transition-colors ${isActive ? 'text-white' : 'cursor-pointer text-gray-500'}`}>
        <Icon size={20} />
      </div>
      <span className={`relative transition-colors ${isActive ? 'text-white' : 'cursor-pointer text-gray-500'}`}>
        {label}
      </span>
    </button>
  );
};

function DashboardPage() {
  const { profile, loading } = useAuth();
  // ZMĚNA #2: Aktualizovaný výchozí stav
  const [activeTab, setActiveTab] = useState<TabId>('challenges');

  const firstName = profile?.email?.split('@')[0];
  const displayName = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : "zpět";

  if (loading) return <LoadingSpinner />;
  if (profile?.role !== 'student') return <p className="text-center py-20">Tato stránka je určena pouze pro studenty.</p>;

  return (
    <div className="container mx-auto px-4 py-8 md:py-32">
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--barva-tmava)] mb-6 md:mb-8">
        Vítej {displayName}!
      </h1>

      {/* --- PŮVODNÍ LAYOUT PRO DESKTOP (beze změny) --- */}
      <div className="hidden lg:flex flex-col lg:flex-row items-start gap-6 md:gap-8">
        <div className="w-full lg:w-2/3 space-y-6 md:space-y-8">
            <StudentChallengesWidget />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <NotificationsWidget />
                <StatsWidget />
            </div>
            <RecommendedChallengesWidget />
        </div>
        <div className="w-full lg:w-1/3">
            <CareerGrowthWidget />
        </div>
      </div>

      {/* --- NOVÝ A VYLEPŠENÝ LAYOUT PRO MOBILNÍ ZAŘÍZENÍ --- */}
      <div className="lg:hidden">
        {/* ZMĚNA #3: Nový "pilulkový" design navigace */}
        <div className="relative flex items-center justify-around bg-white p-1 rounded-full mb-6">
          <PillButton id="challenges" label="Výzvy" icon={Briefcase} activeTab={activeTab} setActiveTab={setActiveTab} />
          <PillButton id="growth" label="Růst" icon={TrendingUp} activeTab={activeTab} setActiveTab={setActiveTab} />
          <PillButton id="activities" label="Aktivity" icon={LayoutGrid} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* ZMĚNA #4: Aktualizovaný obsah záložek s novými ID */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'challenges' && (
              <div className="space-y-6">
                <StudentChallengesWidget />
                <RecommendedChallengesWidget />
              </div>
            )}
            {activeTab === 'growth' && (
              <CareerGrowthWidget />
            )}
            {activeTab === 'activities' && (
              <div className="space-y-6">
                <StatsWidget />
                <NotificationsWidget />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default withAuth(DashboardPage);