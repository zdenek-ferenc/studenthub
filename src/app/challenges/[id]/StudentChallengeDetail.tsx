"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import type { Submission } from './SubmissionCard';
import { Clock, ChevronLeft } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner';

import StudentChallengeRecap from './StudentChallengeRecap';
import SubmissionForm from './SubmissionForm';
import ChallengeAssignmentBox from './ChallengeAssignmentBox';

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

const WaitingForResults = () => (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs mt-8 text-center">
        <Clock className="w-12 h-12 mx-auto text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold text-[var(--barva-tmava)]">Tvoje řešení čeká na vyhodnocení</h2>
        <p className="text-gray-600 mt-2 max-w-lg mx-auto">
            Skvělá práce! Tvoje řešení bylo odevzdáno. Startup ho nyní vyhodnotí. Výsledky se dozvíš, jakmile bude výzva kompletně uzavřena.
        </p>
    </div>
);


export default function StudentChallengeDetail({ challenge }: { challenge: Challenge }) {
  const { user, loading: authLoading, refetchProfile, showToast } = useAuth();
  const router = useRouter();
  
  const [isApplying, setIsApplying] = useState(false);
  const [userSubmission, setUserSubmission] = useState<Submission | undefined>(undefined);
  const [studentSkillIds, setStudentSkillIds] = useState<Set<string>>(new Set());

  const expectedOutputsArray = useMemo(() => {
    return challenge.expected_outputs.split('\n').filter(line => line.trim() !== '');
  }, [challenge.expected_outputs]);

  useEffect(() => {
    if (user) {
        const submission = challenge.Submission.find(sub => sub.student_id === user.id);
        setUserSubmission(submission);

        const fetchStudentSkills = async () => {
            const { data } = await supabase.from('StudentSkill').select('skill_id').eq('student_id', user.id);
            if (data) setStudentSkillIds(new Set(data.map(s => s.skill_id)));
        };
        fetchStudentSkills();
    }
  }, [challenge.Submission, user]);

  if (authLoading) {
    return <LoadingSpinner />;
  }
  
  const isApplied = !!userSubmission;
  const isChallengeFull = challenge.Submission.length >= challenge.max_applicants;
  const showResults = challenge.status === 'closed' || challenge.status === 'archived';
  const isReviewedByStartup = userSubmission && ['reviewed', 'winner', 'rejected'].includes(userSubmission.status);

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

  const assignmentBoxProps = {
    challenge, isApplied, studentSkillIds,
    onApply: handleApply, isApplying, isChallengeFull
  };

  return (
    <div className="p-4 lg:max-w-1/2 mx-auto md:py-24 xl:py-32 md:px-4 space-y-8">
      <button
        onClick={() => router.back()} 
        className="flex items-center gap-1 cursor-pointer text-sm font-semibold text-gray-500 hover:text-[var(--barva-primarni)] transition-colors mb-2"
      >
        <ChevronLeft size={16} />
        Zpět
      </button>
      {showResults && userSubmission && (
        <StudentChallengeRecap 
            submission={userSubmission} 
            challengeStatus={challenge.status} 
        />
      )}
      <ChallengeAssignmentBox {...assignmentBoxProps} />
      {!showResults && isApplied && (
        <>
          {!isReviewedByStartup && userSubmission ? (
            <SubmissionForm 
              challengeId={challenge.id} 
              submissionId={userSubmission.id} 
              initialSubmission={userSubmission}
              expectedOutputs={expectedOutputsArray}
              onSuccess={handleSubmissionUpdate}
            />
          ) : (
            <WaitingForResults />
          )}
        </>
      )}
    </div>
  );
}