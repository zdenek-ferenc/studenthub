"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import SubmissionCard, { type Submission } from './SubmissionCard';
import ChallengeDetailBox from './ChallengeDetailBox';
import FinalSelection from './FinalSelection';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '../../../components/ConfirmationModal';
import ChallengeRecapView from './ChallengeRecapView';
import { useAuth } from '../../../contexts/AuthContext';
import { AlertCircle, CheckCircle, Lock } from 'lucide-react';

type Challenge = {
  id: string; status: 'draft' | 'open' | 'closed' | 'archived'; title: string;
  description: string; goals: string; expected_outputs: string;
  reward_first_place: number | null; reward_second_place: number | null; reward_third_place: number | null;
  max_applicants: number | null; deadline: string;
  Submission: { id: string, student_id: string }[];
  ChallengeSkill: { Skill: { id: string, name: string } }[];
  StartupProfile: { company_name: string, logo_url: string | null } | null;
};

// Nová komponenta pro stavový panel
const EvaluationStatusPanel = ({ canFinalize, ratedCount, totalCount, onProceed }: { canFinalize: boolean, ratedCount: number, totalCount: number, onProceed: () => void }) => {
    const allRated = ratedCount === totalCount && totalCount > 0;

    if (!canFinalize) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                <Lock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-xl font-bold text-[var(--barva-tmava)]">Výběr vítězů bude dostupný po uzávěrce</h3>
                <p className="text-gray-500 mt-2">Jakmile uplyne termín odevzdání nebo se naplní kapacita, budete moci vybrat vítěze.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
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


export default function StartupChallengeDetail({ challenge }: { challenge: Challenge }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'evaluating' | 'selecting_winners'>('evaluating');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [winnersToConfirm, setWinnersToConfirm] = useState<{ [key: number]: string } | null>(null);
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

  const handleSubmissionUpdate = (updatedSubmission: Submission) => {
    setSubmissions(current => current.map(s => s.id === updatedSubmission.id ? updatedSubmission : s));
  };
  
  // OPRAVA: Všechny hooky jsou nyní před jakýmkoliv podmíněným returnem
  const { canFinalize, ratedCount } = useMemo(() => {
    const isAfterDeadline = new Date() > new Date(challenge.deadline);
    const isFull = challenge.Submission.length >= (challenge.max_applicants || Infinity);
    const rated = submissions.filter(s => s.status === 'reviewed' || s.status === 'winner' || s.status === 'rejected');
    return {
        canFinalize: isAfterDeadline || isFull,
        ratedCount: rated.length,
    };
  }, [challenge, submissions]);
  
  const anonymousSubmissions = useMemo(() => 
    submissions.map((sub, index) => ({...sub, anonymousId: `Řešení #${index + 1}`})
  ), [submissions]);

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
    if (error) showToast(`Chyba: ${error.message}`, 'error');
    else {
      showToast('Výsledky byly úspěšně vyhlášeny!', 'success');
      router.push('/profile');
    }
    setIsModalOpen(false);
  };

  if (loading) return <p className="text-center py-20">Načítám přihlášky...</p>;

  return (
    <div className="container mx-auto py-12 space-y-8">
      <ChallengeDetailBox challenge={challenge} />

      {challenge.status === 'closed' ? (
        <ChallengeRecapView submissions={submissions} />
      ) : (
        <>
            {view === 'evaluating' && (
                <>
                    <EvaluationStatusPanel canFinalize={canFinalize} ratedCount={ratedCount} totalCount={submissions.length} onProceed={() => setView('selecting_winners')} />
                    
                    {submissions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {anonymousSubmissions.map(sub => (
                            <SubmissionCard key={sub.id} submission={sub} onUpdate={handleSubmissionUpdate} anonymousId={sub.anonymousId} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-2xl text-center text-gray-500">
                            <h3 className="text-xl font-bold text-[var(--barva-primarni)]">Čekáme na první řešení</h3>
                            <p className="mt-2">Jakmile studenti začnou odevzdávat svá řešení, uvidíte je zde.</p>
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

