"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Star, CheckCircle, Percent, Trophy, DollarSign } from 'lucide-react';

const StatItem = ({ icon: Icon, value, label, colorClass }: { icon: React.ElementType, value: string, label: string, colorClass: string }) => (
    <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg ${colorClass} flex items-center shadow-md justify-center flex-shrink-0`}>
            <Icon className="w-6 h-6 text-white " />
        </div>
        <div className="min-w-0">
            <p className="text-2xl font-bold text-[var(--barva-primarni)]">{value}</p>
            <p className="text-sm font-semibold text-gray-500 -mt-1">{label}</p>
        </div>
    </div>
);

export default function StatsWidget() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        avgRating: 0,
        completedCount: 0,
        successRate: 0,
        totalEarnings: 0,
        totalWins: 0,
    });
    const [loading, setLoading] = useState(true);
    const [hasFetched, setHasFetched] = useState(false);

    useEffect(() => {
        if (user && !hasFetched) {
            const fetchAllStats = async () => {
                setLoading(true);
                
                const [performanceRes, rewardsRes] = await Promise.all([
                    supabase
                        .from('Submission')
                        .select('rating, position')
                        .eq('student_id', user.id)
                        .in('status', ['reviewed', 'winner', 'rejected']),
                    supabase.rpc('get_student_rewards', { p_student_id: user.id })
                ]);
                let performanceStats = { avgRating: 0, completedCount: 0, successRate: 0 };
                if (!performanceRes.error && performanceRes.data) {
                    const ratedSubmissions = performanceRes.data.filter(s => s.rating !== null);
                    const totalCompleted = performanceRes.data.length;
                    const totalWinners = performanceRes.data.filter(s => s.position !== null && s.position <= 3).length;
                    const avgRating = ratedSubmissions.length > 0
                        ? ratedSubmissions.reduce((acc, s) => acc + s.rating!, 0) / ratedSubmissions.length
                        : 0;
                    const successRate = totalCompleted > 0 ? (totalWinners / totalCompleted) * 100 : 0;
                    performanceStats = {
                        avgRating: parseFloat(avgRating.toFixed(1)),
                        completedCount: totalCompleted,
                        successRate: Math.round(successRate)
                    };
                }

                let rewardStats = { totalEarnings: 0, totalWins: 0 };
                if (!rewardsRes.error && rewardsRes.data && rewardsRes.data.length > 0) {
                    const result = rewardsRes.data[0];
                    rewardStats = {
                        totalEarnings: result.total_earnings || 0,
                        totalWins: result.total_wins || 0
                    };
                }
                
                setStats({ ...performanceStats, ...rewardStats });
                setLoading(false);
                setHasFetched(true);
            };

            fetchAllStats();
        }
    }, [user, hasFetched]);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h3 className="flex justify-center md:justify-start text-xl font-bold text-[var(--barva-tmava)] mb-4">Můj přehled</h3>
            {loading && !hasFetched ? (
                <p className="text-sm text-gray-500">Načítám přehled...</p>
            ) : (
                <div className="space-y-5">
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