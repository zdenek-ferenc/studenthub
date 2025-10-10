"use client";

import { useState, useEffect, useRef } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import withAuth from '../../components/withAuth';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient'; 
import LoadingSpinner from '../../components/LoadingSpinner';
import CareerGrowthWidget from './CareerGrowthWidget';
import StudentChallengesWidget from './StudentChallengesWidget';
import RecommendedChallengesWidget from './RecommendedChallengesWidget';
import NotificationsWidget from './NotificationsWidget';
import StatsWidget from './StatsWidget';
import { Briefcase, TrendingUp, LayoutGrid } from 'lucide-react';

type TabId = 'challenges' | 'growth' | 'activities';

type StudentProfileData = {
    username: string;
};

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
      className="relative flex-1 flex items-center justify-center gap-2 p-2 m-1 text-sm font-semibold transition-colors z-10"
    >
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-[var(--barva-primarni)] rounded-full shadow-md"
          layoutId="activePill"
        />
      )}
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
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('challenges');
  const [studentProfile, setStudentProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const hasFetchedProfile = useRef(false);

  useEffect(() => {
    if (user && !hasFetchedProfile.current) {
      const fetchStudentProfile = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('StudentProfile')
          .select('first_name, username')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error("Error fetching student profile for dashboard:", error);
        } else {
          setStudentProfile(data);
          hasFetchedProfile.current = true;
        }
        setLoading(false);
      };
      fetchStudentProfile();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]); 

  const displayName = studentProfile?.username ? studentProfile.username : "zpět";

  if (authLoading || loading) return <LoadingSpinner />;
  if (profile?.role !== 'student') return <p className="text-center py-20">Tato stránka je určena pouze pro studenty.</p>;

  return (
    <div className="container mx-auto px-4 py-8 md:py-32">
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--barva-tmava)] mb-2 md:mb-8">
        Vítej <span className='text-[var(--barva-primarni)]'>{displayName}</span>!
      </h1>
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
      <div className="lg:hidden">
        <div className="relative flex items-center justify-around bg-white p-1 rounded-full mb-3 border border-gray-100 shadow-sm" >
          <PillButton id="challenges" label="Výzvy" icon={Briefcase} activeTab={activeTab} setActiveTab={setActiveTab} />
          <PillButton id="growth" label="Růst" icon={TrendingUp} activeTab={activeTab} setActiveTab={setActiveTab} />
          <PillButton id="activities" label="Aktivity" icon={LayoutGrid} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'challenges' && (
              <div className="space-y-3">
                <StudentChallengesWidget />
                <RecommendedChallengesWidget />
              </div>
            )}
            {activeTab === 'growth' && (
              <CareerGrowthWidget />
            )}
            {activeTab === 'activities' && (
              <div className="space-y-3">
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