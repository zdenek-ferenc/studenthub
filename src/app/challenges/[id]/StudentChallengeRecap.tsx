"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import type { Submission } from './SubmissionCard';
import { Star, Trophy, MessageSquareText, Download, Award, Sparkles, Eye, EyeOff, Info } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

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
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                {isPublic ? <Eye className="w-6 h-6 text-blue-500" /> : <EyeOff className="w-6 h-6 text-gray-500" />}
                <div>
                    <h4 className="font-bold text-gray-800">Viditelnost v portfoliu</h4>
                    <p className="text-sm text-gray-600">
                        {isPublic ? 'Tento úspěch je viditelný na tvém veřejném profilu.' : 'Tento úspěch je skrytý.'}
                    </p>
                </div>
            </div>
            <button
                onClick={handleToggle}
                disabled={isLoading}
                className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors w-full sm:w-auto cursor-pointer ${
                    isPublic 
                        ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300' 
                        : 'bg-[var(--barva-primarni)] text-white hover:bg-blue-500 ease-in-out transition-all duration-200'
                }`}
            >
                {isLoading ? 'Měním...' : (isPublic ? 'Skrýt z profilu' : 'Zveřejnit na profilu')}
            </button>
        </div>
    );
};
type XpEventWithSkill = {
  event_type: string;
  xp_gained: number;
  new_level: number | null;
  Skill: { name: string } | null;
};

const XpRow = ({ icon, label, xp, newLevel }: { icon: React.ReactNode, label: string, xp: number, newLevel: number | null }) => (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
        <div className="flex items-center gap-3">
            {icon}
            <span className="font-semibold text-gray-700">{label}</span>
            {newLevel && <span className="text-xs font-bold bg-[var(--barva-primarni2)] text-[var(--barva-tmava)] px-2 py-0.5 rounded-md">LEVEL UP! &rarr; {newLevel}</span>}
        </div>
        <span className="font-bold text-green-600">+{xp} XP</span>
    </div>
);

function XpGainedSummary({ events }: { events: XpEventWithSkill[] }) {
    const studentXpEvent = events.find(e => e.event_type === 'student_xp');
    const skillEvents = events.filter(e => e.event_type === 'skill_xp');
    const newSkillEvents = events.filter(e => e.event_type === 'new_skill');

    return (
        <div className="p-6 rounded-2xl mt-8 bg-gradient-to-t from-[var(--barva-tmava)]/90 to-[var(--barva-tmava)]">
            <h3 className="text-xl font-bold text-center text-white mb-4">Shrnutí odměn a progrese</h3>
            <div className="space-y-4 max-w-lg mx-auto">
                {studentXpEvent && (
                    <XpRow
                        icon={<Award className="w-6 h-6 text-blue-500" />}
                        label="Celkový pokrok"
                        xp={studentXpEvent.xp_gained}
                        newLevel={studentXpEvent.new_level}
                    />
                )}
                {skillEvents.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-gray-600 mb-2 ml-1">Vylepšené dovednosti:</h4>
                        <div className="space-y-2">
                            {skillEvents.map((event, i) => (
                                <XpRow
                                    key={`skill-${i}`}
                                    icon={<Star className="w-6 h-6 text-amber-500" />}
                                    label={event.Skill?.name || 'Dovednost'}
                                    xp={event.xp_gained}
                                    newLevel={event.new_level}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {newSkillEvents.length > 0 && (
                     <div>
                        <h4 className="font-semibold text-green-700 mb-2 ml-1">Nové dovednosti odemčeny!</h4>
                        <div className="space-y-2">
                            {newSkillEvents.map((event, i) => (
                                <XpRow
                                    key={`new-skill-${i}`}
                                    icon={<Sparkles className="w-6 h-6 text-green-600" />}
                                    label={event.Skill?.name || 'Nová dovednost'}
                                    xp={event.xp_gained}
                                    newLevel={event.new_level}
                                />
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
                .select('*, Skill(name)')
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
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs mt-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold uppercase text-[var(--barva-tmava)]">
                        {isFinal ? "Výsledky" : "Tvoje řešení bylo ohodnoceno!"}
                    </h2>
                    <p className="text-lg text-gray-600 mt-4">
                        {isFinal ? "Výzva je již uzavřena. Zde je finální zpětná vazba od startupu." : "Skvělá práce! Startup ti poslal zpětnou vazbu."}
                    </p>
                </div>

                {!isFinal && (
                    <div className="max-w-2xl mx-auto mb-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg flex items-start gap-3">
                        <Info className="w-8 h-8 text-blue-500 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-blue-800">Co se děje teď?</h4>
                            <p className="text-sm text-blue-700">Tvoje řešení je ohodnocené, ale výzva stále běží pro ostatní. Na finální vyhlášení vítězů a případné umístění si ještě musíš počkat po termínu uzávěrky.</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-around items-center p-4 max-w-lg mx-auto gap-6">
                    {isFinal && submission.position && [1, 2, 3].includes(submission.position) && (
                        <div className="text-center">
                            <div className="flex items-center gap-2 mt-1">
                                <Trophy className="w-8 h-8 text-amber-500" />
                                <p className="text-2xl md:text-3xl font-bold text-[var(--barva-primarni)]">{submission.position}. místo</p>
                            </div>
                        </div>
                    )}
                    {submission.rating && (
                        <div className="text-center">
                            <div className="flex items-center gap-2 mt-1">
                                <Star className="w-8 h-8 text-blue-500" />
                                <p className="text-2xl md:text-3xl font-bold text-[var(--barva-primarni)]">{submission.rating} / 10</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="max-w-2xl mx-auto mt-8 space-y-6">
                    {submission.feedback_comment && (
                        <div>
                            <h5 className="font-semibold text-gray-700 flex items-center gap-2 mb-2 text-lg">
                                <MessageSquareText className="w-6 h-6" />
                                Zpětná vazba od startupu
                            </h5>
                            <blockquote className="bg-blue-50 border-l-4 border-blue-400 text-blue-900 p-4 rounded-r-lg">
                                <p className="italic">{submission.feedback_comment}</p>
                            </blockquote>
                        </div>
                    )}
                    {(submission.file_url || submission.link) && (
                        <div>
                            <h5 className="font-semibold text-gray-700 flex items-center gap-2 mb-2 text-lg">
                                <Download className="w-6 h-6" />
                                Tvoje odevzdané řešení
                            </h5>
                            <a 
                                href={submission.file_url || submission.link || '#'} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-block px-6 py-2 rounded-full bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                            >
                                Stáhnout
                            </a>
                        </div>
                    )}
                </div>
                {isFinal && <PortfolioToggle submission={currentSubmission} onToggle={handlePortfolioToggle} />}
            </div>
            
            {isFinal && xpEvents.length > 0 && <XpGainedSummary events={xpEvents} />}
        </>
    );
}