"use client";
import withAuth from '../../components/withAuth';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import CareerGrowthWidget from './CareerGrowthWidget';
// --- ZMĚNA ZDE: Měníme název importu ---
import StudentChallengesWidget from './StudentChallengesWidget';
import RecommendedChallengesWidget from './RecommendedChallengesWidget';
import NotificationsWidget from './NotificationsWidget';
import StatsWidget from './StatsWidget';

function DashboardPage() {
  const { profile, loading } = useAuth();
  const firstName = profile?.email?.split('@')[0];
  const displayName = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : "zpět";

  if (loading) return <LoadingSpinner />;
  if (profile?.role !== 'student') return <p className="text-center py-20">Tato stránka je určena pouze pro studenty.</p>;

  return (
    <div className="container mx-auto px-4 md:py-2 md:px-6">
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--barva-tmava)] mb-6 md:mb-8">
        Vítej {displayName}!
      </h1>
      <div className="flex flex-col lg:flex-row items-start gap-6 md:gap-8">
        
        <div className="w-full lg:w-2/3 space-y-6 md:space-y-8">
            {/* --- ZMĚNA ZDE: Používáme nový widget --- */}
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
    </div>
  );
}

export default withAuth(DashboardPage);