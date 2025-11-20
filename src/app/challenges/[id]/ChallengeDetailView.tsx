"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import LoadingSpinner from '../../../components/LoadingSpinner'
import StudentChallengeDetail from './StudentChallengeDetail';
import StartupChallengeDetail from './StartupChallengeDetail';
import type { Submission } from './SubmissionCard';

type Challenge = {
  id: string;
  status: 'draft' | 'open' | 'closed' | 'archived';
  startup_id: string;
  title: string;
  description: string;
  short_description: string;
  goals: string;
  expected_outputs: string;
  reward_first_place: number | null;
  reward_second_place: number | null;
  reward_third_place: number | null;
  reward_description: string | null;
  prize_pool_paid: boolean;
  attachments_urls: string[] | null;
  deadline: string;
  created_at: string;
  max_applicants: number;
  number_of_winners: number | null;
  ChallengeSkill: { Skill: { id: string, name: string } }[];
  StartupProfile: { company_name: string, logo_url: string | null } | null;
  Submission: Submission[];
};

type RawChallengeData = Omit<Challenge, 'ChallengeSkill'> & {
  ChallengeSkill: { Skill: { id: string, name: string } }[];
};


function CreateChallengeView() {
  const { profile, loading: authLoading } = useAuth();
  const params = useParams();
  const challengeId = params.id as string;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [applicantCount, setApplicantCount] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'assignment' | 'qna'>('assignment');
  const [unansweredCount, setUnansweredCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!challengeId) return;

    const fetchChallenge = async () => {
      const { data, error } = await supabase
        .from('Challenge')
        .select(`
          *,
          created_at,
          ChallengeSkill ( Skill ( * ) ),
          StartupProfile ( * ),
          Submission ( *, StudentProfile ( * ) )
        `)
        .eq('id', challengeId)
        .single();

      // Fetch applicant count for guests/students (bypassing RLS on Submission table)
      const { data: countData } = await supabase
        .rpc('get_challenge_applicant_count', { challenge_id: challengeId });

      if (countData !== null) {
        setApplicantCount(countData);
      }

      if (error) {
        console.error("Chyba při načítání detailu výzvy:", error);
      } else if (data) {
        const rawData = data as RawChallengeData;
        const cleanedData: Challenge = {
          ...rawData,
          ChallengeSkill: (rawData.ChallengeSkill || []).map(cs => ({
            Skill: Array.isArray(cs.Skill) ? cs.Skill[0] : cs.Skill
          })).filter(cs => cs.Skill),
        };

        setChallenge(cleanedData);
      }
      setLoading(false);
    };

    fetchChallenge();
  }, [challengeId]);

  useEffect(() => {
    if (!challengeId) return;
    const fetchUnanswered = async () => {
      const { error, count } = await supabase
        .from('ChallengeQuestion')
        .select('*', { count: 'exact', head: true })
        .eq('challenge_id', challengeId)
        .is('answer_text', null);

      if (!error) {
        setUnansweredCount(count || 0);
      }
    };

    fetchUnanswered();
  }, [challengeId]);

  if (authLoading || loading) {
    return <div className='pt-12 lg:pt-28 3xl:pt-34'><LoadingSpinner /></div>
  }

  if (!challenge) {
    return <p className="text-center py-20">Výzva nebyla nalezena.</p>;
  }

  // Allow public access (guests treated as students for view purposes)
  if (!profile || profile.role === 'student') {
    return <StudentChallengeDetail challenge={challenge} applicantCount={applicantCount} activeTab={activeTab} setActiveTab={setActiveTab} />;
  }

  if (profile.role === 'startup') {
    if (challenge.startup_id === profile.id) {
      return <StartupChallengeDetail challenge={challenge} activeTab={activeTab} setActiveTab={setActiveTab} unansweredCount={unansweredCount} setUnansweredCount={setUnansweredCount} />;
    } else {
      return <p className="text-center py-20">K zobrazení této stránky nemáte oprávnění.</p>;
    }
  }

  return <p>Pro zobrazení detailu se musíte přihlásit.</p>;
}

export default CreateChallengeView;