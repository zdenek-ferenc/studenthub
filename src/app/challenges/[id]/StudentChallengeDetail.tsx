"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import SubmissionForm from './SubmissionForm';
import { useRouter } from 'next/navigation';
import StudentChallengeRecap from './StudentChallengeRecap';
import type { Submission } from './SubmissionCard';
import { Download, Lock } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner';

type Challenge = {
  id: string;
  status: 'draft' | 'open' | 'closed' | 'archived';
  title: string;
  description: string;
  short_description: string;
  goals: string;
  expected_outputs: string;
  reward_first_place: number | null;
  reward_second_place: number | null;
  reward_third_place: number | null;
  reward_description: string | null;
  attachments_urls: string[] | null;
  deadline: string;
  created_at: string;
  max_applicants: number;
  ChallengeSkill: { Skill: { id: string, name: string } }[];
  StartupProfile: { company_name: string, logo_url: string | null } | null;
  Submission: Submission[];
};

const getFileNameFromUrl = (url: string) => {
    try {
        const urlParts = url.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        const name = lastPart.split('-').slice(1).join('-');
        return decodeURIComponent(name);
    } catch (error) {
        console.error("Chyba při parsování názvu souboru z URL:", error);
        return 'Stáhnout soubor';
    }
};

const RewardsDisplay = ({ challenge }: { challenge: Challenge }) => {
    const rewards = [
      { place: '1. místo', amount: challenge.reward_first_place },
      { place: '2. místo', amount: challenge.reward_second_place },
      { place: '3. místo', amount: challenge.reward_third_place },
    ].filter(r => r.amount);

    if (rewards.length === 0) {
      return <>{challenge.reward_description || 'Nefinanční'}</>;
    }

    if (rewards.length === 1 && rewards[0].amount) {
        return <>{rewards[0].amount.toLocaleString('cs-CZ')} Kč</>
    }
    
    return (
      <div className="flex items-baseline gap-4">
        {rewards.map(({ place, amount }) => (
          <div key={place} className="text-center">
             <span className="text-sm font-semibold text-gray-400 block">{place}</span>
             <span className="font-bold text-lg sm:text-xl">{amount?.toLocaleString('cs-CZ')} Kč</span>
          </div>
        ))}
      </div>
    );
};

export default function StudentChallengeDetail({ challenge }: { challenge: Challenge }) {
  const { user, loading: authLoading, refetchProfile, showToast } = useAuth();
  const router = useRouter();
  
  const [isApplying, setIsApplying] = useState(false);
  const [userSubmission, setUserSubmission] = useState<Submission | undefined>(undefined);

  const expectedOutputsArray = useMemo(() => {
    return challenge.expected_outputs.split('\n').filter(line => line.trim() !== '');
  }, [challenge.expected_outputs]);
  
  useEffect(() => {
    if (user && challenge.Submission) {
        const submission = challenge.Submission.find(sub => sub.student_id === user.id);
        setUserSubmission(submission);
    }
  }, [challenge.Submission, user]);

  const handleApply = async () => {
    if (isApplying || !user) return;
    setIsApplying(true);
    const { data: newSubmission, error } = await supabase.from('Submission').insert({
      challenge_id: challenge.id,
      student_id: user.id,
      status: 'applied'
    }).select('*, StudentProfile(*)').single();

    if (error) {
      showToast(`Došlo k chybě: ${error.message}`, 'error');
    } else {
      showToast("Úspěšně jste se přihlásili do výzvy!", 'success');
      setUserSubmission(newSubmission as Submission);
      refetchProfile();
    }
    setIsApplying(false);
  };

  const handleSubmissionUpdate = (updatedSubmission: Submission) => {
    setUserSubmission(updatedSubmission);
    router.refresh();
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }
  
  const isApplied = !!userSubmission;
  const isChallengeFull = challenge.Submission.length >= challenge.max_applicants;
  const isGraded = userSubmission && ['reviewed', 'winner', 'rejected'].includes(userSubmission.status);
  
  return (
    <div className="max-w-4xl mx-auto md:my-4 px-4">
      <div className="bg-white p-6 sm:p-8 md:p-12 rounded-2xl shadow-xs">
        <div className="text-center mb-8">
            <Image 
                src={challenge.StartupProfile?.logo_url || '/logo.svg'} 
                alt="logo firmy" 
                width={80} 
                height={80} 
                className="mx-auto rounded-lg mb-4 w-16 h-16 sm:w-20 sm:h-20"
            />
            <p className="font-semibold text-gray-800">{challenge.StartupProfile?.company_name}</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--barva-tmava)]">{challenge.title}</h1>
        </div>

        <>
            <div className="border-t border-b border-gray-100 py-6">
                <h2 className="text-lg sm:text-xl font-semibold text-[var(--barva-tmava)] mb-4">Potřebné dovednosti</h2>
                <div className="flex flex-wrap gap-2">
                {challenge.ChallengeSkill.map(({ Skill }) => (
                    <span key={Skill.id} className="px-2 py-1 sm:px-4 sm:py-2 rounded-full bg-[var(--barva-svetle-pozadi)] border border-[var(--barva-primarni)] text-sm sm:text-base text-[var(--barva-primarni)] md:font-semibold">{Skill.name}</span>
                ))}
                </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center text-[var(--barva-tmava)] py-4 text-base sm:text-lg font-semibold gap-4">
                <span>Přihlášeno: <strong>{challenge.Submission.length} / {challenge.max_applicants}</strong></span>
                <span className='flex flex-col items-center gap-1 sm:gap-2 justify-between'>Odměna: <strong><RewardsDisplay challenge={challenge} /></strong></span>
            </div>
            <div className="prose max-w-none text-[var(--barva-tmava)] prose-headings:font-semibold prose-h3:text-lg prose-h3:mt-3 prose-h3:border-b-2 prose-h3:pb-2">
                <p>{challenge.description}</p>
                <h3 className='text-xl md:text-2xl py-4 font-bold'>Cíle výzvy:</h3>
                <p>{challenge.goals}</p>
                <h3 className='text-xl md:text-2xl py-4 font-bold'>Co má být odevzdáno:</h3>
                <ul className='mt-3 list-disc pl-8 space-y-2'>
                  {expectedOutputsArray.map((output, index) => (
                    <li key={index}>{output}</li>
                  ))}
                </ul>
                
                {challenge.attachments_urls && challenge.attachments_urls.length > 0 && (
                    <>
                        <h3>Podklady ke stažení</h3>
                        <div className="mt-4 space-y-3">
                            {challenge.attachments_urls.map((url, index) => (
                                isApplied ? (
                                    <a
                                        key={index}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download
                                        className="flex items-center gap-3 w-full sm:w-auto sm:inline-flex p-3 text-[var(--barva-primarni)] rounded-lg font-semibold hover:bg-blue-100 transition-colors"
                                    >
                                        <Download size={20} />
                                        <span>{getFileNameFromUrl(url)}</span>
                                    </a>
                                ) : (
                                    <div 
                                        key={index}
                                        className="group relative flex items-center gap-3 w-full sm:w-auto sm:inline-flex p-3 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                                    >
                                        <Lock size={20} />
                                        <span>{getFileNameFromUrl(url)}</span>
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            Pro stažení se přihlaste k výzvě
                                        </span>
                                    </div>
                                )
                            ))}
                        </div>
                    </>
                )}
                
                <p className='font-semibold text-lg sm:text-xl mt-6'>Termín odevzdání do: <strong className='ml-3'>{new Date(challenge.deadline).toLocaleDateString('cs-CZ')}</strong></p>
            </div>
        </>
        
        {!isApplied && (
            <div className="mt-10 text-center">
                <button onClick={handleApply} disabled={isApplying || isChallengeFull} className="px-6 py-3 sm:px-7 sm:py-3 text-white bg-[var(--barva-primarni)] rounded-full font-normal text-xl sm:text-2xl outline-2 transition-colors duration-200 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {isApplying ? 'Přihlašuji...' : (isChallengeFull ? 'Kapacita naplněna' : 'Přihlásit se k výzvě')}
                </button>
            </div>
        )}
      </div>

      {isApplied && !isGraded && userSubmission && (
        <SubmissionForm 
          challengeId={challenge.id} 
          submissionId={userSubmission.id} 
          initialSubmission={userSubmission}
          expectedOutputs={expectedOutputsArray}
          onSuccess={handleSubmissionUpdate}
        />
      )}

      {isGraded && userSubmission && (
        <StudentChallengeRecap 
            submission={userSubmission} 
            challengeStatus={challenge.status} 
        />
      )}
    </div>
  );
}