"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import RecommendedChallengeCard, { RecommendedChallenge } from './RecommendedChallengeCard';
import { Lightbulb } from 'lucide-react';

export default function RecommendedChallengesWidget() {
    const { user } = useAuth();
    const [recommendations, setRecommendations] = useState<RecommendedChallenge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!user) { setLoading(false); return; }

            const { data: studentSkillsData } = await supabase
                .from('StudentSkill').select('skill_id').eq('student_id', user.id);
            const studentSkillIds = studentSkillsData?.map(s => s.skill_id) || [];

            if (studentSkillIds.length === 0) {
                setLoading(false);
                return;
            }

            const { data: submissionData } = await supabase
                .from('Submission').select('challenge_id').eq('student_id', user.id);
            const appliedChallengeIds = submissionData?.map(s => s.challenge_id) || [];

            const { data: openChallengesData } = await supabase
                .from('Challenge')
                .select(`id, title, deadline, max_applicants, StartupProfile(company_name, logo_url), ChallengeSkill(Skill(id)), Submission(count)`)
                .eq('status', 'open'); 

            if (!openChallengesData) { setLoading(false); return; }

            const scoredChallenges = openChallengesData
                .map(challenge => {
                    const isStillActive = challenge.deadline ? new Date(challenge.deadline) >= new Date() : false;
                    if (!isStillActive) {
                        return null;
                    }
                    
                    const submissionCount = challenge.Submission[0]?.count || 0;
                    if (appliedChallengeIds.includes(challenge.id) || (challenge.max_applicants && submissionCount >= challenge.max_applicants)) {
                        return null;
                    }
                    const requiredSkillIds = challenge.ChallengeSkill
                        .map(cs => {
                            const skill = Array.isArray(cs.Skill) ? cs.Skill[0] : cs.Skill;
                            return skill?.id;
                        })
                        .filter(Boolean);
                    if (requiredSkillIds.length === 0) return null;
                    const matchingSkills = requiredSkillIds.filter(id => studentSkillIds.includes(id));
                    if (matchingSkills.length === 0) return null;
                    
                    const startupProfile = Array.isArray(challenge.StartupProfile) ? challenge.StartupProfile[0] : challenge.StartupProfile;
                    return {
                        id: challenge.id,
                        title: challenge.title,
                        deadline: challenge.deadline,
                        max_applicants: challenge.max_applicants,
                        StartupProfile: startupProfile,
                        applicantCount: submissionCount,
                        matchingSkills: matchingSkills.length,
                        requiredSkills: requiredSkillIds.length,
                        score: matchingSkills.length / requiredSkillIds.length,
                    };
                })
                .filter((c): c is NonNullable<typeof c> => c !== null);
            scoredChallenges.sort((a, b) => b.score - a.score);
            
            setRecommendations(scoredChallenges.slice(0, 3));
            setLoading(false);
        };
        fetchRecommendations();
    }, [user]);

    return (
    <div className="lg:col-span-2 bg-white p-3 sm:p-4 3xl:p-6 rounded-2xl shadow-xs border border-gray-200">
        <h3 className="flex justify-start 3xl:text-xl font-semibold sm:font-bold text-[var(--barva-tmava)] mb-4">Doporučené výzvy</h3>
        {loading ? (
            <p className="text-sm text-gray-500">Hledám nejlepší výzvy...</p>
        ) : recommendations.length > 0 ? (
            <div className="space-y-3">
                {recommendations.map(challenge => (
                    <RecommendedChallengeCard key={challenge.id} challenge={challenge} />
                ))}
            </div>
        ) : (
            <div className="text-center py-6">
                <Lightbulb className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <p className="font-semibold text-gray-700">Žádná doporučení</p>
                <p className="text-sm text-gray-500 mt-1">Doplň si dovednosti v profilu, abychom ti mohli najít výzvy na míru.</p>
            </div>
        )}
    </div>
    );
}