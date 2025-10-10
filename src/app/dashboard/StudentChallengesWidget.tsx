"use client";

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import ActiveChallengeCard, { type ActiveChallengeData } from './ActiveChallengeCard';
import CompletedChallengeCard, { type CompletedChallengeData } from './CompletedChallengeCard';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import LoadingSpinner from '../../components/LoadingSpinner';

type View = 'active' | 'completed';

type RawSkill = { name: string };
type RawChallengeSkill = { Skill: RawSkill | RawSkill[] | null };

type RawStartupProfile = {
    company_name: string;
    logo_url: string | null;
};

type RawChallenge = {
    id: string;
    title: string;
    status: 'open' | 'closed' | 'archived';
    expected_outputs: string;
    deadline: string | null;
    StartupProfile: RawStartupProfile | RawStartupProfile[] | null;
    ChallengeSkill: RawChallengeSkill[];
};

type RawSubmissionFromDB = {
    id: string;
    completed_outputs: string[];
    status: string;
    rating: number | null;
    position: number | null;
    Challenge: RawChallenge | RawChallenge[] | null;
};

type CleanSubmission = {
    id: string;
    completed_outputs: string[];
    status: string;
    rating: number | null;
    position: number | null;
    Challenge: {
        id: string;
        title: string;
        status: 'open' | 'closed' | 'archived';
        expected_outputs: string;
        deadline: string | null;
        StartupProfile: {
            company_name: string;
            logo_url: string | null;
        } | null;
        ChallengeSkill: {
            Skill: {
                name: string;
            } | null;
        }[];
    } | null;
};

export default function StudentChallengesWidget() {
    const { user } = useAuth();
    const [allSubmissions, setAllSubmissions] = useState<CleanSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<View>('active');
    const [hasFetched, setHasFetched] = useState(false);

    useEffect(() => {
        if (user && !hasFetched) {
            const fetchAllSubmissions = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('Submission')
                .select(`
                    id, completed_outputs, status, rating, position,
                    Challenge:Challenge!Submission_challenge_id_fkey (
                        id, title, status, expected_outputs, deadline,
                        StartupProfile (company_name, logo_url),
                        ChallengeSkill (Skill (name))
                    )
                `)
                .eq('student_id', user.id);

            if (error) {
                console.error("Chyba při načítání všech výzev:", error);
                setAllSubmissions([]);
            } else if (data) {
                const cleanedData = (data as RawSubmissionFromDB[]).map((sub): CleanSubmission => {
                    const challengeRaw = Array.isArray(sub.Challenge) ? sub.Challenge[0] : sub.Challenge;
                    
                    let cleanChallenge: CleanSubmission['Challenge'] = null;

                    if (challengeRaw) {
                        const startupProfileRaw = Array.isArray(challengeRaw.StartupProfile) ? challengeRaw.StartupProfile[0] : challengeRaw.StartupProfile;
                        
                        const cleanChallengeSkills = challengeRaw.ChallengeSkill.map(cs => {
                            const skillRaw = Array.isArray(cs.Skill) ? cs.Skill[0] : cs.Skill;
                            return { Skill: skillRaw };
                        });
                        cleanChallenge = {
                            ...challengeRaw,
                            StartupProfile: startupProfileRaw || null,
                            ChallengeSkill: cleanChallengeSkills,
                        };
                    }
                    
                    return { ...sub, Challenge: cleanChallenge };
                });
                
                setAllSubmissions(cleanedData);
            }
            setLoading(false);
            setHasFetched(true);
            };

            fetchAllSubmissions();
        }
    }, [user, hasFetched]);

    const { activeChallenges, completedChallenges } = useMemo(() => {
        const active = allSubmissions
            .filter(s => 
                s.status === 'applied' || 
                s.status === 'submitted' ||
                (s.status === 'reviewed' && s.Challenge?.status === 'open')
            )
            .sort((a) => (a.status === 'applied' ? -1 : 1));

        const completed = allSubmissions
            .filter(s => 
                s.status === 'winner' || 
                s.status === 'rejected' ||
                (s.status === 'reviewed' && s.Challenge?.status === 'closed')
            );

        return { activeChallenges: active, completedChallenges: completed };
    }, [allSubmissions]);


    const SwitchButton = ({ buttonView, label, count }: { buttonView: View, label: string, count: number }) => (
        <button
            onClick={() => setView(buttonView)}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors relative ${view === buttonView ? 'text-[var(--barva-primarni)]' : 'cursor-pointer text-gray-500 hover:text-[var(--barva-tmava)]'}`}
        >
            {label} <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-100">{count}</span>
            {view === buttonView && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--barva-primarni)]" layoutId="underline" />}
        </button>
    );

    return (
        <div className="bg-white p-3 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-row items-center justify-start lg:justify-between mb-4">
            <h3 className="hidden lg:block text-xl pb-2 md:pb-0 font-bold text-[var(--barva-tmava)]">Moje výzvy</h3>
            <div className="flex items-center rounded-lg p-1">
                <SwitchButton buttonView="active" label="Aktivní" count={activeChallenges.length} />
                <SwitchButton buttonView="completed" label="Hotové" count={completedChallenges.length} />
            </div>
        </div>
        
        <div>
            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {loading && !hasFetched ? <LoadingSpinner /> : (
                        view === 'active' ? (
                            activeChallenges.length > 0 ? (
                                <div className="space-y-4">
                                    {activeChallenges.map(sub => (
                                        <ActiveChallengeCard key={sub.id} submission={sub as unknown as ActiveChallengeData} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Momentálně nepracuješ na žádné výzvě.</p>
                                    <Link href="/challenges" className="inline-block mt-4 px-6 py-2 rounded-full bg-[var(--barva-primarni)] text-white font-semibold cursor-pointer text-sm">
                                        Najít novou výzvu
                                    </Link>
                                </div>
                            )
                        ) : (
                            completedChallenges.length > 0 ? (
                                <div className="space-y-4">
                                    {completedChallenges.map(sub => (
                                        <CompletedChallengeCard key={sub.id} submission={sub as unknown as CompletedChallengeData} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Zatím jsi nedokončil žádnou výzvu.</p>
                                </div>
                            )
                        )
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
        </div>
    );
}