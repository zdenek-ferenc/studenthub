"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import withAuth from '../../../components/withAuth';
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

  if (authLoading || loading) {
    return <div className='pt-12 lg:pt-28 3xl:pt-34'><LoadingSpinner /></div>
  }

  if (!challenge) {
    return <p className="text-center py-20">Výzva nebyla nalezena.</p>;
  }

  if (profile?.role === 'student') {
    return <StudentChallengeDetail challenge={challenge} />;
  }

  if (profile?.role === 'startup') {
    if (challenge.startup_id === profile.id) {
      return <StartupChallengeDetail challenge={challenge} />;
    } else {
      return <p className="text-center py-20">K zobrazení této stránky nemáte oprávnění.</p>;
    }
  }

  return <p>Pro zobrazení detailu se musíte přihlásit.</p>;
}

export default withAuth(CreateChallengeView);