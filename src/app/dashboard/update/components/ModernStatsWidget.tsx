"use client";

import { useDashboard } from '../../../../contexts/DashboardContext';
import { Star, CheckCircle, Percent, Trophy, DollarSign } from 'lucide-react';
import LoadingSpinner from '../../../../components/LoadingSpinner';

type ModernStatItemProps = {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    value: string | number;
    label: string;
    colorClass?: string;
};

const ModernStatItem = ({ icon: Icon, value, label, colorClass }: ModernStatItemProps) => (
    <div className="
        bg-[#0B1623]/60 backdrop-blur-md border border-white/5 rounded-2xl 
        p-3 lg:p-4 
        flex flex-row lg:flex-col items-center lg:items-start gap-3 lg:gap-0 lg:justify-between 
        hover:border-white/10 transition-all group
    ">
        <div className={`
            shrink-0 rounded-xl flex items-center justify-center bg-white/5 ${colorClass}
            w-10 h-10 lg:w-10 lg:h-10 lg:mb-3
        `}>
            <Icon className="w-5 h-5 lg:w-5 lg:h-5" />
        </div>
        <div>
            <div className="text-lg lg:text-2xl font-bold text-white leading-none mb-1 transition-transform origin-left">
                {value}
            </div>
            <div className="text-[8px] md:text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wider leading-tight">
                {label}
            </div>
        </div>
    </div>
);

export default function ModernStatsWidget() {
    const { stats, loading } = useDashboard();

    if (loading || !stats) return <div className="h-40 flex items-center justify-center text-blue-500"><LoadingSpinner /></div>;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 h-full">
            <ModernStatItem 
                icon={CheckCircle} value={stats.completedCount} label="Dokončeno" colorClass="text-emerald-400" 
            />
            <ModernStatItem 
                icon={Star} value={stats.avgRating} label="Rating" colorClass="text-blue-400" 
            />
            <ModernStatItem 
                icon={Percent} value={`${stats.successRate}%`} label="Úspěšnost" colorClass="text-sky-400" 
            />
            <ModernStatItem 
                icon={Trophy} value={stats.totalWins} label="Vítězství" colorClass="text-yellow-400" 
            />
            
            <div className="col-span-2 lg:col-span-4 bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/20 rounded-2xl p-3 lg:p-4 flex items-center gap-3 lg:gap-4 backdrop-blur-md">
                <div className="shrink-0 p-2.5 lg:p-3 rounded-xl bg-amber-500/20 text-amber-400">
                    <DollarSign className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
                <div>
                    <div className="text-xl lg:text-2xl font-bold text-amber-100 leading-none mb-0.5">
                        {stats.totalEarnings.toLocaleString('cs-CZ')} Kč
                    </div>
                    <div className="text-[10px] lg:text-xs font-medium text-amber-500/80 uppercase tracking-wider">
                        Celkový výdělek
                    </div>
                </div>
            </div>
        </div>
    );
}