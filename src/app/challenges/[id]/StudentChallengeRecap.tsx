"use client";

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import type { Submission } from './SubmissionCard';
import { Star, Trophy, MessageSquareText, ArrowUp, Download, Sparkles, Eye, EyeOff, Info, Zap } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';


type XpEventWithSkill = {
    id: string; 
    event_type: string;
    xp_gained: number;
    new_level: number | null;
    Skill: { name: string, id: string } | null;
};



const PortfolioToggle = ({ submission, onToggle }: { submission: Submission, onToggle: (isPublic: boolean) => void }) => {
    const [isPublic, setIsPublic] = useState(submission.is_public_on_profile);
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useAuth();

    const handleToggle = async () => {
        setIsLoading(true);
        const newStatus = !isPublic;
        const { error } = await supabase
            .from('Submission')
            .update({ is_public_on_profile: newStatus })
            .eq('id', submission.id);
        
        if (error) {
            showToast('Změna viditelnosti se nezdařila.', 'error');
        } else {
            setIsPublic(newStatus);
            onToggle(newStatus);
            showToast(newStatus ? 'Výzva byla zveřejněna v portfoliu!' : 'Výzva byla skryta z portfolia.', 'success');
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-white border border-gray-100 shadow-sm p-4 rounded-xl mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:shadow-md">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isPublic ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    {isPublic ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 text-sm">Viditelnost v portfoliu</h4>
                    <p className="text-xs text-gray-500">
                        {isPublic ? 'Viditelné na veřejném profilu.' : 'Skryté z veřejného profilu.'}
                    </p>
                </div>
            </div>
            <button
                onClick={handleToggle}
                disabled={isLoading}
                className={`px-4 py-1.5 rounded-full font-semibold text-xs transition-all w-full sm:w-auto cursor-pointer border ${
                    isPublic 
                        ? 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50' 
                        : 'bg-[var(--barva-primarni)] text-white border-transparent hover:brightness-110 shadow-sm'
                }`}
            >
                {isLoading ? 'Ukládám...' : (isPublic ? 'Skrýt' : 'Zveřejnit')}
            </button>
        </div>
    );
};


const SkillXpCard = ({ name, xp, levelUp }: { name: string, xp: number, levelUp: number | null }) => (
    <div className="bg-white border border-gray-100 p-4 rounded-xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-50 text-gray-500">
                <Zap size={18} />
            </div>
            <div>
                <p className="font-semibold text-[var(--barva-primarni)] text-sm">{name}</p>
                <p className="text-xs text-gray-400">Dovednost vylepšena</p>
            </div>
        </div>
        <div className="text-right">
            <p className="font-bold text-[var(--barva-primarni)] text-sm">+{xp} XP</p>
            {levelUp && (
                <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-100 mt-1">
                    LEVEL {levelUp} <ArrowUp size={10} />
                </div>
            )}
        </div>
    </div>
);


const NewSkillCard = ({ name }: { name: string }) => (
    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-50 to-white border border-emerald-100 p-4 rounded-xl flex items-center justify-center gap-3">
        <Sparkles className="text-emerald-500" size={20} />
        <span className="font-bold text-emerald-800 text-sm tracking-wide">{name}</span>
        <span className="absolute top-2 right-2 text-[8px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">Nové</span>
    </div>
);

function XpGainedSummary({ events }: { events: XpEventWithSkill[] }) {
    const { studentTotal, skillsXp, newSkillsList } = useMemo(() => {        
        let hasCountedStudentXp = false;
        const processedSkills = new Set<string>(); 
        
        let totalXp = 0;
        let newLevel = null;
        
        const uniqueSkillsList: { name: string, xp: number, levelUp: number | null }[] = [];
        const uniqueNewSkillsNames: string[] = [];

        events.forEach(e => {
            if (e.event_type === 'student_xp') {
                if (!hasCountedStudentXp) {
                    totalXp = e.xp_gained; 
                    newLevel = e.new_level;
                    hasCountedStudentXp = true;
                }
            }
            
            if (e.Skill?.name) {
                const skillName = e.Skill.name;                                
                if (!processedSkills.has(skillName)) {
                    uniqueSkillsList.push({
                        name: skillName,
                        xp: e.xp_gained,      
                        levelUp: e.new_level
                    });
                    if (e.event_type === 'new_skill') {
                        uniqueNewSkillsNames.push(skillName);
                    }
                    processedSkills.add(skillName);
                }
            }
        });

        return {
            studentTotal: { xp: totalXp, level: newLevel as number | null },
            skillsXp: uniqueSkillsList,
            newSkillsList: uniqueNewSkillsNames
        };
    }, [events]);

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-6 text-center">
                Shrnutí postupu
            </h3>

            <div className="flex flex-col items-center justify-center mb-10">
                <div className="relative w-32 h-32 rounded-full border-4 border-white bg-gradient-to-b from-blue-50 to-white shadow-sm flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-[var(--barva-primarni)]">
                        +{studentTotal.xp}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">XP Získáno</span>
                    
                    {studentTotal.level && (
                        <div className="absolute -bottom-3 bg-[var(--barva-primarni)] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm border-2 border-white flex items-center gap-1">
                            <ArrowUp size={12} />
                            LEVEL UP {studentTotal.level}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-8">
                
                {skillsXp.length > 0 && (
                    <div>
                        <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3 ml-1">
                            Vylepšené dovednosti
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {skillsXp.map((skill, i) => (
                                <SkillXpCard key={i} name={skill.name} xp={skill.xp} levelUp={skill.levelUp} />
                            ))}
                        </div>
                    </div>
                )}

                {newSkillsList.length > 0 && (
                    <div>
                        <div className="flex items-center gap-4 my-6">
                            <div className="h-px bg-gray-200 flex-grow"></div>
                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Odemčeno</span>
                            <div className="h-px bg-gray-200 flex-grow"></div>
                        </div>

                        <h4 className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-3 ml-1">
                            Nové dovednosti získány
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {newSkillsList.map((skillName, i) => (
                                <NewSkillCard key={i} name={skillName} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}



export default function StudentChallengeRecap({ submission, challengeStatus }: { submission: Submission, challengeStatus: 'open' | 'closed' | 'draft' | 'archived' }) {
    const [xpEvents, setXpEvents] = useState<XpEventWithSkill[]>([]);
    const [currentSubmission, setCurrentSubmission] = useState(submission);

    const isFinal = challengeStatus === 'closed' || challengeStatus === 'archived';

    useEffect(() => {
        if (!submission) return;
        
        const fetchXpEvents = async () => {
            const { data, error } = await supabase
                .from('XpEvent')
                .select('id, event_type, xp_gained, new_level, Skill(name, id)') 
                .eq('submission_id', submission.id);

            if (error) {
                console.error("Chyba při načítání XP událostí:", error);
            } else if (data) {
                setXpEvents(data as XpEventWithSkill[]);
            }
        };

        if (isFinal) {
            fetchXpEvents();
        }
    }, [submission, isFinal]);

    const handlePortfolioToggle = (isPublic: boolean) => {
        setCurrentSubmission(prev => ({...prev, is_public_on_profile: isPublic}));
    };

    return (
        <>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center mb-2 sm:mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold uppercase text-[var(--barva-tmava)]">
                        {isFinal ? "Výsledky výzvy" : "Tvoje řešení bylo ohodnoceno!"}
                    </h2>
                    <p className="text-xs sm:text-lg text-gray-600 mt-2 sm:mt-4 max-w-2xl mx-auto">
                        {isFinal ? "Výzva je uzavřena. Podívej se na své hodnocení a získané zkušenosti." : "Skvělá práce! Startup ti poslal zpětnou vazbu."}
                    </p>
                </div>

                {!isFinal && (
                    <div className="max-w-2xl mx-auto mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-blue-800 text-sm">Co se děje teď?</h4>
                            <p className="text-sm text-blue-700 mt-1">Tvoje řešení je ohodnocené, ale výzva stále běží pro ostatní. Na finální vyhlášení vítězů a případné umístění si ještě musíš počkat po termínu uzávěrky.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto my-8">
                    {submission.rating && (
                        <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center border border-gray-100 transition-transform hover:scale-[1.02]">
                            <Star className="w-8 h-8 text-[var(--barva-primarni)] mb-2" fill="currentColor" fillOpacity={0.2} />
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Hodnocení</p>
                            <p className="text-xl md:text-3xl font-bold text-gray-800">{submission.rating} <span className="text-lg text-gray-400 font-normal">/ 10</span></p>
                        </div>
                    )}

                    {isFinal && submission.position && [1, 2, 3].includes(submission.position) ? (
                        <div className="bg-amber-50 rounded-xl p-6 flex flex-col items-center justify-center border border-amber-100 transition-transform hover:scale-[1.02]">
                            <Trophy className="w-8 h-8 text-amber-500 mb-2" />
                            <p className="text-amber-600/70 text-xs font-bold uppercase tracking-wider">Umístění</p>
                            <p className="text-xl md:text-3xl font-bold text-amber-600">{submission.position}. místo</p>
                        </div>
                    ) : (
                        
                        (submission.file_url || submission.link) && (
                            <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center border border-gray-100 text-center">
                                <Download className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tvoje práce</p>
                                <a 
                                    href={submission.file_url || submission.link || '#'} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm font-semibold text-[var(--barva-primarni)] hover:underline mt-1"
                                >
                                    Stáhnout / Zobrazit
                                </a>
                            </div>
                        )
                    )}
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                    {submission.feedback_comment && (
                        <div>
                            <h5 className="font-semibold text-gray-800 flex items-center gap-2 mb-3 text-sm">
                                <MessageSquareText className="w-4 h-4 text-gray-400" />
                                Zpětná vazba od startupu
                            </h5>
                            <div className="bg-gray-50 border border-gray-200 text-gray-700 p-5 rounded-xl relative">
                                <span className="absolute top-4 left-3 text-4xl text-gray-200 font-serif leading-3">“</span>
                                <p className="italic text-sm md:text-base relative z-10 px-2">{submission.feedback_comment}</p>
                            </div>
                        </div>
                    )}
                </div>

                {isFinal && <PortfolioToggle submission={currentSubmission} onToggle={handlePortfolioToggle} />}
            </div>
            {isFinal && xpEvents.length > 0 && <XpGainedSummary events={xpEvents} />}
        </>
    );
}