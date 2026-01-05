    "use client";

    import { useAuth } from '../../../contexts/AuthContext';
    import ModernStatsWidget from './components/ModernStatsWidget';
    import ModernStudentChallengesWidget from './components/ModernStudentChallengesWidget';
    import ModernCareerGrowthWidget from './components/ModernCareerGrowthWidget';
    import ModernNotificationsWidget from './components/ModernNotificationsWidget';
    import ModernRecommendedChallengesWidget from './components/ModernRecommendedChallengesWidget';
    import FeedbackWidget from '../../../components/FeedbackWidget';
    import ModernCalendarWidget from './components/ModernCalendarWidget';
/*     import ModernGoalWidget from './components/ModernGoalWidget';
    import ModernPipelineWidget from './components/ModernPipelineWidget'; */
    import ModernResourceBoxWidget from './components/ModernResourceBoxWidget';

    export default function ModernDashboardView() {
    useAuth();

    return (
        <div className="min-h-screen bg-[#001224] text-gray-100 font-sans relative md:pb-24 overflow-x-hidden selection:bg-blue-500/30">
        
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full opacity-40"></div>
            <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 blur-[100px] rounded-full opacity-30"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-6 md:pt-32 max-w-[1600px]">
            
            <div className="mb-3 md:mb-5 animate-fade-in-up delay-100">
                <ModernStudentChallengesWidget />
            </div>

            <div className="mb-3 md:mb-5 animate-fade-in-up delay-200">
                <ModernRecommendedChallengesWidget />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in-up delay-300">
                
                <div className="xl:col-span-8 flex flex-col gap-3 md:gap-5">
                    <div className="w-full">
                        <ModernStatsWidget />
                    </div>

                    <div className="w-full">
                        <ModernResourceBoxWidget />
                    </div>
                    
                    <div className="w-full">
                        <ModernNotificationsWidget />
                    </div>

                    
                </div>

                <div className="xl:col-span-4 flex flex-col gap-3 md:gap-5">
                    <div className="w-full">
                        <ModernCareerGrowthWidget />
                    </div>
                    <div className="w-full">
                    <ModernCalendarWidget />
                </div>
                </div>
            </div>
        </div>
        
        <FeedbackWidget />
        </div>
    );
    }