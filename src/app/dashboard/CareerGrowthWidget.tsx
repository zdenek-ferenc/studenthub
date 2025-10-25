"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronDown } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { motion, AnimatePresence} from 'framer-motion';

type SkillFromDB = {
id: string;
name: string;
};

type StudentSkillFromDB = {
level: number;
xp: number;
Skill: SkillFromDB | SkillFromDB[] | null;
};

type ProfileProgress = {
level: number;
xp: number;
StudentSkill: StudentSkillFromDB[];
};

const ProgressBar = ({ value, maxValue, colorClass }: { value: number, maxValue: number, colorClass: string }) => {
const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
    <motion.div
        className={`${colorClass} h-2.5 rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
    />
    </div>
);
};

export default function CareerGrowthWidget() {
const { user } = useAuth();
const [progress, setProgress] = useState<ProfileProgress | null>(null);
const [loading, setLoading] = useState(true);
const [showAllSkills, setShowAllSkills] = useState(false);

const [unseenUpdates, setUnseenUpdates] = useState<{
    newSkills: string[],
    leveledUpSkills: string[],
    studentLevelUp: boolean
}>({ newSkills: [], leveledUpSkills: [], studentLevelUp: false });
const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);

useEffect(() => {
    const userId = user?.id;
    if (!userId) {
    setLoading(false);
    return;
    }

    const fetchAllData = async () => {
    setLoading(true);
    const [progressRes, unseenEventsRes] = await Promise.all([
        supabase.from('StudentProfile').select(`level, xp, StudentSkill (level, xp, Skill (id, name))`).eq('user_id', userId).single(),
        supabase.from('XpEvent').select('event_type, skill_id, new_level').eq('student_id', userId).eq('is_seen', false)
    ]);

    if (progressRes.data) setProgress(progressRes.data as ProfileProgress);

    if (unseenEventsRes.data && unseenEventsRes.data.length > 0) {
        const newSkillIds = unseenEventsRes.data.filter(e => e.event_type === 'new_skill' && e.skill_id).map(e => e.skill_id as string);
        const leveledUpSkillIds = unseenEventsRes.data.filter(e => e.event_type === 'skill_xp' && e.new_level && e.skill_id).map(e => e.skill_id as string);
        const hasLevelUp = unseenEventsRes.data.some(e => e.event_type === 'student_xp' && e.new_level);
        
        setUnseenUpdates({ newSkills: newSkillIds, leveledUpSkills: leveledUpSkillIds, studentLevelUp: hasLevelUp });
        setShowLevelUpAnimation(hasLevelUp);

        supabase.rpc('mark_all_xp_events_as_seen').then(({ error }) => { if (error) console.error("Chyba při označování XP událostí:", error); });
    }
    setLoading(false);
    };
    fetchAllData();
}, [user?.id]);

useEffect(() => {
    if (showLevelUpAnimation) {
        const timer = setTimeout(() => setShowLevelUpAnimation(false), 4000);
        return () => clearTimeout(timer);
    }
}, [showLevelUpAnimation]);


if (loading) return <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex items-center justify-center"><LoadingSpinner /></div>;
if (!progress) return <div className="bg-white p-6 rounded-2xl shadow-sm text-center">Nepodařilo se načíst data o progresi.</div>;

const xpForNextLevel = Math.floor(100 * (progress.level ** 1.6));
const allSkillsSorted = (progress.StudentSkill || []).map(ss => ({ ...ss, Skill: Array.isArray(ss.Skill) ? ss.Skill[0] : ss.Skill })).filter(s => s.Skill).sort((a, b) => b.level - a.level || b.xp - a.xp);
const displayedSkills = showAllSkills ? allSkillsSorted : allSkillsSorted.slice(0, 5);

return (
    <div className="bg-white p-3 sm:p-4 3xl:p-6 rounded-2xl shadow-xs border border-gray-200 h-full">
    <div className="sm:my-3 md:my-6 text-center">
        <p className="font-semibold text-sm 3xl:text-base text-gray-500">Celková Úroveň</p>
        <div className='relative w-full mx-auto h-20 flex items-center justify-center'>
            <div className="relative flex items-center justify-center">
                <p className="text-5xl 3xl:text-6xl font-bold text-[var(--barva-primarni)] z-10">{progress.level}</p>
                <AnimatePresence>
                    {showLevelUpAnimation && (
                        <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.4 } }} exit={{ opacity: 0, transition: { duration: 0.3 } }} className="absolute left-full top-1/2 -translate-y-1/2 ml-4 whitespace-nowrap text-xl 3xl:text-2xl font-bold text-green-500">LEVEL UP!</motion.span>
                    )}
                </AnimatePresence>
            </div>
        </div>
        <div className="max-w-xs mx-auto"><ProgressBar value={progress.xp} maxValue={xpForNextLevel} colorClass="bg-gradient-to-r from-[var(--barva-primarni)]/50 to-[var(--barva-primarni)]" /><p className="text-xs 3xl:text-sm font-semibold text-gray-600 mt-1">{progress.xp} / {xpForNextLevel} XP</p></div>
    </div>
    <hr className="my-4"/>
    <div>
        <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm 3xl:text-base font-bold text-gray-700">Dovednosti</h4>
            {allSkillsSorted.length > 5 && (
                <button onClick={() => setShowAllSkills(!showAllSkills)} className="text-xs 3xl:text-sm font-semibold text-[var(--barva-primarni)] flex items-center gap-1 cursor-pointer">
                    {showAllSkills ? 'Zobrazit méně' : 'Zobrazit vše'}
                    <motion.div animate={{ rotate: showAllSkills ? 180 : 0 }}><ChevronDown size={16} /></motion.div>
                </button>
            )}
        </div>
        <div className="space-y-2">
            
            <AnimatePresence>
                {displayedSkills.map((skill) => {
                    if (!skill.Skill) return null;
                    const xpForNextSkillLevel = Math.floor(75 * (skill.level ** 1.4));
                    const isNew = unseenUpdates.newSkills.includes(skill.Skill.id);
                    const hasLeveledUp = unseenUpdates.leveledUpSkills.includes(skill.Skill.id);
                    return (
                    <motion.div 
                        key={skill.Skill.id} 
                        className="p-2 rounded-lg" 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex justify-between items-center mb-1">
                        <span className="text-sm 3xl:text-base font-semibold text-[var(--barva-primarni)]">{skill.Skill.name}</span>
                        <div className='flex text-sm 3xl:text-base items-center gap-2 relative'>
                            {isNew && <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">NOVÝ!</span>}
                            {hasLeveledUp && <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">LEVEL UP!</span>}
                            <span className="flex justify-center text-xs 3xl:text-sm font-bold bg-[var(--barva-primarni2)] text-[var(--barva-primarni)] px-2 py-0.5 rounded-md w-20 text-center">Level {skill.level}</span>
                        </div>
                        </div>
                        <ProgressBar value={skill.xp} maxValue={xpForNextSkillLevel} colorClass="bg-gradient-to-r from-amber-300 to-amber-500" />
                        <p className="text-[10px] 3xl:text-xs text-right text-gray-500 mt-0.5">{skill.xp} / {xpForNextSkillLevel} XP</p>
                    </motion.div>
                    );
                })}
            </AnimatePresence>
            {allSkillsSorted.length === 0 && <p className="text-sm text-center text-gray-500 py-4">Dokonči svou první výzvu a začni levelovat své dovednosti!</p>}
        </div>
    </div>
    </div>
);
}