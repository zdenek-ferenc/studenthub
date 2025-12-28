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
    import { Briefcase, TrendingUp, LayoutGrid } from 'lucide-react';

    type TabId = 'challenges' | 'growth' | 'activities';

    const PillButton = ({ id, label, icon: Icon, activeTab, setActiveTab }: { id: TabId, label: string, icon: React.ElementType, activeTab: TabId, setActiveTab: (id: TabId) => void }) => {
    const isActive = activeTab === id;
    return (
        <button onClick={() => setActiveTab(id)} className="relative cursor-pointer hover:bg-gray-100/60 rounded-full flex-1 flex items-center justify-center gap-2 p-2 m-1 text-xs sm:text-sm font-semibold transition-colors z-10">
        {isActive && (<motion.div className="absolute inset-0 bg-[var(--barva-primarni)] rounded-full shadow-md" layoutId="activePill" />)}
        <div className={`relative transition-colors ${isActive ? 'text-white' : 'cursor-pointer text-gray-500'}`}><Icon size={20} /></div>
        <span className={`relative transition-colors ${isActive ? 'text-white' : 'cursor-pointer text-gray-500'}`}>{label}</span>
        </button>
    );
    };

    function DashboardClientView() {
    const { profile, loading: authLoading } = useAuth();
    const { studentProfile, loading: dashboardLoading } = useDashboard();
    const [activeTab, setActiveTab] = useState<TabId>('challenges');
    const router = useRouter();


    useEffect(() => {
        if (!authLoading && profile?.role === 'startup') {
        router.push('/challenges');
        }
    }, [profile, authLoading, router]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const displayName = studentProfile?.username ? studentProfile.username : "zpět";

    if (authLoading || dashboardLoading || profile?.role === 'startup') {
        return <div className='md:pt-32'><LoadingSpinner /></div>;
    }

    if (profile?.role !== 'student') {
        return <p className="text-center py-20 text-gray-500">Tato stránka je určena pouze pro studenty.</p>;
    }

    return (
        <div className="min-h-screen h-full flex flex-col w-full max-w-[1600px] mx-auto px-4 py-4 md:py-12 lg:py-30">

        <div className="hidden lg:flex flex-row items-start gap-6 xl:gap-8">
            <div className="flex-1 min-w-0 space-y-6">
            <StudentChallengesWidget />
            <div className="grid grid-cols-1 2xl:grid-cols-[1.5fr_1fr] gap-6">
                <NotificationsWidget />
                <StatsWidget />
            </div>

            <RecommendedChallengesWidget />
            </div>

            <div className="w-[340px] xl:w-[400px] flex-shrink-0 top-8">
            <CareerGrowthWidget />
            </div>
        </div>
        <div className="lg:hidden md:py-12">
            <div className="relative flex items-center justify-around bg-white p-1 rounded-full mb-3 border border-gray-100 shadow-xs">
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
                <div className="space-y-3 sm:space-y-6">
                    <StudentChallengesWidget />
                    <RecommendedChallengesWidget />
                </div>
                )}
                {activeTab === 'growth' && (
                <CareerGrowthWidget />
                )}
                {activeTab === 'activities' && (
                <div className="space-y-4">
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

    export default withAuth(DashboardClientView);