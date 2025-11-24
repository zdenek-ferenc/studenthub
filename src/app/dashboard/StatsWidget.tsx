"use client";

import { useDashboard } from '../../contexts/DashboardContext';
import { Star, CheckCircle, Percent, Trophy, DollarSign } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const StatCard = ({ 
    icon: Icon, 
    value, 
    label, 
    bgColor,
    textColor,
}: {
    icon: React.ElementType,
    value: string | number, 
    label: string,
    bgColor: string,
    textColor: string,
}) => (
    <div className={`
        flex flex-col items-start justify-between p-4 rounded-2xl transition-all duration-200
        bg-white border-2 shadow-xs border-gray-100
    `}>
        <div className="flex items-center justify-between w-full mb-3">
            <div className={`p-2.5 rounded-xl ${bgColor} ${textColor}`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
        
        <div>
            <p className="text-2xl font-bold tracking-tight text-[var(--barva-tmava)]">
                {value}
            </p>
            <p className="text-xs font-medium mt-1 text-gray-400">
                {label}
            </p>
        </div>
    </div>
);

export default function StatsWidget() {
    const { stats, loading } = useDashboard();

    return (
        <div className="bg-white p-5 rounded-[20px] shadow-xs border-2 border-gray-100 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-5">
                <div className="h-6 w-1 bg-[var(--barva-primarni)] rounded-full"></div>
                <h3 className="font-bold sm:text-lg text-[var(--barva-tmava)]">Moje čísla</h3>
            </div>

            {loading || !stats ? (
                <div className="flex-1 flex justify-center items-center min-h-[200px]">
                    <LoadingSpinner />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 2xl:grid-cols-2 gap-3 h-full content-start">
                    <StatCard
                        icon={CheckCircle}
                        value={stats.completedCount}
                        label="Dokončeno"
                        bgColor="bg-emerald-50"
                        textColor="text-emerald-600"
                    />

                    <StatCard
                        icon={Star}
                        value={stats.avgRating}
                        label="Rating / 10"
                        bgColor="bg-blue-50"
                        textColor="text-[var(--barva-primarni)]"
                    />

                    <StatCard
                        icon={Percent}
                        value={`${stats.successRate}%`}
                        label="Úspěšnost"
                        bgColor="bg-sky-50"
                        textColor="text-sky-600"
                    />

                    <StatCard
                        icon={Trophy}
                        value={stats.totalWins}
                        label="Vítězství"
                        bgColor="bg-teal-50"
                        textColor="text-teal-600"
                    />

                    <div className="col-span-2 md:col-span-4 2xl:col-span-2">
                        <div className={`
                            flex items-center gap-4 p-4 rounded-2xl h-full transition-all duration-200
                            bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100
                        `}>
                            <div className="p-3 rounded-xl bg-amber-100 text-amber-600 flex-shrink-0">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <p className="text-2xl font-bold tracking-tight text-amber-900 leading-none">
                                    {stats.totalEarnings.toLocaleString('cs-CZ')} Kč
                                </p>
                                <p className="text-xs font-medium text-amber-700/70 mt-1">
                                    Celkem vyděláno
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}