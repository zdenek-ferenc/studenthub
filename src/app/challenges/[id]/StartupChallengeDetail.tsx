"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import SubmissionCard, { type Submission } from './SubmissionCard';
import FinalSelection from './FinalSelection';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '../../../components/ConfirmationModal';
import ChallengeRecapView from './ChallengeRecapView';
import { useAuth } from '../../../contexts/AuthContext';
import { CheckCircle, Lock, Clock, Users, ChevronLeft, Eye, EyeOff, ArrowRight, FileText, LayoutGrid } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import StartupChallengeHeader from './StartupChallengeHeader';
import ChallengeQnA from './components/ChallengeQnA';

type Challenge = {
    id: string; 
    status: 'draft' | 'open' | 'closed' | 'archived'; 
    title: string;
    description: string; 
    goals: string; 
    expected_outputs: string;
    reward_first_place: number | null; 
    reward_second_place: number | null; 
    reward_third_place: number | null;
    reward_description: string | null;
    attachments_urls: string[] | null;
    number_of_winners: number | null;
    max_applicants: number | null; 
    deadline: string;
    created_at: string;
    prize_pool_paid?: boolean; 
    payment_status?: string | null;
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
    createdAt,
    isLocked,
    isAfterDeadline
}: {
    canFinalize: boolean,
    ratedCount: number,
    totalCount: number,
    onProceed: () => void,
    deadline: string,
    applicants: number,
    maxApplicants: number | null,
    createdAt: string,
    isLocked: boolean,
    isAfterDeadline: boolean
}) => {
    const allRated = ratedCount === totalCount && totalCount > 0;
    
    const deadlineDate = new Date(deadline);
    const startDate = new Date(createdAt).getTime();
    const today = new Date().getTime();
    const deadlineMs = deadlineDate.getTime();
    const totalDuration = deadlineMs - startDate;
    const elapsedDuration = today - startDate;
    const daysRemaining = differenceInDays(deadlineDate, new Date());

    let timeProgress = 0;
    if (totalDuration > 0) {
        timeProgress = (elapsedDuration / totalDuration) * 100;
    } else if (isAfterDeadline) {
        timeProgress = 100;
    }
    timeProgress = Math.max(0, Math.min(100, timeProgress));

    const capacityProgress = maxApplicants ? (applicants / maxApplicants) * 100 : 0;

    if (!canFinalize) {
        const reason = !isAfterDeadline 
            ? 'deadline' 
            : (!allRated ? 'pending_reviews' : 'unknown');

        return (
            <div className="lg:py-4 rounded-2xl">
                <div className="max-w-3xl mx-auto">
                    <h3 className="xl:text-2xl text-xl font-bold text-center text-gray-900 mb-2">
                        {reason === 'deadline' ? "Výzva je v plném proudu" : "Výzva je po termínu"}
                    </h3>
                    <p className="lg:text-base text-sm text-center text-gray-500 mb-8">
                        {reason === 'deadline' 
                            ? "Zde je přehled aktuálního stavu. Finální výběr se odemkne až po uzávěrce."
                            : "Pro vyhlášení vítězů musíte ohodnotit všechna odevzdaná řešení."}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                        <div>
                            <div className="flex justify-between items-center mb-1 font-semibold text-sm">
                                <span className="text-gray-600 flex items-center gap-2"><Clock size={14} /> Průběh výzvy</span>
                                <span className="text-gray-900">
                                    {isAfterDeadline ? 'Po termínu' : `Zbývá ${Math.max(0, daysRemaining)} dní`}
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div className={`h-full rounded-full ${isAfterDeadline ? 'bg-orange-500' : 'bg-blue-600'}`} style={{ width: `${timeProgress}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1 font-semibold text-sm">
                                <span className="text-gray-600 flex items-center gap-2"><Users size={14} /> Naplněnost</span>
                                <span className="text-gray-900">{applicants} / {maxApplicants || '∞'}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden"><div className="bg-emerald-500 h-full rounded-full" style={{ width: `${capacityProgress}%` }}></div></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-5 rounded-2xl border transition-colors ${reason === 'pending_reviews' ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-gray-200'}`}>
                            <h4 className={`font-bold text-lg ${reason === 'pending_reviews' ? 'text-amber-700' : 'text-gray-900'}`}>
                                {reason === 'pending_reviews' ? '⚠️ Dokončete hodnocení' : 'Hodnocení'}
                            </h4>
                            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                {reason === 'pending_reviews' 
                                    ? "Některá odevzdaná řešení stále čekají na vaši zpětnou vazbu. Bez toho nelze výzvu uzavřít." 
                                    : "Průběžně hodnoťte odevzdaná řešení. Studentům to pomůže a vám to ušetří práci na konci."}
                            </p>
                            <div className="mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                Ohodnoceno: {ratedCount} z {totalCount} (odevzdaných)
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-200">
                            <h4 className="font-bold text-lg text-gray-900">Co dál?</h4>
                            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                {!isAfterDeadline 
                                    ? `Finální výběr vítězů se odemkne ${format(deadlineDate, 'd. M. yyyy')}.`
                                    : "Jakmile ohodnotíte všechna řešení, odemkne se tlačítko pro výběr vítězů."}
                            </p>
                            
                            <button disabled className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200">
                                {isLocked && <Lock size={14} />}
                                {isLocked ? 'Vybrat vítěze (zamčeno)' : 
                                    (reason === 'pending_reviews' ? 'Vybrat vítěze (chybí hodnocení)' : 'Vybrat vítěze (čekáme na deadline)')
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 shadow-xs text-center animate-fade-in-up mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex flex-shrink-0 items-center justify-center">
                    <CheckCircle size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Vše připraveno k vyhlášení!</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Termín vypršel a všechna řešení jsou ohodnocena.
                    </p>
                </div>
            </div>
            
            <button
                onClick={onProceed}
                disabled={isLocked}
                className={`
                    flex-shrink-0 px-6 py-3 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition-all duration-300
                    ${isLocked 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'btn-shiny cursor-pointer bg-[var(--barva-primarni)] text-white hover:-translate-y-0.5 hover:shadow-lg'
                    }
                `}
            >
                {isLocked && <Lock size={16} />}
                {isLocked ? 'Nejdříve odemkněte výhru' : (
                    <>
                        Vybrat vítěze <ArrowRight size={18} />
                    </>
                )}
            </button>
        </div>
    );
};


export default function StartupChallengeDetail({ challenge: initialChallenge, activeTab, setActiveTab, unansweredCount, setUnansweredCount }: { challenge: Challenge, activeTab?: 'assignment'|'qna', setActiveTab?: import('react').Dispatch<import('react').SetStateAction<'assignment'|'qna'>> , unansweredCount?: number, setUnansweredCount?: import('react').Dispatch<import('react').SetStateAction<number>> }) {
    const [challenge, setChallenge] = useState(initialChallenge);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'evaluating' | 'selecting_winners'>('evaluating');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [winnersToConfirm, setWinnersToConfirm] = useState<{ [key: number]: string } | null>(null);

    const [filterSubmittedOnly, setFilterSubmittedOnly] = useState(false);
    const [viewHidden, setViewHidden] = useState(false);

    const getStorageKey = useCallback(() => `hiddenSubmissions_${initialChallenge.id}`, [initialChallenge.id]);

    const [hiddenSubmissions, setHiddenSubmissions] = useState<Set<string>>(() => {
        if (typeof window === 'undefined') {
            return new Set<string>();
        }
        const stored = window.localStorage.getItem(getStorageKey());
        return stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
    });

    const router = useRouter();
    const { showToast } = useAuth();

    const totalPrizePool = useMemo(() => {
        return (challenge.reward_first_place || 0) + 
            (challenge.reward_second_place || 0) + 
            (challenge.reward_third_place || 0);
    }, [challenge]);

    const isLocked = useMemo(() => {
        const hasFinancialReward = totalPrizePool > 0;
        const isPaid = challenge.prize_pool_paid || challenge.payment_status === 'fully_paid';
        return hasFinancialReward && !isPaid;
    }, [totalPrizePool, challenge.prize_pool_paid, challenge.payment_status]);


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

    const toggleSubmissionVisibility = (submissionId: string) => {
        setHiddenSubmissions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(submissionId)) {
                newSet.delete(submissionId); 
            } else {
                newSet.add(submissionId);
            }
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(getStorageKey(), JSON.stringify(Array.from(newSet)));
            }
            return newSet;
        });
    };

    const handleSubmissionUpdate = (updatedSubmission: Submission) => {
        setSubmissions(current => current.map(s => s.id === updatedSubmission.id ? updatedSubmission : s));
    };

    const handleUnlock = async () => {
        try {
        const response = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            challengeId: challenge.id,
            paymentType: 'pool',
            }),
        });
    
        if (!response.ok) throw new Error('Payment initiation failed');
        const { url } = await response.json();
        window.location.href = url;
        } catch (error) {
        console.error('Unlock Error:', error);
        showToast('Chyba při odemykání.', 'error');
        }
    };

    const { canFinalize, ratedCount, relevantTotalCount, isAfterDeadline } = useMemo(() => {
        const isAfterDeadlineCheck = new Date() > new Date(challenge.deadline);
        
        const activeSubmissions = submissions.filter(s => 
            s.status === 'submitted' || 
            s.status === 'reviewed' || 
            s.status === 'winner' || 
            s.status === 'rejected'
        );

        const rated = activeSubmissions.filter(s => 
            s.status === 'reviewed' || 
            s.status === 'winner' || 
            s.status === 'rejected'
        );

        const allRated = activeSubmissions.length > 0 && activeSubmissions.length === rated.length;
        const readyToClose = activeSubmissions.length === 0 ? true : allRated;

        return {
            canFinalize: isAfterDeadlineCheck && readyToClose && activeSubmissions.length > 0, 
            ratedCount: rated.length,
            relevantTotalCount: activeSubmissions.length,
            isAfterDeadline: isAfterDeadlineCheck
        };
    }, [challenge, submissions]);

    function SlideTransition({ show, children }: { show: boolean, children: React.ReactNode }) {
        const [mounted, setMounted] = useState(show);
        useEffect(() => {
            if (show) setMounted(true);
            else {
                const t = setTimeout(() => setMounted(false), 320);
                return () => clearTimeout(t);
            }
        }, [show]);

        if (!mounted) return null;

        return (
            <div className={`transform transition-all duration-300 ease-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                {children}
            </div>
        );
    }

    const anonymousSubmissions = useMemo(() =>
        submissions.map((sub, index) => ({ ...sub, anonymousId: `Řešení #${index + 1}` })
        ), [submissions]);

    const displayedSubmissions = useMemo(() => {
        let result = anonymousSubmissions;

        if (viewHidden) {
            result = result.filter(sub => hiddenSubmissions.has(sub.id));
        } else {
            result = result.filter(sub => !hiddenSubmissions.has(sub.id));
        }

        if (filterSubmittedOnly) {
            result = result.filter(s => 
                s.status === 'submitted' || 
                s.status === 'reviewed' || 
                s.status === 'winner' || 
                s.status === 'rejected'
            );
        }

        return result;
    }, [anonymousSubmissions, hiddenSubmissions, filterSubmittedOnly, viewHidden]);

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
                className="group flex items-center gap-2 text-sm cursor-pointer font-medium text-gray-500 hover:text-blue-600 transition-colors mb-6 pl-2"
            >
                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
                Zpět na přehled
            </button>
            
            <StartupChallengeHeader challenge={challenge} />

            {setActiveTab && activeTab && (
                <div className="flex items-center gap-2 w-fit mb-6 bg-white p-1.5 rounded-full border border-gray-200 shadow-sm">
                    <button 
                        onClick={() => setActiveTab('assignment')} 
                        className={`px-5 py-2 text-sm rounded-full font-semibold transition-all duration-300 ${
                            activeTab === 'assignment' 
                            ? 'bg-[var(--barva-primarni)] text-white shadow-md' 
                            : 'text-gray-600 cursor-pointer hover:bg-gray-50 hover:inset-shadow-sm hover:text-[var(--barva-tmava)]'
                        }`}
                    >
                        Řešení
                    </button>
                    <button 
                        onClick={() => setActiveTab('qna')} 
                        className={`px-5 py-2 text-sm rounded-full font-semibold flex items-center gap-2 transition-all duration-300 ${
                            activeTab === 'qna' 
                            ? 'bg-[var(--barva-primarni)] text-white shadow-md' 
                            : 'text-gray-600 cursor-pointer hover:bg-gray-50 hover:inset-shadow-sm hover:text-[var(--barva-tmava)]'
                        }`}
                    >
                        Dotazy
                        {typeof unansweredCount === 'number' && unansweredCount > 0 && (
                            <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold rounded-md ${
                                activeTab === 'qna' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-700'
                            }`}>
                                {unansweredCount}
                            </span>
                        )}
                    </button>
                </div>
            )}

            <SlideTransition show={!!activeTab && activeTab === 'qna'}>
                <ChallengeQnA
                    challengeId={challenge.id}
                    role="startup"
                    visible={!!activeTab && activeTab === 'qna'}
                    onAnswered={() => { if (setUnansweredCount) setUnansweredCount(prev => Math.max(0, prev - 1)); }}
                />
            </SlideTransition>

            {(!activeTab || activeTab !== 'qna') && (
                (challenge.status === 'closed' || challenge.status === 'archived') ? (
                    <ChallengeRecapView submissions={submissions} />
                ) : (
                    <>
                        {view === 'evaluating' && (
                            <>
                                <EvaluationStatusPanel
                                    canFinalize={canFinalize}
                                    ratedCount={ratedCount}
                                    totalCount={relevantTotalCount} 
                                    onProceed={() => setView('selecting_winners')}
                                    deadline={challenge.deadline}
                                    applicants={challenge.Submission.length}
                                    maxApplicants={challenge.max_applicants}
                                    createdAt={challenge.created_at}
                                    isLocked={isLocked}
                                    isAfterDeadline={isAfterDeadline}
                                />
                                
                                <div className="bg-white rounded-2xl border border-gray-100 p-2 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 shadow-xs">
                                    
                                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1 w-full sm:w-auto">
                                        <button
                                            onClick={() => setFilterSubmittedOnly(false)}
                                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all 
                                            outline-none border-transparent ring-0 
                                            focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-transparent 
                                            focus-visible:outline-none focus-visible:ring-0 
                                            active:outline-none ${
                                                !filterSubmittedOnly 
                                                ? 'bg-white text-[var(--barva-primarni)] shadow-sm border border-gray-200' 
                                                : 'text-gray-500 cursor-pointer hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                        >
                                            <LayoutGrid size={16} />
                                            Vše
                                        </button>
                                        <button
                                            onClick={() => setFilterSubmittedOnly(true)}
                                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all 
                                            outline-none border-transparent ring-0 
                                            focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-transparent 
                                            focus-visible:outline-none focus-visible:ring-0 
                                            active:outline-none ${
                                                filterSubmittedOnly 
                                                ? 'bg-white text-[var(--barva-primarni)] shadow-sm border border-gray-200' 
                                                : 'text-gray-500 cursor-pointer hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                        >
                                            <FileText size={16} />
                                            Jen s řešením
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                                        
                                        <button
                                            onClick={() => setViewHidden(!viewHidden)}
                                            className={`w-full cursor-pointer sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                                                viewHidden
                                                ? 'bg-white text-[var(--barva-primarni)] border-[var(--barva-primarni)] hover:bg-gray-100 shadow-md'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {viewHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                                            {viewHidden 
                                                ? 'Zpět na aktivní' 
                                                : `Skryté řešení (${hiddenSubmissions.size})`
                                            }
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="relative min-h-[200px]">
                                    {isLocked && (
                                        <div className="absolute inset-0 z-20 backdrop-blur-sm bg-white/40 flex flex-col items-center justify-center rounded-3xl border border-white/50">
                                            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md border border-gray-100 animate-fade-in-up">
                                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <Lock className="w-8 h-8 text-blue-600" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-3">Řešení jsou uzamčena</h3>
                                                <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                                                    Pro zobrazení řešení a výběr vítěze je nutné složit odměnu, která bude následně vyplacena studentům.
                                                </p>
                                                
                                                <button
                                                    onClick={handleUnlock}
                                                    className="btn-shiny cursor-pointer w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-900/20 hover:-translate-y-1 transition-all flex items-center justify-center"
                                                >
                                                    Složit odměnu <span className="text-blue-200 font-normal text-base ml-2">({totalPrizePool.toLocaleString('cs-CZ')} Kč)</span>
                                                </button>
                                            </div>
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
                                                    onHide={() => toggleSubmissionVisibility(sub.id)}
                                                    isLocked={false} 
                                                    prizeAmount={totalPrizePool} 
                                                    challengeId={challenge.id}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50/50 border border-dashed border-gray-200 p-16 rounded-3xl text-center animate-fade-in">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                {viewHidden ? <EyeOff className="text-gray-400" size={24} /> : <Users className="text-gray-400" size={24} />}
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                {viewHidden 
                                                    ? "Žádné skryté položky" 
                                                    : (filterSubmittedOnly ? "Žádná odevzdaná řešení" : "Zatím žádní zájemci")
                                                }
                                            </h3>
                                            <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                                                {viewHidden
                                                    ? "Zatím jste neskryli žádné řešení."
                                                    : (filterSubmittedOnly 
                                                        ? "Zkuste vypnout filtr 'Jen s řešením' pro zobrazení všech registrovaných." 
                                                        : "Jakmile se někdo přihlásí, uvidíte ho zde.")
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
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
                )
            )}
        </div>
    );
}