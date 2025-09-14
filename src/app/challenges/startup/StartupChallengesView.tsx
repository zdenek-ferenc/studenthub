"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import Image from 'next/image';
import ChallengeCard from './components/ChallengeCard';
import CommandCenter, { CommandCenterStats, RecentSubmission } from './components/CommandCenter';

// Typ, který používáme, nyní obsahuje i `submitted_at` pro správné řazení
export type Challenge = {
    id: string;
    title: string;
    status: 'draft' | 'open' | 'closed' | 'archived';
    short_description: string | null;
    deadline: string | null;
    created_at: string;
    max_applicants: number | null;
    ChallengeSkill: { Skill: { id: string, name: string } }[];
    Submission: { id: string, status: string, submitted_at: string }[];
};

export default function StartupChallengesView() {
    const { user } = useAuth();
    const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'active' | 'completed'>('active');

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        };

        const fetchChallenges = async () => {
        setLoading(true);
        // Požadujeme `submitted_at` pro správné řazení v dropdownu
        const { data, error } = await supabase
            .from('Challenge')
            .select(`
            id, title, status, short_description, deadline, created_at, max_applicants,
            ChallengeSkill ( Skill ( id, name ) ),
            Submission ( id, status, submitted_at )
            `)
            .eq('startup_id', user.id);

        if (error) {
            console.error("Chyba při načítání výzev:", error);
            setAllChallenges([]);
        } else {
            setAllChallenges(data as unknown as Challenge[] || []);
        }
        setLoading(false);
        };

        fetchChallenges();
    }, [user]);

    const { sortedActiveChallenges, completedChallenges, dashboardStats } = useMemo(() => {
        const active = allChallenges.filter(c => c.status === 'open' || c.status === 'draft');
        const completed = allChallenges.filter(c => c.status === 'closed' || c.status === 'archived');

        const unreviewedSubmissions: RecentSubmission[] = [];
        
        // --- KLÍČOVÁ ZMĚNA ZDE: Nová, srozumitelnější logika pro anonymní ID ---
        const submissionCounts: { [key: string]: number } = {};
        active.forEach((challenge) => {
            if(Array.isArray(challenge.Submission)) {
                challenge.Submission.forEach((sub) => {
                    if (sub.status === 'applied' || sub.status === 'submitted') {
                        // Pro každou výzvu počítáme řešení zvlášť
                        const count = (submissionCounts[challenge.id] || 0) + 1;
                        submissionCounts[challenge.id] = count;

                        unreviewedSubmissions.push({
                            anonymousId: `Řešení #${count}`, // Výsledek: "Řešení #1", "Řešení #2", atd.
                            challengeTitle: challenge.title,
                            challengeId: challenge.id,
                            submittedAt: sub.submitted_at
                        });
                    }
                });
            }
        });
        
        const stats: CommandCenterStats = {
            activeChallengesCount: active.length,
            unreviewedSubmissionsCount: unreviewedSubmissions.length,
            totalApplicantsCount: active.reduce((acc, c) => acc + (c.Submission?.length || 0), 0),
            // Seřadíme je podle data odevzdání a vezmeme prvních 5 pro zobrazení
            recentSubmissions: unreviewedSubmissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).slice(0, 5)
        };
        
        const getNeedsAttention = (challenge: Challenge) => {
            const isPastDeadline = challenge.deadline ? new Date() > new Date(challenge.deadline) : false;
            const hasUnreviewedSubmissions = challenge.Submission.some((s: {status: string}) => s.status === 'applied' || s.status === 'submitted');
            return isPastDeadline && hasUnreviewedSubmissions;
        };
        
        const sorted = [...active].sort((a, b) => {
            const aNeedsAttention = getNeedsAttention(a);
            const bNeedsAttention = getNeedsAttention(b);

            if (aNeedsAttention && !bNeedsAttention) return -1;
            if (!bNeedsAttention && aNeedsAttention) return 1;

            const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
            const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
            
            return dateA - dateB;
        });
        
        return { sortedActiveChallenges: sorted, completedChallenges: completed, dashboardStats: stats };
    }, [allChallenges]);
    
    const displayedChallenges = activeFilter === 'active' ? sortedActiveChallenges : completedChallenges;

    if (loading) {
        return <p className="text-center py-20">Načítám vaše výzvy...</p>;
    }

    return (
        <div className="container mx-auto py-12">
        {!loading && allChallenges.length === 0 ? (
            <div className="text-center max-w-lg mx-auto">
                <Image
                    src="/frownbig.svg"
                    alt="Smutný smajlík"
                    width={50}
                    height={50}
                    className="w-xs mx-auto my-4 rounded-lg"
                />
            <div className='flex flex-col gap-4 my-8'>
                <h2 className="text-3xl text-[var(--barva-primarni)]">Zatím žádná výzva</h2>
                <p className="text-gray-500 mt-2 mb-6">Vytvořte svou první výzvu a objevte talentované studenty.</p>
            </div>
            <Link href="/challenges/create" className="mt-6 px-6 py-3 rounded-full bg-[var(--barva-primarni)] text-xl text-white font-semibold">
                Vytvořit výzvu
            </Link>
            </div>
        ) : (
            <div>
                <CommandCenter stats={dashboardStats} />
                <div className="bg-white p-2 rounded-full flex gap-3 items-center max-w-min mb-8">
                    <button 
                        onClick={() => setActiveFilter('active')}
                        className={`cursor-pointer px-5 py-2 rounded-full text-sm font-semibold transition-colors ${activeFilter === 'active' ? 'bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)] shadow-sm' : 'hover:bg-gray-100 text-gray-700'}`}>
                        Aktivní ({sortedActiveChallenges.length})
                    </button>
                    <button 
                        onClick={() => setActiveFilter('completed')}
                        className={`cursor-pointer px-5 py-2 rounded-full text-sm font-semibold transition-colors ${activeFilter === 'completed' ? 'bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)] shadow-sm' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                        Dokončené ({completedChallenges.length})
                    </button>
                </div>

                {displayedChallenges.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedChallenges.map(challenge => (
                        <ChallengeCard key={challenge.id} challenge={challenge} /> 
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-white p-12 rounded-2xl shadow-md">
                        <h2 className="text-xl font-bold text-[var(--barva-tmava)]">Žádné {activeFilter === 'active' ? 'aktivní' : 'dokončené'} výzvy</h2>
                        <p className="text-gray-500 mt-2">V této kategorii se nenachází žádná výzva.</p>
                    </div>
                )}
                </div>
            )}
        </div>
    );
}

