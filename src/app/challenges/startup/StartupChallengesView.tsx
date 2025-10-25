"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import Image from 'next/image';
import ChallengeCard from './components/ChallengeCard';
import CommandCenter, { CommandCenterStats, RecentSubmission } from './components/CommandCenter';
import LoadingSpinner from '../../../components/LoadingSpinner'

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

type FilterType = 'active' | 'drafts' | 'completed';

export default function StartupChallengesView() {
    const { user } = useAuth();
    const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterType>('active');

    const [underlineStyle, setUnderlineStyle] = useState({});
    const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);


    const fetchChallenges = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        if (allChallenges.length === 0) {
            setLoading(true);
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
        }
    }, [user, allChallenges.length]);

    useEffect(() => {
        fetchChallenges();
    }, [fetchChallenges]);

    const { sortedActiveChallenges, completedChallenges, draftChallenges, dashboardStats } = useMemo(() => {
        const active = allChallenges.filter(c => c.status === 'open');
        const completed = allChallenges.filter(c => c.status === 'closed' || c.status === 'archived');
        const drafts = allChallenges.filter(c => c.status === 'draft');

        const unreviewedSubmissions: RecentSubmission[] = [];
        
        const submissionCounts: { [key: string]: number } = {};
        active.forEach((challenge) => {
            if(Array.isArray(challenge.Submission)) {
                challenge.Submission.forEach((sub) => {
                    if (sub.status === 'submitted') {
                        const count = (submissionCounts[challenge.id] || 0) + 1;
                        submissionCounts[challenge.id] = count;
                        unreviewedSubmissions.push({
                            anonymousId: `Řešení #${count}`,
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
            recentSubmissions: unreviewedSubmissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).slice(0, 5)
        };
        
        const getNeedsAttention = (challenge: Challenge) => {
            if (challenge.status === 'draft') return true;
            const isPastDeadline = challenge.deadline ? new Date() > new Date(challenge.deadline) : false;
            const hasUnreviewedSubmissions = challenge.Submission.some((s: {status: string}) => s.status === 'submitted');
            return isPastDeadline && hasUnreviewedSubmissions;
        };
        
        const sorted = [...active].sort((a, b) => {
            const aNeedsAttention = getNeedsAttention(a);
            const bNeedsAttention = getNeedsAttention(b);

            if (aNeedsAttention && !bNeedsAttention) return -1;
            if (!aNeedsAttention && bNeedsAttention) return 1;

            const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
            const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
            
            return dateA - dateB;
        });
        
        const sortedDrafts = [...drafts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return { sortedActiveChallenges: sorted, completedChallenges: completed, draftChallenges: sortedDrafts, dashboardStats: stats };
    }, [allChallenges]);
    
    const displayedChallenges = useMemo(() => {
        switch (activeFilter) {
            case 'active':
                return sortedActiveChallenges;
            case 'completed':
                return completedChallenges;
            case 'drafts':
                return draftChallenges;
            default:
                return [];
        }
    }, [activeFilter, sortedActiveChallenges, completedChallenges, draftChallenges]);
    
    const filters: { id: FilterType; label: string; count: number }[] = useMemo(() => [
        { id: 'active', label: 'Aktivní', count: sortedActiveChallenges.length },
        { id: 'drafts', label: 'Koncepty', count: draftChallenges.length },
        { id: 'completed', label: 'Dokončené', count: completedChallenges.length },
    ], [sortedActiveChallenges, draftChallenges, completedChallenges]);

    useEffect(() => {
        const activeIndex = filters.findIndex(f => f.id === activeFilter);
        const activeButton = buttonsRef.current[activeIndex];

        if (activeButton) {
            setUnderlineStyle({
                width: `${activeButton.offsetWidth}px`,
                transform: `translateX(${activeButton.offsetLeft}px)`,
            });
        }
    }, [activeFilter, filters, allChallenges]);

    if (loading) {
        return <div className='py-10 md:py-32'>
                    <LoadingSpinner />;
                </div>

        
    }

    return (
        <div className="flex flex-col max-w-5/6 mx-auto px-4 py-4 md:py-30 4xl:py-32">
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
                <div className="relative flex flex-row justify-between sm:justify-start items-center md:border-b border-gray-200 mb-8">
                    {filters.map((filter, index) => (
                        <button
                            key={filter.id}
                            ref={(el) => {
                            buttonsRef.current[index] = el;
                            }}
                            onClick={() => setActiveFilter(filter.id)}
                            className="flex items-center justify-center gap-2 px-3 md:px-5 py-2 md:py-3 text-xs 3xl:text-base font-semibold z-10 transition-colors duration-200 cursor-pointer"
                        >
                            <span className={activeFilter === filter.id ? 'text-sm md:text-xs 3xl:text-base text-[var(--barva-primarni)]' : 'text-gray-500 cursor-pointer hover:text-gray-600 transition-all ease-in-out duration-200'}>
                                {filter.label}
                            </span>
                            <span
                                className={`flex-shrink-0 flex items-center justify-center text-xs font-bold rounded-full w-6 h-6 transition-colors duration-200 ${
                                    activeFilter === filter.id ? 'bg-[var(--barva-primarni2)] text-[var(--barva-primarni)]' : 'bg-white text-gray-500'
                                }`}
                            >
                                {filter.count}
                            </span>
                        </button>
                    ))}
                    <div
                        className="hidden md:block absolute bottom-0 h-1 bg-[var(--barva-primarni)] rounded-full transition-all duration-300 ease-in-out"
                        style={underlineStyle}
                    />
                </div>

                {displayedChallenges.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4 3xl:gap-6">
                        {displayedChallenges.map(challenge => (
                        <ChallengeCard key={challenge.id} challenge={challenge} /> 
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-white p-12 rounded-2xl shadow-md">
                        <h2 className="text-xl font-bold text-[var(--barva-tmava)]">Žádné výzvy v této kategorii</h2>
                        <p className="text-gray-500 mt-2">Zkuste se podívat do jiné sekce.</p>
                    </div>
                )}
                </div>
            )}
        </div>
    );
}