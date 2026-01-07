    "use client";

    import { useState } from 'react';
    import { LayoutGrid, Users, TrendingUp } from 'lucide-react';
    import ScrollAnimator from '../ScrollAnimator';

    import DemoChallengeView from '../homepage-demos/DemoChallengeView';
    import DemoTalentView from '../homepage-demos/DemoTalentView';
    import DemoCareerGrowthWidget from '../homepage-demos/DemoCareerGrowthWidget';

    type TabButtonProps = {
    title: string;
    icon: React.ComponentType<{size?: number}>;
    isActive: boolean;
    onClick: () => void;
    };

    const TabButton = ({ title, icon: Icon, isActive, onClick }: TabButtonProps) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
        isActive
            ? 'bg-[var(--barva-primarni)] text-white shadow-sm ring-1 ring-gray-200'
            : 'text-[var(--barva-tmava)] cursor-pointer hover:text-gray-900 hover:inset-shadow-sm hover:bg-gray-100/50'
        }`}
    >
        <Icon size={16} />
        {title}
    </button>
    );

    export default function FeaturesSection() {
    const [activeTab, setActiveTab] = useState('challenges');

    return (
        <section className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <ScrollAnimator>
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl text-[var(--barva-tmava)] font-bold tracking-tight">Vše na jednom místě</h2>
            </div>
            </ScrollAnimator>

            <ScrollAnimator className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden ring-1 ring-gray-900/5">
                <div className="bg-gray-100/80 backdrop-blur-md rounded-t-2xl md:rounded-t-3xl px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-10">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex gap-2 bg-white p-2 shadow-sm rounded-full">
                    <TabButton title="Výzvy" icon={LayoutGrid} isActive={activeTab === 'challenges'} onClick={() => setActiveTab('challenges')} />
                    <TabButton title="Talenti" icon={Users} isActive={activeTab === 'talents'} onClick={() => setActiveTab('talents')} />
                    <TabButton title="Kariéra" icon={TrendingUp} isActive={activeTab === 'growth'} onClick={() => setActiveTab('growth')} />
                </div>
                <div className="w-16 hidden sm:block"></div> 
                </div>

                <div className="p-6 md:p-8 bg-white min-h-[500px]">
                {activeTab === 'challenges' && (
                    <div className="animate-fade-in-up">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold">Přehled aktivních výzev</h3>
                        <span className="text-sm text-gray-400">Ukázka rozhraní</span>
                    </div>
                    <DemoChallengeView />
                    <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm">
                        💡 Studenti vidí výzvy filtrované podle jejich dovedností.
                    </div>
                    </div>
                )}
                {activeTab === 'talents' && (
                    <div className="animate-fade-in-up">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold">Databáze talentů</h3>
                        <span className="text-sm text-gray-400">Pohled startupu</span>
                    </div>
                    <DemoTalentView />
                    <div className="mt-6 p-4 bg-green-50 text-green-800 rounded-xl text-sm">
                        💡 Místo čtení CV vidíte reálné výsledky z výzev.
                    </div>
                    </div>
                )}
                {activeTab === 'growth' && (
                    <div className="animate-fade-in-up">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold">Růst a statistiky</h3>
                    </div>
                    <DemoCareerGrowthWidget />
                    <p className="mt-6 text-gray-600">Interaktivní grafy ukazují, jak se student zlepšuje v čase, kolik XP získal a jaké dovednosti ovládá.</p>
                    </div>
                )}
                </div>
            </div>
            </ScrollAnimator>
        </div>
        </section>
    );
    }