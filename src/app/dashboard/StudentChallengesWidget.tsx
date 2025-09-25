"use client";

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import ActiveChallengeCard, { type ActiveChallengeData } from './ActiveChallengeCard';
import CompletedChallengeCard, { type CompletedChallengeData } from './CompletedChallengeCard';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type View = 'active' | 'completed';

type CleanSubmission = {
    id: string;
    completed_outputs: string[];
    status: string;
    rating: number | null;
    position: number | null;
    Challenge: {
        id: string;
        title: string;
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

type RawSkill = { name: string; };
type RawChallengeSkill = { Skill: RawSkill | RawSkill[] | null; };
type RawStartupProfile = { company_name: string; logo_url: string | null; };
type RawChallenge = {
    id: string;
    title: string;
    expected_outputs: string;
    deadline: string | null;
    StartupProfile: RawStartupProfile | RawStartupProfile[] | null;
    ChallengeSkill: RawChallengeSkill[];
};
type RawSubmission = {
    id: string;
    completed_outputs: string[];
    status: string;
    rating: number | null;
    position: number | null;
    Challenge: RawChallenge | RawChallenge[] | null;
};

function parseSubmissions(rawData: unknown[]): CleanSubmission[] {
    return (rawData as RawSubmission[]).map((sub): CleanSubmission => {
        const challenge = Array.isArray(sub.Challenge) ? sub.Challenge[0] : sub.Challenge;
        
        let cleanChallenge: CleanSubmission['Challenge'] = null;

        if (challenge) {
            const startupProfile = Array.isArray(challenge.StartupProfile) 
                ? challenge.StartupProfile[0] 
                : challenge.StartupProfile;

            const cleanedChallengeSkills = (challenge.ChallengeSkill || []).map((cs) => {
            const skill = Array.isArray(cs.Skill) ? cs.Skill[0] : cs.Skill;
            return { Skill: skill || null };
            });
            
            cleanChallenge = {
                id: challenge.id,
                title: challenge.title,
                expected_outputs: challenge.expected_outputs,
                deadline: challenge.deadline,
                StartupProfile: startupProfile || null,
                ChallengeSkill: cleanedChallengeSkills,
            };
        }

        return {
            id: sub.id,
            completed_outputs: sub.completed_outputs,
            status: sub.status,
            rating: sub.rating,
            position: sub.position,
            Challenge: cleanChallenge
        };
    });
}


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
                Challenge (id, title, expected_outputs, deadline, StartupProfile (company_name, logo_url), ChallengeSkill (Skill (name)))
            `)
            .eq('student_id', user.id);

        if (error) {
            console.error("Chyba při načítání všech výzev:", error);
            setAllSubmissions([]);
        } else if (data) {
            const cleanedData = parseSubmissions(data);
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
    .filter(s => s.status === 'applied' || s.status === 'submitted')
    .sort((a) => (a.status === 'applied' ? -1 : 1));

    const completed = allSubmissions
    .filter(s => ['reviewed', 'winner', 'rejected'].includes(s.status));

    return { activeChallenges: active, completedChallenges: completed };
}, [allSubmissions]);

const SwitchButton = ({ buttonView, label, count }: { buttonView: View, label: string, count: number }) => (
    <button
        onClick={() => setView(buttonView)}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors relative ${view === buttonView ? 'text-[var(--barva-primarni)]' : 'cursor-pointer text-gray-500 hover:text-[var(--barva-tmava)]'}`}
    >
        {label} <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-100">{count}</span>
        {view === buttonView && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--barva-primarni)]" layoutId="underline" />}
    </button>
);

return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-[var(--barva-tmava)]">Moje výzvy</h3>
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
                {loading && !hasFetched ? <p className="text-sm text-gray-500 text-center py-8">Načítám výzvy...</p> : (
                    view === 'active' ? (
                        activeChallenges.length > 0 ? (
                            <div className="space-y-4">
                                {activeChallenges.map(sub => (
                                    <ActiveChallengeCard key={sub.id} submission={sub as ActiveChallengeData} />
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
                                    <CompletedChallengeCard key={sub.id} submission={sub as CompletedChallengeData} />
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