"use client";

import { useDashboard } from '../../contexts/DashboardContext';
import { Star, CheckCircle, Percent, Trophy, DollarSign } from 'lucide-react';

const StatItem = ({ icon: Icon, value, label, colorClass }: { icon: React.ElementType, value: string, label: string, colorClass: string }) => (
    <div className="flex items-center gap-4">
        <div className={`3xl:w-12 w-10 h-10 3xl:h-12 rounded-lg ${colorClass} flex items-center shadow-md justify-center flex-shrink-0`}>
            <Icon className="w-4 h-4 3xl:w-6 3xl:h-6 text-white " />
        </div>
        <div className="min-w-0">
            <p className="text-2xl font-bold text-[var(--barva-primarni)]">{value}</p>
            <p className="text-sm font-semibold text-gray-500 -mt-1">{label}</p>
        </div>
    </div>
);

export default function StatsWidget() {
    const { stats, loading } = useDashboard();

    return (
        <div className="bg-white p-3 sm:p-4 3xl:p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            {loading || !stats ? (
                <p className="text-sm text-gray-500">Načítám přehled...</p>
            ) : (
                <div className="space-y-3 3xl:space-y-5">
                    <StatItem icon={CheckCircle} value={String(stats.completedCount)} label="Dokončené výzvy" colorClass="bg-gradient-to-t from-green-500 to-green-400" />
                    <StatItem icon={Star} value={`${stats.avgRating} / 10`} label="Prům. hodnocení" colorClass="bg-gradient-to-t from-blue-500 to-blue-400" />
                    <StatItem icon={Percent} value={`${stats.successRate}%`} label="Úspěšnost" colorClass="bg-gradient-to-t from-purple-500 to-purple-400" />
                    <StatItem icon={Trophy} value={String(stats.totalWins)} label="Vítězství" colorClass="bg-gradient-to-t from-teal-500 to-teal-400" />
                    <StatItem icon={DollarSign} value={`${stats.totalEarnings.toLocaleString('cs-CZ')} Kč`} label="Celkem získáno" colorClass="bg-gradient-to-t from-amber-500 to-amber-400" />
                </div>
            )}
        </div>
    );
}