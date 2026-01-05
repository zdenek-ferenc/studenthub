"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useDashboard } from '../../../../contexts/DashboardContext'; 
import LoadingSpinner from '../../../../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';

export default function ModernCareerGrowthWidget() {
    const { user } = useAuth();
    const { progress, refetchDashboardData } = useDashboard();
    
    const [showAllSkills, setShowAllSkills] = useState(false);
    
    const [unseenUpdates, setUnseenUpdates] = useState<{ newSkills: string[], leveledUpSkills: string[], studentLevelUp: boolean }>({ 
        newSkills: [], 
        leveledUpSkills: [], 
        studentLevelUp: false 
    });

    useEffect(() => {
        if (!user) return;

        const checkXpEvents = async () => {
            const { data: eventData } = await supabase
                .from('XpEvent')
                .select('event_type, skill_id, new_level')
                .eq('student_id', user.id)
                .eq('is_seen', false);

            if (eventData && eventData.length > 0) {
                setUnseenUpdates({
                    newSkills: eventData.filter(e => e.event_type === 'new_skill').map(e => e.skill_id as string),
                    leveledUpSkills: eventData.filter(e => e.event_type === 'skill_xp' && e.new_level).map(e => e.skill_id as string),
                    studentLevelUp: eventData.some(e => e.event_type === 'student_xp' && e.new_level)
                });

                await supabase.rpc('mark_all_xp_events_as_seen');
                refetchDashboardData();
            }
        };

        checkXpEvents();
    }, [user, refetchDashboardData]);

    if (!progress) {
        return <div className="h-full flex items-center justify-center text-blue-500"><LoadingSpinner /></div>;
    }

    const xpForNextLevel = Math.floor(100 * (progress.level ** 1.6));
    const percentage = Math.min(100, (progress.xp / xpForNextLevel) * 100);
    
    const allSkills = (progress.StudentSkill || [])
        .map(ss => ({ ...ss, Skill: Array.isArray(ss.Skill) ? ss.Skill[0] : ss.Skill }))
        .filter(s => s.Skill)
        .sort((a, b) => b.level - a.level || b.xp - a.xp);
        
    const displayedSkills = showAllSkills ? allSkills : allSkills.slice(0, 5);

    return (
        <div className="bg-[#0B1623]/60 backdrop-blur-xl shadow-xl border border-white/5 rounded-3xl p-4 md:p-6 relative overflow-hidden">
            {unseenUpdates.studentLevelUp && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none animate-fade-in-up">
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 animate-bounce">LEVEL UP!</h2>
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-sm md:text-base text-white flex items-center gap-2"><TrendingUp size={18} className="text-purple-400"/> Kariérní Růst</h3>
                <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
                    Level {progress.level}
                </div>
            </div>

            <div className="relative pt-2 pb-6 text-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-24 h-24 bg-blue-600/40 rounded-full blur-[50px] pointer-events-none"></div>
                <div className="text-4xl font-bold flex flex-col text-white mb-2 relative z-10">
                    {progress.level} 
                    <span className='text-sm opacity-50 font-thin'>Úroveň profilu</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2 relative z-10">
                    <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${percentage}%` }} 
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600 shadow-[0_0_10px_#9333ea]" 
                    />
                </div>
                <p className="text-xs text-gray-400 relative z-10">{progress.xp} / {xpForNextLevel} XP do dalšího levelu</p>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {displayedSkills.map(skill => {
                        if (!skill.Skill) return null;
                        const skillNextXp = Math.floor(75 * (skill.level ** 1.4));
                        const skillPct = (skill.xp / skillNextXp) * 100;
                        const isNew = unseenUpdates.newSkills.includes(skill.Skill.id);
                        
                        return (
                            <motion.div 
                                key={skill.Skill.id} 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                layout 
                                className="group"
                            >
                                <div className="flex justify-between items-baseline text-sm mb-1.5">
                                    <span className={`font-medium truncate pr-2 ${isNew ? 'text-green-400' : 'text-gray-300'}`}>
                                        {skill.Skill.name} {isNew && '✨'}
                                    </span>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-gray-500 tabular-nums">
                                            {skill.xp} <span className="opacity-50">/</span> {skillNextXp} XP
                                        </span>
                                        <span className="font-bold text-white bg-white/10 px-1.5 py-0.5 rounded text-[10px]">
                                            Lvl {skill.level}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity relative" style={{ width: `${skillPct}%` }}>
                                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]"></div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>
            
            {allSkills.length > 5 && (
                <button onClick={() => setShowAllSkills(!showAllSkills)} className="w-full mt-6 text-xs font-bold text-gray-500 hover:text-white flex justify-center items-center gap-1 transition-colors pt-2 border-t border-white/5">
                    {showAllSkills ? 'Méně' : 'Zobrazit všechny'} <ChevronDown size={14} className={`transition-transform duration-300 ${showAllSkills ? 'rotate-180' : ''}`}/>
                </button>
            )}
        </div>
    );
}