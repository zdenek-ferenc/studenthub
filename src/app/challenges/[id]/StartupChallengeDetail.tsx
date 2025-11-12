"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import SubmissionCard, { type Submission } from './SubmissionCard';
import FinalSelection from './FinalSelection';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '../../../components/ConfirmationModal';
import ChallengeRecapView from './ChallengeRecapView';
import { useAuth } from '../../../contexts/AuthContext';
import { AlertCircle, CheckCircle, Lock, Clock, Users, ChevronLeft, Eye} from 'lucide-react';
import { differenceInDays, format} from 'date-fns';
import StartupChallengeHeader from './StartupChallengeHeader';

type Challenge = {
id: string; status: 'draft' | 'open' | 'closed' | 'archived'; title: string;
description: string; goals: string; expected_outputs: string;
reward_first_place: number | null; reward_second_place: number | null; reward_third_place: number | null;
reward_description: string | null; 
attachments_urls: string[] | null;
number_of_winners: number | null; 
max_applicants: number | null; deadline: string;
created_at: string;
Submission: { id: string, student_id: string }[];
ChallengeSkill: { Skill: { id: string, name: string } }[];
StartupProfile: { company_name: string, logo_url: string | null } | null;
};


const EvaluationStatusPanel = ({
    canFinalize,
    ratedCount,
    totalCount,
    onProceed,
    deadline,
    applicants,
    maxApplicants,
    createdAt 
}: {
    canFinalize: boolean,
    ratedCount: number,
    totalCount: number,
    onProceed: () => void,
    deadline: string,
    applicants: number,
    maxApplicants: number | null,
    createdAt: string 
}) => {
    const allRated = ratedCount === totalCount && totalCount > 0;
    const deadlineDate = new Date(deadline);
    const daysRemaining = differenceInDays(deadlineDate, new Date());
    const startDate = new Date(createdAt).getTime();
    const today = new Date().getTime();
    const deadlineMs = deadlineDate.getTime();
    const totalDuration = deadlineMs - startDate;
    const elapsedDuration = today - startDate;

    let timeProgress = 0;
    if (totalDuration > 0) {
        timeProgress = (elapsedDuration / totalDuration) * 100;
    } else if (daysRemaining < 0) {
        timeProgress = 100;
    }
    timeProgress = Math.max(0, Math.min(100, timeProgress));

    const capacityProgress = maxApplicants ? (applicants / maxApplicants) * 100 : 0;

    if (!canFinalize) {
        return (
            <div className="lg:py-4 rounded-2xl">
                <div className="max-w-3xl mx-auto">
                    <h3 className="xl:text-2xl text-xl font-bold text-center text-[var(--barva-tmava)] mb-2">
                        {daysRemaining < 0 ? "Výzva je po termínu, čeká se na odevzdání" : "Výzva je v plném proudu"}
                    </h3>
                    <p className="lg:text-base text-sm text-center text-gray-500 mb-8">Zde je přehled aktuálního stavu a dalších kroků.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                        <div>
                            <div className="flex justify-between items-center mb-1 font-semibold text-sm">
                                <span className="text-gray-600 flex items-center gap-2"><Clock size={14}/> Průběh výzvy</span>
                                <span className="text-[var(--barva-tmava)]">{daysRemaining > 0 ? `Zbývá ${daysRemaining} dní` : 'Po termínu'}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${timeProgress}%` }}></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1 font-semibold text-sm">
                                <span className="text-gray-600 flex items-center gap-2"><Users size={14}/> Naplněnost</span>
                                <span className="text-[var(--barva-tmava)]">{applicants} / {maxApplicants || '∞'}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${capacityProgress}%` }}></div></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h4 className="font-bold text-lg text-gray-800">Co teď?</h4>
                            <p className="text-sm text-gray-600 mt-1">Průběžně hodnoťte odevzdaná řešení. Studentům to pomůže a vám to ušetří práci na konci.</p>
                            <div className="mt-3 text-sm font-semibold text-[var(--barva-primarni)]">
                                Ohodnoceno: {ratedCount} z {totalCount}
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h4 className="font-bold text-lg text-gray-800">Co dál?</h4>
                            <p className="text-sm text-gray-600 mt-1">
                                Finální výběr vítězů se odemkne po termínu ({format(deadlineDate, 'd. M. yyyy')}) nebo po naplnění kapacity a odevzdání všech řešení.
                            </p>
                            <button disabled className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed">
                                <Lock size={14}/> Vybrat vítěze (zamčeno)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200 text-center">
            <div className="max-w-2xl mx-auto">
                {allRated ? (
                    <>
                        <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                        <h3 className="text-xl font-bold text-[var(--barva-tmava)]">Všechna řešení jsou ohodnocena!</h3>
                        <p className="text-gray-500 mt-2">Skvělá práce! Nyní můžete přejít k finálnímu výběru a přetáhnout nejlepší řešení na vítězné pozice.</p>
                        <button onClick={onProceed} className="mt-6 px-8 py-3 rounded-full bg-[var(--barva-primarni)] text-white font-semibold shadow-md hover:bg-blue-700 transition-all">
                            Přejít k výběru vítězů
                        </button>
                    </>
                ) : (
                    <>
                        <AlertCircle className="w-12 h-12 mx-auto text-amber-500 mb-3" />
                        <h3 className="text-xl font-bold text-[var(--barva-tmava)]">Nejdříve dokončete hodnocení</h3>
                        <p className="text-gray-500 mt-2">Aby byl výběr vítězů spravedlivý, je potřeba nejprve ohodnotit a okomentovat všechna odevzdaná řešení.</p>
                        <div className="mt-5 max-w-md mx-auto">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-base font-medium text-[var(--barva-primarni)]">Postup hodnocení</span>
                                <span className="text-sm font-medium text-[var(--barva-primarni)]">{ratedCount} z {totalCount} hotovo</span>
                            </div>
                            <div className="w-full bg-blue-100 rounded-full h-2.5">
                                <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${totalCount > 0 ? (ratedCount/totalCount)*100 : 0}%` }}></div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};


export default function StartupChallengeDetail({ challenge: initialChallenge }: { challenge: Challenge }) {
    const [challenge, setChallenge] = useState(initialChallenge); 
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'evaluating' | 'selecting_winners'>('evaluating');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [winnersToConfirm, setWinnersToConfirm] = useState<{ [key: number]: string } | null>(null);

    // ZMĚNA #1: Vytvoření unikátního klíče pro localStorage
    const getStorageKey = useCallback(() => `hiddenSubmissions_${initialChallenge.id}`, [initialChallenge.id]);

    // ZMĚNA #2: Inicializace stavu z localStorage
    const [hiddenSubmissions, setHiddenSubmissions] = useState<Set<string>>(() => {
        if (typeof window === 'undefined') {
            return new Set<string>();
        }
        const stored = window.localStorage.getItem(getStorageKey());
        return stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
    });
    
    const router = useRouter();
    const { showToast } = useAuth();

    const fetchInitialSubmissions = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
        .from('Submission')
        .select(`*, StudentProfile(*)`)
        .eq('challenge_id', challenge.id)
        .order('created_at', { ascending: true });

        if (error) {
        console.error("Chyba při načítání přihlášek:", error);
        } else {
        setSubmissions(data as Submission[]);
        }
        setLoading(false);
    }, [challenge.id]);

    useEffect(() => {
        fetchInitialSubmissions();
    }, [fetchInitialSubmissions]);

    // ZMĚNA #3: Funkce `hideSubmission` nyní ukládá do localStorage
    const hideSubmission = (submissionId: string) => {
        setHiddenSubmissions(prev => {
            const newSet = new Set(prev).add(submissionId);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(getStorageKey(), JSON.stringify(Array.from(newSet)));
            }
            return newSet;
        });
    };

    // ZMĚNA #4: Funkce `showAllSubmissions` nyní čistí localStorage
    const showAllSubmissions = () => {
        setHiddenSubmissions(new Set());
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(getStorageKey());
        }
    };

    const handleSubmissionUpdate = (updatedSubmission: Submission) => {
    setSubmissions(current => current.map(s => s.id === updatedSubmission.id ? updatedSubmission : s));
    };

    const { canFinalize, ratedCount } = useMemo(() => {
        const isAfterDeadline = new Date() > new Date(challenge.deadline);
        
        const maxApplicants = challenge.max_applicants || 0;
        const appliedCount = challenge.Submission.length;
        const submittedCount = submissions.filter(s => s.status === 'submitted' || s.status === 'reviewed' || s.status === 'winner' || s.status === 'rejected').length;
        
        const isFullAndAllHaveSubmitted = 
        maxApplicants > 0 &&
        appliedCount === maxApplicants &&
        submittedCount === appliedCount;

        const rated = submissions.filter(s => s.status === 'reviewed' || s.status === 'winner' || s.status === 'rejected');
        
        return {
            canFinalize: isAfterDeadline || isFullAndAllHaveSubmitted,
            ratedCount: rated.length,
        };
    }, [challenge, submissions]);

    const anonymousSubmissions = useMemo(() => 
        submissions.map((sub, index) => ({...sub, anonymousId: `Řešení #${index + 1}`})
    ), [submissions]);

    const displayedSubmissions = useMemo(() => 
        anonymousSubmissions.filter(sub => !hiddenSubmissions.has(sub.id))
    , [anonymousSubmissions, hiddenSubmissions]);

    const prepareToFinalize = (winners: { [key: number]: string }) => {
        setWinnersToConfirm(winners);
        setIsModalOpen(true);
    };

    const handleFinalizeChallenge = async () => {
        if (!winnersToConfirm) return;
        const updates = Object.entries(winnersToConfirm).map(([place, submissionId]) => 
            supabase.from('Submission').update({ position: parseInt(place), status: 'winner' }).eq('id', submissionId)
        );
        await Promise.all(updates);
        const { error } = await supabase.from('Challenge').update({ status: 'closed' }).eq('id', challenge.id);
        
        if (error) {
            showToast(`Chyba: ${error.message}`, 'error');
        } else {
            showToast('Výsledky byly úspěšně vyhlášeny!', 'success');

            await fetchInitialSubmissions(); 
            setChallenge(prevChallenge => ({
                ...prevChallenge,
                status: 'closed' 
            }));
            router.refresh(); 
        }
        setIsModalOpen(false);
    };

    if (loading) return <p className="text-center py-20">Načítám přihlášky...</p>;

    return (
        <div className='lg:max-w-5xl 3xl:max-w-6xl mx-4 sm:mx-auto py-4 md:py-24 xl:py-32 md:px-4 space-y-4 sm:space-y-6 xl:space-y-7'>
        <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm cursor-pointer font-semibold text-gray-500 hover:text-[var(--barva-primarni)] transition-colors mb-2"
            >
            <ChevronLeft size={16} />
            Zpět na přehled
        </button>
        <StartupChallengeHeader challenge={challenge} />
        {challenge.status === 'closed' || challenge.status === 'archived' ? (
            <ChallengeRecapView submissions={submissions} />
            ) : (
            <>
                {view === 'evaluating' && (
                    <>
                        <EvaluationStatusPanel
                            canFinalize={canFinalize}
                            ratedCount={ratedCount}
                            totalCount={submissions.length}
                            onProceed={() => setView('selecting_winners')}
                            deadline={challenge.deadline}
                            applicants={challenge.Submission.length}
                            maxApplicants={challenge.max_applicants}
                            createdAt={challenge.created_at}
                        />
                        {hiddenSubmissions.size > 0 && (
                            <div className="flex justify-center mb-4">
                                <button
                                    onClick={showAllSubmissions}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[var(--barva-primarni)] cursor-pointer bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                                >
                                    <Eye size={16} />
                                    Zobrazit skrytá řešení ({hiddenSubmissions.size})
                                </button>
                            </div>
                        )}
                        {displayedSubmissions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayedSubmissions.map(sub => (
                                    <SubmissionCard 
                                        key={sub.id} 
                                        submission={sub} 
                                        onUpdate={handleSubmissionUpdate} 
                                        anonymousId={sub.anonymousId} 
                                        onHide={hideSubmission} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-12 rounded-2xl text-center text-gray-500">
                                <h3 className="text-xl font-bold text-[var(--barva-primarni)]">
                                    {submissions.length > 0 ? "Všechna řešení jsou skryta" : "Čekáme na první řešení"}
                                </h3>
                                <p className="mt-2">
                                    {submissions.length > 0 ? "Pro jejich zobrazení klikněte na tlačítko 'Zobrazit skrytá řešení'." : "Jakmile studenti začnou odevzdávat svá řešení, uvidíte je zde."}
                                </p>
                            </div>
                        )}
                    </>
                )}
                
                {view === 'selecting_winners' && (
                    <FinalSelection
                        submissions={anonymousSubmissions.filter(s => s.status === 'reviewed')}
                        challenge={challenge}
                        onFinalize={prepareToFinalize}
                        onBack={() => setView('evaluating')}
                    />
                )}

                <ConfirmationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleFinalizeChallenge}
                    title="Opravdu chcete vyhlásit výsledky?"
                    message="Tato akce je nevratná. Vítězům bude přiřazeno pořadí, výzva se uzavře a identity studentů se odhalí."
                />
            </>
        )}
        </div>
    );
}