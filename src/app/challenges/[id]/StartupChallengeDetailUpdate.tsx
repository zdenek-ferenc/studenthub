"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import SubmissionCard, { type Submission } from './SubmissionCard';
import FinalSelection from './FinalSelection';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '../../../components/ConfirmationModal';
import ChallengeRecapView from './ChallengeRecapView';
import { useAuth } from '../../../contexts/AuthContext';
import { Lock, Clock, Users, ChevronLeft, Eye, ArrowRight, Sparkles } from 'lucide-react';
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

// Pomocná komponenta pro progress bar
const ProgressBar = ({ progress, colorClass }: { progress: number, colorClass: string }) => (
    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden backdrop-blur-sm">
        <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass} shadow-[0_0_10px_currentColor]`} 
            style={{ width: `${progress}%`, opacity: progress > 0 ? 1 : 0 }}
        ></div>
    </div>
);

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
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8 mb-8">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none"></div>
                
                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                            {reason === 'deadline' ? (
                                <>
                                    <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    Výzva je aktivní
                                </>
                            ) : (
                                "Výzva ukončena"
                            )}
                        </h3>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            {reason === 'deadline' 
                                ? "Studenti stále pracují. Finální výběr vítězů se odemkne až po uplynutí termínu."
                                : "Termín vypršel. Pro vyhlášení vítězů musíte nejprve ohodnotit všechna odevzdaná řešení."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-[#0B1623]/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-gray-400 text-sm font-medium flex items-center gap-2">
                                    <Clock size={16} className="text-blue-400"/> Časový limit
                                </span>
                                <span className={`text-sm font-bold ${isAfterDeadline ? 'text-orange-400' : 'text-white'}`}>
                                    {isAfterDeadline ? 'Uzavřeno' : `${Math.max(0, daysRemaining)} dní zbývá`}
                                </span>
                            </div>
                            <ProgressBar 
                                progress={timeProgress} 
                                colorClass={isAfterDeadline ? 'bg-orange-500' : 'bg-blue-500'} 
                            />
                        </div>

                        <div className="bg-[#0B1623]/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-gray-400 text-sm font-medium flex items-center gap-2">
                                    <Users size={16} className="text-emerald-400"/> Kapacita
                                </span>
                                <span className="text-sm font-bold text-white">
                                    {applicants} <span className="text-gray-500 font-normal">/ {maxApplicants || '∞'}</span>
                                </span>
                            </div>
                            <ProgressBar 
                                progress={capacityProgress} 
                                colorClass="bg-emerald-500" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={`rounded-2xl p-5 border ${reason === 'pending_reviews' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/5'}`}>
                            <h4 className={`font-bold text-lg mb-2 ${reason === 'pending_reviews' ? 'text-amber-400' : 'text-white'}`}>
                                {reason === 'pending_reviews' ? '⚠️ Čeká na hodnocení' : 'Stav hodnocení'}
                            </h4>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="text-2xl font-bold text-white">{ratedCount} <span className="text-gray-500 text-lg font-normal">/ {totalCount}</span></div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Hotovo</div>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                {reason === 'pending_reviews' 
                                    ? "Ohodnoťte všechna řešení pro odemčení výběru." 
                                    : "Průběžně hodnoťte řešení pro ušetření času."}
                            </p>
                        </div>

                        <div className="rounded-2xl p-5 bg-white/5 border border-white/5 flex flex-col justify-between">
                            <div>
                                <h4 className="font-bold text-lg text-white mb-1">Další krok</h4>
                                <p className="text-sm text-gray-400 mb-4">
                                    {!isAfterDeadline 
                                        ? `Výběr vítězů se odemkne ${format(deadlineDate, 'd. M. yyyy')}.`
                                        : "Jakmile bude vše ohodnoceno, tlačítko se aktivuje."}
                                </p>
                            </div>
                            
                            <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-xl bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed">
                                {isLocked && <Lock size={14} />}
                                {isLocked ? 'Zamčeno (čeká na platbu)' : 
                                    (reason === 'pending_reviews' ? 'Dokončete hodnocení' : 'Čeká na deadline')
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-3xl border border-green-500/30 bg-green-500/10 backdrop-blur-xl p-10 text-center animate-fade-in-up mb-8">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-500/20 via-transparent to-transparent"></div>
            
            <div className="relative z-10 max-w-lg mx-auto">
                <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(74,222,128,0.3)]">
                    <Sparkles size={36} />
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-4">Máte hotovo!</h3>
                <p className="text-green-100/80 text-lg mb-8 leading-relaxed">
                    Termín vypršel a všechna řešení byla úspěšně ohodnocena. Nyní můžete vybrat vítěze a uzavřít výzvu.
                </p>
                
                <button
                    onClick={onProceed}
                    disabled={isLocked}
                    className={`
                        group relative w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 mx-auto transition-all duration-300
                        ${isLocked 
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                            : 'btn-shiny bg-green-600 text-white shadow-green-900/30 hover:-translate-y-1 hover:shadow-green-500/40'
                        }
                    `}
                >
                    {isLocked && <Lock size={18} />}
                    {isLocked ? 'Nejdříve odemkněte výhru' : (
                        <>
                            Vybrat vítěze <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                        </>
                    )}
                </button>
            </div>
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

    const hideSubmission = (submissionId: string) => {
        setHiddenSubmissions(prev => {
            const newSet = new Set(prev).add(submissionId);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(getStorageKey(), JSON.stringify(Array.from(newSet)));
            }
            return newSet;
        });
    };

    const showAllSubmissions = () => {
        setHiddenSubmissions(new Set());
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(getStorageKey());
        }
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

    if (loading) return (
        <div className="min-h-screen bg-[#001224] flex items-center justify-center text-white">
            <div className="animate-pulse">Načítám data výzvy...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#001224] text-gray-100 relative overflow-hidden font-sans">
            
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full"></div>
            </div>

            <div className='relative z-10 lg:max-w-6xl mx-auto py-8 md:py-16 px-4 space-y-8'>
                
                <button
                    onClick={() => router.back()}
                    className="group inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors pl-1"
                >
                    <div className="p-1 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                    Zpět na přehled
                </button>
                
                <div className="relative">
                    <StartupChallengeHeader challenge={challenge} />
                </div>

                {setActiveTab && activeTab && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/5">
                        {/* Glass Tabs */}
                        <div className="inline-flex p-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
                            <button 
                                onClick={() => setActiveTab('assignment')} 
                                className={`px-6 py-2.5 text-sm rounded-full font-semibold transition-all duration-300 ${
                                    activeTab === 'assignment' 
                                    ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                Řešení
                            </button>
                            <button 
                                onClick={() => setActiveTab('qna')} 
                                className={`px-6 py-2.5 text-sm rounded-full font-semibold flex items-center gap-2 transition-all duration-300 ${
                                    activeTab === 'qna' 
                                    ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                Dotazy
                                {typeof unansweredCount === 'number' && unansweredCount > 0 && (
                                    <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold rounded-md ${
                                        activeTab === 'qna' ? 'bg-white text-blue-600' : 'bg-blue-500/20 text-blue-300'
                                    }`}>
                                        {unansweredCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                <div className="min-h-[400px]">
                    <SlideTransition show={!!activeTab && activeTab === 'qna'}>
                        <div className="bg-[#0B1623] border border-white/5 rounded-3xl p-6">
                            <ChallengeQnA
                                challengeId={challenge.id}
                                role="startup"
                                visible={!!activeTab && activeTab === 'qna'}
                                onAnswered={() => { if (setUnansweredCount) setUnansweredCount(prev => Math.max(0, prev - 1)); }}
                            />
                        </div>
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
                                        
                                        {hiddenSubmissions.size > 0 && (
                                            <div className="flex justify-center mb-8">
                                                <button
                                                    onClick={showAllSubmissions}
                                                    className="group flex items-center gap-2 px-6 py-3 text-sm font-semibold text-blue-300 cursor-pointer bg-blue-500/10 rounded-full hover:bg-blue-500/20 transition-all border border-blue-500/20 hover:border-blue-400/40"
                                                >
                                                    <Eye size={16} className="group-hover:text-blue-200 transition-colors" />
                                                    Zobrazit skrytá řešení ({hiddenSubmissions.size})
                                                </button>
                                            </div>
                                        )}
                                        
                                        <div className="relative min-h-[200px]">
                                            {isLocked && (
                                                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center">
                                                    <div className="absolute inset-0 bg-[#001224]/60 backdrop-blur-md rounded-3xl z-0"></div>
                                                    
                                                    <div className="relative z-10 bg-[#0B1D35] border border-white/10 p-10 rounded-3xl shadow-2xl text-center max-w-lg mx-4 animate-fade-in-up">
                                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                                                            <Lock className="w-8 h-8 text-blue-400" />
                                                        </div>
                                                        <h3 className="text-2xl font-bold text-white mb-3">Řešení jsou uzamčena</h3>
                                                        <p className="text-gray-400 mb-8 text-base leading-relaxed">
                                                            Pro zobrazení řešení a výběr vítěze je nutné složit odměnu do úschovy. Peníze budou vyplaceny studentům až po finálním schválení.
                                                        </p>
                                                        
                                                        <button
                                                            onClick={handleUnlock}
                                                            className="btn-shiny w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center"
                                                        >
                                                            Složit odměnu <span className="text-blue-200 font-normal text-base ml-2">({totalPrizePool.toLocaleString('cs-CZ')} Kč)</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {displayedSubmissions.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {displayedSubmissions.map(sub => (
                                                        <div key={sub.id} className="relative group">
                                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[22px] opacity-0 group-hover:opacity-30 blur transition duration-500"></div>
                                                            <SubmissionCard
                                                                submission={sub}
                                                                onUpdate={handleSubmissionUpdate}
                                                                anonymousId={sub.anonymousId}
                                                                onHide={hideSubmission}
                                                                isLocked={false} 
                                                                prizeAmount={totalPrizePool} 
                                                                challengeId={challenge.id}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="bg-white/5 border border-dashed border-white/10 p-16 rounded-3xl text-center">
                                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                                        <Users className="text-gray-500" size={32}/>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-white">
                                                        {submissions.length > 0 ? "Všechna řešení jsou skryta" : "Zatím žádná řešení"}
                                                    </h3>
                                                    <p className="mt-3 text-gray-400 max-w-sm mx-auto">
                                                        {submissions.length > 0 ? "Pro jejich zobrazení klikněte na tlačítko 'Zobrazit skrytá řešení' výše." : "Jakmile studenti začnou odevzdávat svá řešení, uvidíte je zde."}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {view === 'selecting_winners' && (
                                    <div className="bg-[#0B1623] border border-white/5 rounded-3xl p-6">
                                        <FinalSelection
                                            submissions={anonymousSubmissions.filter(s => s.status === 'reviewed')}
                                            challenge={challenge}
                                            onFinalize={prepareToFinalize}
                                            onBack={() => setView('evaluating')}
                                        />
                                    </div>
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
            </div>
        </div>
    );
}