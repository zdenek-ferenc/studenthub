"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient'; // Uprav cestu
import SubmissionCard, { type Submission } from './SubmissionCard'; // Importujeme kartu i její typ
import ChallengeDetailBox from './ChallengeDetailBox'; // Náš nový import

// Typ pro data o výzvě, která potřebujeme na této stránce
type Challenge = {
  id: string;
  title: string;
  description: string;
  goals: string;
  expected_outputs: string;
  budget_in_cents: number | null;
  max_applicants: number | null;
  Submission: { id: string }[];
  ChallengeSkill: { Skill: { id: string, name: string } }[];
};

export default function StartupChallengeDetail({ challenge }: { challenge: Challenge }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Vytvořili jsme znovupoužitelnou funkci pro načítání přihlášek
  const fetchSubmissions = useCallback(async () => {
    const { data, error } = await supabase
      .from('Submission')
      .select(`
        id, status, link, file_url, rating, position, feedback_comment,
        StudentProfile ( * )
      `)
      .eq('challenge_id', challenge.id);

    if (error) {
      console.error("Chyba při načítání přihlášek:", error);
    } else {
      setSubmissions(data as unknown as Submission[]);
    }
    setLoading(false);
  }, [challenge.id]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  if (loading) {
    return <p className="text-center py-20">Načítám přihlášky...</p>;
  }

  return (
    <div className="container mx-auto py-12 space-y-8">
      {/* Použijeme naši novou, samostatnou komponentu pro zadání */}
      <ChallengeDetailBox challenge={challenge} />

      {/* Samostatná sekce pro přihlášené studenty */}
      <div>
        <h2 className="text-2xl font-semibold text-[var(--barva-tmava)] mb-4">Přihlášení studenti ({submissions.length})</h2>
        {submissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map(submission => (
              <SubmissionCard 
                key={submission.id} 
                submission={submission} 
                onSuccess={fetchSubmissions} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-500">
            Zatím se nikdo nepřihlásil.
          </div>
        )}
      </div>
    </div>
  );
}
