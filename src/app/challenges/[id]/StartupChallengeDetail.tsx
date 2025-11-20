"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import SubmissionCard, { type Submission } from './SubmissionCard';
import FinalSelection from './FinalSelection';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '../../../components/ConfirmationModal';
import ChallengeRecapView from './ChallengeRecapView';
import { useAuth } from '../../../contexts/AuthContext';
import { AlertCircle, CheckCircle, Lock, Clock, Users, ChevronLeft, Eye } from 'lucide-react';
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
    prize_pool_paid: boolean; 
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
    isLocked
}: {
    canFinalize: boolean,
    ratedCount: number,
    totalCount: number,
    onProceed: () => void,
    deadline: string,
    applicants: number,
    maxApplicants: number | null,
    createdAt: string,
    isLocked: boolean
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
                                <span className="text-gray-600 flex items-center gap-2"><Clock size={14} /> Průběh výzvy</span>
                                <span className="text-[var(--barva-tmava)]">{daysRemaining > 0 ? `Zbývá ${daysRemaining} dní` : 'Po termínu'}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${timeProgress}%` }}></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1 font-semibold text-sm">
                                <span className="text-gray-600 flex items-center gap-2"><Users size={14} /> Naplněnost</span>
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
                                {isLocked ? <Lock size={14} /> : null}
                                {isLocked ? ' Vybrat vítěze (zamčeno)' : ' Vybrat vítěze (čekáme na dokončení)'}
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
                        <button
                            onClick={onProceed}
                            disabled={isLocked}
                            className={`mt-6 px-8 py-3 rounded-full font-semibold shadow-md transition-all ${isLocked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[var(--barva-primarni)] text-white hover:bg-blue-700'}`}
                        >
                            {isLocked ? 'Nejdříve odemkněte výhru' : 'Přejít k výběru vítězů'}
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
                                <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${totalCount > 0 ? (ratedCount / totalCount) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    </>
                )}
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
        return hasFinancialReward && !challenge.prize_pool_paid;
    }, [totalPrizePool, challenge.prize_pool_paid]);


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

                        {setActiveTab && activeTab && (
                            <div className="flex items-center gap-3 w-fit mb-4 bg-white p-2 rounded-full shadow-sm">
                                <button onClick={() => setActiveTab('assignment')} className={`px-4 text-sm py-2 rounded-full font-semibold ${activeTab === 'assignment' ? 'bg-[var(--barva-primarni)] text-white' : 'hover:bg-gray-100/50 transition-all ease-in-out duration-200 cursor-pointer text-[var(--barva-tmava)]'}`}>
                                    Řešení
                                </button>
                                <button onClick={() => setActiveTab('qna')} className={`px-4 py-2 text-sm rounded-full font-semibold flex items-center gap-2 ${activeTab === 'qna' ? 'bg-[var(--barva-primarni)] text-white' : 'hover:bg-gray-100/50 transition-all ease-in-out duration-200 cursor-pointer text-[var(--barva-tmava)]'}`}>
                                    Dotazy
                                    {typeof unansweredCount === 'number' && unansweredCount > 0 ? (
                                        <span className="inline-flex items-center justify-center border-2 border-[var(--barva-primarni)] px-2 py-0.5 text-xs font-medium rounded-full bg-white text-[var(--barva-tmava)]">{unansweredCount}</span>
                                    ) : null}
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
                                                totalCount={submissions.length}
                                                onProceed={() => setView('selecting_winners')}
                                                deadline={challenge.deadline}
                                                applicants={challenge.Submission.length}
                                                maxApplicants={challenge.max_applicants}
                                                createdAt={challenge.created_at}
                                                isLocked={isLocked}
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
                                            
                                            <div className="relative min-h-[200px]">
                                                {isLocked && (
                                                    <div className="absolute inset-0 z-20 backdrop-blur-xs bg-white/30 flex flex-col items-center justify-center rounded-2xl border border-white/40">
                                                        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md border border-white/50">
                                                            <Lock className="w-12 h-12 text-[var(--barva-primarni)] mx-auto mb-4 opacity-80" />
                                                            <h3 className="text-xl font-bold text-[var(--barva-tmava)] mb-2">Řešení jsou uzamčena</h3>
                                                            <p className="text-gray-600 mb-6 text-sm">
                                                                Pro zobrazení řešení a výběr vítěze je nutné složit odměnu, která bude následně vyplacena studentům.
                                                            </p>
                                                            <button
                                                                onClick={handleUnlock}
                                                                className="px-6 py-3 rounded-full bg-[var(--barva-primarni)] text-white font-bold shadow-lg hover:bg-[var(--barva-primarni)]/90 transition-all ease-in-out duration-200 cursor-pointer"
                                                            >
                                                                Složit odměnu ({totalPrizePool.toLocaleString('cs-CZ')} Kč)
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
                                                                onHide={hideSubmission}
                                                                isLocked={false} 
                                                                prizeAmount={totalPrizePool} 
                                                                challengeId={challenge.id}
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