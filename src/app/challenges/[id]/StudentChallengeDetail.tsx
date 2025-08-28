"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '../../../contexts/AuthContext'; // Uprav cestu
import { supabase } from '../../../lib/supabaseClient'; // Uprav cestu
import SubmissionForm from './SubmissionForm';
import { useRouter } from 'next/navigation';

// Typ 'Challenge' je teď sjednocený s page.tsx
type Challenge = {
  id: string;
  title: string;
  description: string;
  short_description: string;
  goals: string;
  expected_outputs: string;
  budget_in_cents: number | null;
  reward_description: string | null;
  deadline: string;
  created_at: string;
  max_applicants: number;
  ChallengeSkill: { Skill: { id: string, name: string } }[];
  StartupProfile: { company_name: string, logo_url: string | null } | null;
  Submission: { 
    student_id: string, 
    id: string,
    link: string | null,
    file_url: string | null,
    status: string | null
  }[]; 
};

export default function StudentChallengeDetail({ challenge }: { challenge: Challenge }) {
  // OPRAVA: Z AuthContextu si bereme i funkci pro spolehlivý refresh
  const { user, loading: authLoading, refetchProfile } = useAuth();
  const router = useRouter();
  
  // Lokální stavy používáme pro okamžitou odezvu UI
  const [isApplying, setIsApplying] = useState(false);
  const [localSubmissions, setLocalSubmissions] = useState(challenge.Submission);

  // Odvozujeme stav PŘÍMO z našeho lokálního, spolehlivého stavu.
  const submission = user ? localSubmissions.find(sub => sub.student_id === user.id) : undefined;
  const isApplied = !!submission;
  const submissionId = submission?.id || null;

  const [isDetailsVisible, setIsDetailsVisible] = useState(!isApplied);

  // Tento useEffect synchronizuje lokální stav s daty, která přijdou ze serveru
  useEffect(() => {
    setLocalSubmissions(challenge.Submission);
    setIsDetailsVisible(!challenge.Submission.some(sub => sub.student_id === user?.id));
  }, [challenge.Submission, user]);


  const handleApply = async () => {
    if (isApplying || !user) return;
    
    setIsApplying(true);
    
    const { data: newSubmission, error } = await supabase.from('Submission').insert({
      challenge_id: challenge.id,
      student_id: user.id,
      status: 'applied'
    }).select().single();

    if (error) {
      alert("Došlo k chybě. Zkuste to prosím znovu.");
      console.error(error);
      setIsApplying(false);
    } else {
      alert("Úspěšně jste se přihlásili do výzvy!");
      // OPRAVA: Okamžitě aktualizujeme lokální stav pro okamžitou změnu UI
      setLocalSubmissions(prev => [...prev, newSubmission]);
      // A pro jistotu řekneme AuthContextu, ať si v pozadí načte čerstvá data
      refetchProfile();
    }
    // isApplying se už nemusí resetovat, protože tlačítko zmizí
  };

  const handleSubmissionUpdate = () => {
    // Po odevzdání řešení také spolehlivě obnovíme všechna data
    refetchProfile();
    router.refresh(); // Pro jistotu i refresh stránky
  };

  if (authLoading) {
    return <p className="text-center py-20">Načítání...</p>;
  }

  const isChallengeFull = localSubmissions.length >= challenge.max_applicants;

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <Image 
            src={challenge.StartupProfile?.logo_url || '/logo.svg'} 
            alt="logo firmy" 
            width={80} 
            height={80} 
            className="mx-auto rounded-lg mb-4"
          />
          <p className="font-semibold text-gray-800">{challenge.StartupProfile?.company_name}</p>
          <h1 className="text-4xl font-bold text-[var(--barva-tmava)]">{challenge.title}</h1>
          {isApplied && <p className="text-lg text-gray-500 mt-2">Výzva čeká na odevzdání</p>}
        </div>

        {isApplied && (
            <div className="text-center mb-6">
                <button onClick={() => setIsDetailsVisible(!isDetailsVisible)} className="text-sm text-gray-500 hover:underline">
                    {isDetailsVisible ? 'Skrýt zadání výzvy' : 'Zobrazit zadání výzvy'}
                </button>
            </div>
        )}

        {isDetailsVisible && (
            <>
                <div className="border-t-2 border-b-2 border-[var(--barva-svetle-pozadi)] py-6">
                    <h2 className="text-xl font-semibold text-[var(--barva-tmava)] mb-4">Potřebné dovednosti</h2>
                    <div className="flex flex-wrap gap-2">
                    {challenge.ChallengeSkill.map(({ Skill }) => (
                        <span key={Skill.id} className="px-5 py-1.5 rounded-full text-sm font-semibold bg-[var(--barva-svetle-pozadi)] border-1 border-[var(--barva-primarni)] text-[var(--barva-primarni)]">{Skill.name}</span>
                    ))}
                    </div>
                </div>
                <div className="flex justify-between items-center text-[var(--barva-tmava)] py-4 text-xl font-semibold">
                    <span>Počet přihlášených: <strong>{localSubmissions.length} / {challenge.max_applicants}</strong></span>
                    <span>Odměna: <strong>{challenge.budget_in_cents ? `${challenge.budget_in_cents} Kč` : (challenge.reward_description || 'Nespecifikováno')}</strong></span>
                </div>
                <div className="prose max-w-none mt-6 text-[var(--barva-tmava)]">
                    <p>{challenge.description}</p>
                    <h3 className='font-semibold text-lg mt-3 border-b-2 py-3'>Cíle výzvy</h3>
                    <p className='mt-3'>{challenge.goals}</p>
                    <h3 className='font-semibold text-lg mt-3 border-b-2 py-3'>Co má být odevzdáno:</h3>
                    <p className='mt-3'>{challenge.expected_outputs}</p>
                    <ul>
                    <li className='font-semibold text-xl mt-6'>Termín odevzdání do: <strong className='ml-3 '>{new Date(challenge.deadline).toLocaleDateString('cs-CZ')}</strong></li>
                    </ul>
                </div>
            </>
        )}
        
        {!isApplied && (
            <div className="mt-10 text-center">
                <button onClick={handleApply} disabled={isApplying || isChallengeFull} className="px-7 py-3 text-white bg-[var(--barva-primarni)] rounded-full font-normal text-2xl outline-2 transition-colors duration-200 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {isApplying ? 'Přihlašuji...' : (isChallengeFull ? 'Kapacita naplněna' : 'Přihlásit se k výzvě')}
                </button>
            </div>
        )}
      </div>

      {isApplied && submissionId && (
        <SubmissionForm 
          challengeId={challenge.id} 
          submissionId={submissionId} 
          initialSubmission={submission} 
          onSuccess={handleSubmissionUpdate}
        />
      )}
    </div>
  );
}
