"use client";
type ChallengeSkillType = { Skill: { id: string; name: string } | null };

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { Lightbulb, ChevronRight, AlertCircle, ChevronUp, ChevronDown, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

type RecChallenge = { 
    id: string; 
    title: string; 
    deadline: string | null; 
    applicantCount: number; 
    max_applicants: number | null; 
    StartupProfile: { company_name: string; logo_url: string | null; } | null; 
    matchingSkillsCount: number; 
    requiredSkillsCount: number; 
    score: number; 
};

export default function ModernRecommendedChallengesWidget() {
    const { user } = useAuth();
    const [recommendations, setRecommendations] = useState<RecChallenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(true); 

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!user) { 
                setLoading(false); 
                return; 
            }

            const [studentSkillsRes, submissionsRes] = await Promise.all([
                supabase.from('StudentSkill').select('skill_id').eq('student_id', user.id),
                supabase.from('Submission').select('challenge_id').eq('student_id', user.id)
            ]);

            const studentSkillIds = studentSkillsRes.data?.map(s => s.skill_id) || [];
            const appliedChallengeIds = submissionsRes.data?.map(s => s.challenge_id) || [];

            if (studentSkillIds.length === 0) {
                setLoading(false);
                return;
            }

            const { data: openChallenges } = await supabase
                .from('Challenge')
                .select(`
                    id, title, deadline, max_applicants, status,
                    StartupProfile (company_name, logo_url),
                    ChallengeSkill (Skill (id, name)),
                    Submission (count)
                `)
                .eq('status', 'open');

            if (!openChallenges) { 
                setLoading(false); 
                return; 
            }

            const validChallenges = openChallenges
                .filter(challenge => {
                    if (challenge.deadline && new Date(challenge.deadline) < new Date()) return false;
                    if (appliedChallengeIds.includes(challenge.id)) return false;
                    const subCount = challenge.Submission?.[0]?.count || 0;
                    if (challenge.max_applicants && subCount >= challenge.max_applicants) return false;
                    return true;
                })
                .map(challenge => {
                    const challengeSkillIds = (challenge.ChallengeSkill as ChallengeSkillType[]).map(cs => cs.Skill?.id).filter(Boolean);
                    const requiredCount = challengeSkillIds.length;
                    if (requiredCount === 0) return null;
                    const matchingCount = challengeSkillIds.filter((id: string) => studentSkillIds.includes(id)).length;
                    if (matchingCount === 0) return null;
                    return {
                        id: challenge.id,
                        title: challenge.title,
                        deadline: challenge.deadline,
                        applicantCount: challenge.Submission?.[0]?.count || 0,
                        max_applicants: challenge.max_applicants,
                        StartupProfile: Array.isArray(challenge.StartupProfile) ? challenge.StartupProfile[0] : challenge.StartupProfile,
                        matchingSkillsCount: matchingCount,
                        requiredSkillsCount: requiredCount,
                        score: matchingCount / requiredCount 
                    };
                })
                .filter((c): c is RecChallenge => c !== null)
                .sort((a, b) => b.score - a.score);

            setRecommendations(validChallenges.slice(0, 3));
            
            if (validChallenges.length > 0) {
                const savedState = localStorage.getItem('rh_rec_collapsed');
                
                if (savedState === null) {
                    setIsCollapsed(false);
                } else {
                    setIsCollapsed(savedState === 'true');
                }
            } else {
                setIsCollapsed(true);
            }
            
            setLoading(false);
        };

        fetchRecommendations();
    }, [user]);

    const handleToggle = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('rh_rec_collapsed', String(newState));
    };

    return (
        <div className={`
            bg-gradient-to-br from-[#0B1623]/80 to-[#0F1C2E]/80 backdrop-blur-xl border border-white/5 rounded-3xl 
            transition-all duration-500 ease-in-out relative overflow-hidden p-4 md:p-6
        `}>

            <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        <Lightbulb size={18} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm md:text-base text-white leading-tight">Doporučené výzvy</h3>
                        <p className={`text-xs text-gray-500 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                            Na základě tvých dovedností
                        </p>
                    </div>
                </div>

                <button 
                    onClick={handleToggle}
                    className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all focus:outline-none active:scale-95"
                    title={isCollapsed ? "Rozbalit" : "Sbalit"}
                >
                    {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                </button>
            </div>

            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="relative z-10"
                    >
                        <div className="pt-6 space-y-3">
                            {loading ? <div className="py-4"><LoadingSpinner /></div> : recommendations.length > 0 ? (
                                recommendations.map(c => (
                                    <Link href={`/challenges/${c.id}`} key={c.id} className="block group">
                                        <div className="bg-white/[0.03] border border-white/5 p-3 rounded-2xl flex items-center gap-4 hover:bg-white/[0.07] hover:border-white/10 transition-all ease-in-out duration-300">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 overflow-hidden border border-white/5">
                                                {c.StartupProfile?.logo_url ? (
                                                    <Image src={c.StartupProfile.logo_url} alt="logo" width={40} height={40} className="object-cover w-full h-full"/>
                                                ) : (
                                                    <span className="text-xs font-bold text-gray-500 uppercase">{c.StartupProfile?.company_name.slice(0,2)}</span>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h5 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-all ease-in-out duration-300">{c.title}</h5>
                                                <div className="flex items-center gap-3 mt-1">                                                    
                                                    <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded text-[10px] text-blue-300 font-medium">
                                                        <Zap size={10} fill="currentColor" />
                                                        {c.matchingSkillsCount}/{c.requiredSkillsCount} skills
                                                    </div>
                                                </div>
                                            </div>

                                            <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-transform ease-in-out duration-300 group-hover:translate-x-0.5"/>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-8 rounded-2xl border border-dashed border-white/10">
                                    <AlertCircle className="mx-auto mb-2 text-gray-600" size={24}/>
                                    <p className="text-sm text-gray-400 font-medium">Zatím žádná shoda</p>
                                    <p className="text-xs text-gray-600 mt-1 mb-3">Zkus si doplnit profil o další skills.</p>
                                    <Link href="/profile/edit" className="text-xs text-blue-400 hover:text-blue-300 font-bold hover:underline">Upravit profil</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}