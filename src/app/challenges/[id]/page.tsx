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

// Typy musíme přizpůsobit tak, aby odpovídaly finálnímu formátu dat
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
  attachments_urls: string[] | null; // <-- PŘIDANÁ VLASTNOST
  deadline: string;
  created_at: string;
  max_applicants: number;
  ChallengeSkill: { Skill: { id: string, name: string } }[]; // TENTO TYP JE KLÍČOVÝ
  StartupProfile: { company_name: string, logo_url: string | null } | null;
  Submission: Submission[];
};

// Vytvoříme pomocný typ pro syrová data vrácená ze Supabase
type RawChallengeData = Omit<Challenge, 'ChallengeSkill'> & {
  ChallengeSkill: { Skill: { id: string, name: string } }[];
};


function ChallengeDetailPage() {
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
          ChallengeSkill ( Skill ( * ) ),
          StartupProfile ( * ),
          Submission ( *, StudentProfile ( * ) )
        `)
        .eq('id', challengeId)
        .single();

      if (error) {
        console.error("Chyba při načítání detailu výzvy:", error);
      } else if (data) {
        // --- KLÍČOVÝ KROK: Čištění dat po načtení ---
        const rawData = data as RawChallengeData;
        
        // Supabase může vracet vnořená data v poli, i když je to jen jeden záznam.
        // Tímto to "rozbalíme" do správného formátu, který očekávají komponenty.
        const cleanedData: Challenge = {
          ...rawData,
          ChallengeSkill: (rawData.ChallengeSkill || []).map(cs => ({
            Skill: Array.isArray(cs.Skill) ? cs.Skill[0] : cs.Skill
          })).filter(cs => cs.Skill), // Odfiltrujeme prázdné záznamy
        };
        
        setChallenge(cleanedData);
      }
      setLoading(false);
    };

    fetchChallenge();
  }, [challengeId]);

  if (authLoading || loading) {
    return <LoadingSpinner />
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

export default withAuth(ChallengeDetailPage);