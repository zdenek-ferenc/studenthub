"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import SubmissionCard, { type Submission } from './SubmissionCard';
import ChallengeDetailBox from './ChallengeDetailBox';
import WinnerSelection from './WinnerSelection';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '../../../components/ConfirmationModal';
import ChallengeRecapView from './ChallengeRecapView';
import { useAuth } from '../../../contexts/AuthContext';

// PŘIDÁME NOVÝ TYP PRO ROZŠÍŘENÉ ŘEŠENÍ
type AnonymousSubmission = Submission & { anonymousId: string };

// ... (zbytek souboru až po definici komponenty)
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
  max_applicants: number | null;
  Submission: { id: string }[];
  ChallengeSkill: { Skill: { id: string, name: string } }[];
  StartupProfile: { company_name: string, logo_url: string | null } | null;
};

const EvaluationGuide = ({ total, rated, allRated }: { total: number, rated: number, allRated: boolean }): React.JSX.Element => {
    const progress = total > 0 ? Math.round((rated / total) * 100) : 0;

    const title = allRated ? "Hodnocení dokončeno!" : "Proces hodnocení";
    const text = allRated
        ? "Skvělá práce! Nyní můžete přejít k finálnímu výběru vítězů z vašich označených favoritů."
        : "Projděte všechna řešení níže. Každému udělte hodnocení, napište zpětnou vazbu a ty nejlepší označte hvězdičkou ⭐ pro postup do užšího výběru.";

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xs text-center">
            <h3 className="text-2xl font-bold text-[var(--barva-tmava)]">
                {title}
            </h3>
            <p className="text-gray-600 mt-2 max-w-3xl mx-auto text-lg">
                {text}
            </p>
            {!allRated && total > 0 && (
                <div className="mt-5 max-w-md mx-auto">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-base font-medium text-[var(--barva-primarni)]">Postup hodnocení</span>
                        <span className="text-sm font-medium text-[var(--barva-primarni)]">{rated} z {total} hotovo</span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-4">
                        <div className="bg-blue-500 h-4 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default function StartupChallengeDetail({ challenge }: { challenge: Challenge }) {
  // ZMĚNA ZDE: Stav bude nyní pro AnonymousSubmission
  const [submissions, setSubmissions] = useState<AnonymousSubmission[]>([]);
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
      // ZMĚNA ZDE: Přidáme anonymní ID ke každému řešení
      const anonymizedData = (data as Submission[]).map((sub, index) => ({
        ...sub,
        anonymousId: `Řešení #${index + 1}`
      }));
      setSubmissions(anonymizedData);
    }
    setLoading(false);
  }, [challenge.id]);

  useEffect(() => {
    fetchInitialSubmissions();
  }, [fetchInitialSubmissions]);

  const handleSubmissionUpdate = (updatedSubmission: Submission) => {
    setSubmissions(currentSubmissions =>
        currentSubmissions.map(sub =>
            sub.id === updatedSubmission.id 
              ? { ...sub, ...updatedSubmission } // Zachováme anonymousId
              : sub
        )
    );
  };

  const { ratedCount, allRated, favoriteSubmissions } = useMemo(() => {
    const rated = submissions.filter(s => s.rating !== null && s.feedback_comment && s.feedback_comment.trim() !== '');
    const favorites = submissions.filter(s => s.is_favorite);
    return {
        ratedCount: rated.length,
        allRated: rated.length === submissions.length && submissions.length > 0,
        favoriteSubmissions: favorites,
    };
  }, [submissions]);
  
  // ... (zbytek logiky až po render)
  const prepareToFinalize = (winners: { [key: number]: string }) => {
      setWinnersToConfirm(winners);
      setIsModalOpen(true);
  };

  const handleFinalizeChallenge = async () => {
    if (!winnersToConfirm) return;
    
    const updates = Object.entries(winnersToConfirm).map(([place, submissionId]) => {
        return supabase
            .from('Submission')
            .update({ position: parseInt(place), status: 'winner' })
            .eq('id', submissionId);
    });

    await Promise.all(updates);

    const { error: challengeError } = await supabase
        .from('Challenge')
        .update({ status: 'closed' })
        .eq('id', challenge.id);

    if (challengeError) {
      showToast(`Chyba při uzavírání výzvy: ${challengeError.message}`, 'error');
    } else {
      showToast('Výsledky byly úspěšně vyhlášeny!', 'success');
      router.push('/profile');
    }
    
    setIsModalOpen(false);
  };

  if (loading) {
    return <p className="text-center py-20">Načítám přihlášky...</p>;
  }


  return (
    <div className="container mx-auto py-12 space-y-8">
      <ChallengeDetailBox challenge={challenge} />

      {challenge.status === 'closed' ? (
        // Zde předáváme původní data, recap už není anonymní
        <ChallengeRecapView submissions={submissions} />
      ) : (
        <>
            {submissions.length > 0 && (
                <EvaluationGuide
                    total={submissions.length}
                    rated={ratedCount}
                    allRated={allRated}
                />
            )}
            
            {allRated && view === 'evaluating' && (
                <div className="text-center">
                    <button
                        onClick={() => setView('selecting_winners')}
                        disabled={favoriteSubmissions.length === 0}
                        className="cursor-pointer px-8 py-4 rounded-full bg-[var(--barva-primarni)] text-white font-bold text-lg shadow-lg hover:shadow-none transition-transform disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {favoriteSubmissions.length > 0 ? `Přejít k výběru vítězů (${favoriteSubmissions.length})` : "Označte alespoň jednoho favorita"}
                    </button>
                </div>
            )}

            <div className="mt-4">
                {view === 'selecting_winners' ? (
                    <div>
                        <h2 className="text-3xl font-bold text-center text-[var(--barva-tmava)] mb-4">Finální výběr</h2>
                        <p className="text-center text-gray-600 text-lg mb-8">Přetáhněte favority na příslušné pozice a dokončete výzvu.</p>
                        <WinnerSelection
                            favorites={favoriteSubmissions}
                            challenge={challenge}
                            onFinalize={prepareToFinalize}
                        />
                        <div className="text-center">
                            <button onClick={() => setView('evaluating')} className="mt-6 text-sm text-gray-500 hover:underline">
                                Zpět na hodnocení
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        {submissions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {submissions.map(submission => (
                                <SubmissionCard
                                    key={submission.id}
                                    submission={submission}
                                    onUpdate={handleSubmissionUpdate}
                                    // ZMĚNA ZDE: Předáváme anonymní ID
                                    anonymousId={submission.anonymousId}
                                />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-12 rounded-2xl text-center text-gray-500">
                                <h3 className="text-xl font-bold text-[var(--barva-primarni)]">Čekáme na první řešení</h3>
                                <p className="mt-2">Jakmile studenti začnou odevzdávat svá řešení, uvidíte je zde.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
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