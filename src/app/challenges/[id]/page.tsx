"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext'; // Uprav cestu
import { supabase } from '../../../lib/supabaseClient'; // Uprav cestu
import withAuth from '../../../components/withAuth'; // Uprav cestu

import StudentChallengeDetail from './StudentChallengeDetail';
import StartupChallengeDetail from './StartupChallengeDetail'; // Importujeme novou komponentu

// Typ 'Challenge' musí obsahovat i startup_id pro bezpečnostní kontrolu
type Challenge = {
  id: string;
  title: string;
  description: string;
  startup_id: string; // Klíčové pro bezpečnost
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
    status: 'applied' | 'submitted' | 'reviewed' | 'winner' | 'rejected' | null;
  }[];
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
          ChallengeSkill ( Skill ( id, name ) ),
          StartupProfile ( company_name, logo_url ),
          Submission ( id, student_id, link, file_url, status ) 
        `)
        .eq('id', challengeId)
        .single();

      if (error) {
        console.error("Chyba při načítání detailu výzvy:", error);
      } else {
        setChallenge(data as Challenge);
      }
      setLoading(false);
    };

    fetchChallenge();
  }, [challengeId]);

  if (authLoading || loading) {
    return <p className="text-center py-20">Načítám detail výzvy...</p>;
  }

  if (!challenge) {
    return <p className="text-center py-20">Výzva nebyla nalezena.</p>;
  }

  // --- "Výhybka" pro zobrazení správného pohledu ---
  if (profile?.role === 'student') {
    return <StudentChallengeDetail challenge={challenge} />;
  }

  if (profile?.role === 'startup') {
    // BEZPEČNOSTNÍ KONTROLA: Zkontrolujeme, jestli je přihlášený startup vlastníkem této výzvy
    if (challenge.startup_id === profile.id) {
      return <StartupChallengeDetail challenge={challenge} />;
    } else {
      // Pokud ne, zobrazíme chybu
      return <p className="text-center py-20">K zobrazení této stránky nemáte oprávnění.</p>;
    }
  }

  return <p>Pro zobrazení detailu se musíte přihlásit.</p>;
}

export default withAuth(ChallengeDetailPage);
