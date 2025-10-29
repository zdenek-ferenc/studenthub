"use client";

import { useDashboard } from '../../contexts/DashboardContext';
import { Star, CheckCircle, Percent, Trophy, DollarSign } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const StatItem = ({ icon: Icon, value, label, colorClass, borderColorClass }: {
    icon: React.ElementType,
    value: string | number, 
    label: string,
    colorClass: string, 
    borderColorClass: string 
}) => (
    <div className="flex items-center gap-4">
        <div className={`
            3xl:w-12 w-10 h-10 3xl:h-12 rounded-lg bg-white border-2 ${borderColorClass}
            flex items-center shadow-xs justify-center flex-shrink-0
            `}>
            <Icon className={`w-4 h-4 3xl:w-6 3xl:h-6 ${colorClass}`} />
        </div>
        <div className="min-w-0">
            <p className="text-xl md:text-2xl font-bold text-[var(--barva-primarni)]">{value}</p>
            <p className="text-xs md:text-sm text-gray-500 -mt-1">{label}</p>
        </div>
    </div>
);

export default function StatsWidget() {
    const { stats, loading } = useDashboard();

    return (
        <div className="bg-white p-3 sm:p-4 3xl:p-6 rounded-2xl shadow-xs border border-gray-200 h-full">
            {loading || !stats ? (
                 <div className="flex justify-center items-center h-full">
                   <LoadingSpinner />
                 </div>
            ) : (
                <div className="space-y-3 3xl:space-y-5">
                    <StatItem
                        icon={CheckCircle}
                        value={String(stats.completedCount)}
                        label="Dokončené výzvy"
                        colorClass="text-green-500"
                        borderColorClass="border-green-500"
                    />
                    <StatItem
                        icon={Star}
                        value={`${stats.avgRating} / 10`}
                        label="Prům. hodnocení"
                        colorClass="text-blue-500"
                        borderColorClass="border-blue-500"
                    />
                    <StatItem
                        icon={Percent}
                        value={`${stats.successRate}%`}
                        label="Úspěšnost"
                        colorClass="text-fuchsia-400"
                        borderColorClass="border-fuchsia-400"
                    />
                     <StatItem
                        icon={Trophy}
                        value={String(stats.totalWins)}
                        label="Vítězství"
                        colorClass="text-teal-500"
                        borderColorClass="border-teal-500"
                    />
                    <StatItem
                        icon={DollarSign}
                        value={`${stats.totalEarnings.toLocaleString('cs-CZ')} Kč`}
                        label="Celkem získáno"
                        colorClass="text-amber-500"
                        borderColorClass="border-amber-500"
                    />
                </div>
            )}
        </div>
    );
}