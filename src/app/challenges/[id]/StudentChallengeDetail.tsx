"use client";

import { useState, useEffect, useMemo, Dispatch, SetStateAction } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import type { Submission } from './SubmissionCard';
import { Clock, ChevronLeft } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Tooltip from '../../../components/Tooltip';

import StudentChallengeRecap from './StudentChallengeRecap';
import SubmissionForm from './SubmissionForm';
import ChallengeAssignmentBox from './ChallengeAssignmentBox';
import ChallengeQnA from './components/ChallengeQnA';
import { useChallenges } from '../../../contexts/ChallengesContext';
import { useDashboard } from '../../../contexts/DashboardContext';

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
  <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs text-center">
    <Clock className="w-12 h-12 mx-auto text-blue-500 mb-4" />
    <h2 className="text-2xl font-bold text-[var(--barva-tmava)]">Tvoje řešení čeká na vyhodnocení</h2>
    <p className="text-gray-600 mt-2 max-w-lg mx-auto">
      Skvělá práce! Tvoje řešení bylo odevzdáno. Startup ho nyní vyhodnotí. Výsledky se dozvíš, jakmile bude výzva kompletně uzavřena.
    </p>
  </div>
);


export default function StudentChallengeDetail({ challenge, applicantCount, activeTab, setActiveTab }: { challenge: Challenge, applicantCount: number | null, activeTab?: 'assignment' | 'qna', setActiveTab?: Dispatch<SetStateAction<'assignment'|'qna'>> }) {
  const { user, loading: authLoading, showToast } = useAuth();
  const router = useRouter();
  const { refetchChallenges } = useChallenges();
  const { refetchDashboardData } = useDashboard();

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
  const isChallengeFull = challenge.max_applicants ? (applicantCount ?? challenge.Submission.length) >= challenge.max_applicants : false;
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
      refetchChallenges();
      refetchDashboardData();
    }
    setIsApplying(false);
  };

  const handleSubmissionUpdate = (updatedSubmission: Submission) => {
    setUserSubmission(updatedSubmission);
    refetchChallenges();
    refetchDashboardData();
    router.refresh();
  };

  const assignmentBoxProps = {
    challenge, isApplied, studentSkillIds,
    onApply: handleApply, isApplying, isChallengeFull, applicantCount
  };

  const effectiveTab = user ? ((activeTab === 'qna' && !isApplied) ? 'assignment' : (activeTab || 'assignment')) : 'assignment';

  return (
    <div className="p-4 lg:max-w-4/5 2xl:max-w-4/6 mx-auto md:py-24 xl:py-32 md:px-4 space-y-4 sm:space-y-4">
      <div className="flex justify-between md:items-end gap-2">
        <button
        onClick={() => router.back()}
        className="flex items-center gap-1 cursor-pointer text-sm font-semibold text-gray-500 hover:text-[var(--barva-primarni)] transition-colors"
      >
        <ChevronLeft size={16} />
        Zpět
      </button>

      {setActiveTab && user && (
        <div className="flex items-center gap-3 w-fit bg-white p-1 sm:p-2 rounded-full shadow-sm">
          <button onClick={() => setActiveTab('assignment')} className={`px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-full font-semibold ${activeTab === 'assignment' ? 'bg-[var(--barva-primarni)] text-white' : 'hover:bg-gray-100/50 transition-all ease-in-out duration-200 cursor-pointer text-[var(--barva-tmava)]'}`}>
            Zadání
          </button>
          {(() => {
            const qnaDisabled = !isApplied;
            const qnaButton = (
              <button
                onClick={() => { if (!qnaDisabled) setActiveTab('qna'); }}
                aria-disabled={qnaDisabled}
                className={`px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-full font-semibold flex items-center gap-2 ${activeTab === 'qna' ? 'bg-[var(--barva-primarni)] text-white' : (qnaDisabled ? 'opacity-50 cursor-not-allowed text-gray-400' : 'hover:bg-gray-100/50 transition-all ease-in-out duration-200 cursor-pointer text-[var(--barva-tmava)]')}`}>
                Dotazy
              </button>
            );
            return qnaDisabled ? (
              <Tooltip content="Musíš se přihlásit k výzvě, abys viděl dotazy">{qnaButton}</Tooltip>
            ) : qnaButton;
          })()}
        </div>
      )}
      </div>
      

      {(effectiveTab === 'assignment') ? (
        <>
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
        </>
      ) : (
        <ChallengeQnA challengeId={challenge.id} role="student" />
      )}
    </div>
  );
}