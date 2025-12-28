"use client";

import { useAuth } from '../../../contexts/AuthContext';
import StudentChallengeDetail from './StudentChallengeDetail';
import StartupChallengeDetail from './StartupChallengeDetail';
import type { ChallengeDetailData } from './ChallengePageClient';

type ChallengeDetailViewProps = {
  challenge: ChallengeDetailData | null;
  applicantCount?: number | null;
};

export default function ChallengeDetailView({ challenge, applicantCount = null }: ChallengeDetailViewProps) { 
  const { profile, loading: authLoading } = useAuth();

  if (authLoading) return null;

  if (!challenge) {
    return <p className="text-center py-20">Výzva nebyla nalezena.</p>;
  }

  // 1. POHLED STUDENTA
  if (profile?.role === 'student') {
    // Ensure completed_outputs is always string[] for all submissions
    const safeChallenge = {
      ...challenge,
      Submission: challenge.Submission?.map(sub => ({
        ...sub,
        completed_outputs: Array.isArray(sub.completed_outputs)
          ? sub.completed_outputs.filter(x => typeof x === 'string')
          : typeof sub.completed_outputs === 'string'
            ? [sub.completed_outputs]
            : Array.isArray(sub.completed_outputs)
              ? sub.completed_outputs.map(x => String(x))
              : [],
      })) ?? [],
    };
    return (
      <StudentChallengeDetail 
        challenge={safeChallenge} 
        applicantCount={applicantCount} 
      />
    );
  }

  // 2. POHLED STARTUPU
  if (profile?.role === 'startup') {
    if (challenge.startup_id === profile.id) {
      const safeChallenge = {
        ...challenge,
        Submission: challenge.Submission?.map(sub => ({
          ...sub,
          completed_outputs: Array.isArray(sub.completed_outputs)
            ? sub.completed_outputs.filter(x => typeof x === 'string')
            : typeof sub.completed_outputs === 'string'
              ? [sub.completed_outputs]
              : Array.isArray(sub.completed_outputs)
                ? sub.completed_outputs.map(x => String(x))
                : [],
        })) ?? [],
      };
      return (
        <StartupChallengeDetail 
          challenge={safeChallenge} 
        />
      );
    } else {
      return <p className="text-center py-20">K zobrazení této stránky nemáte oprávnění (cizí startup).</p>;
    }
  }

  return (
    <div className="text-center py-32 px-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Pro zobrazení detailu se musíte přihlásit</h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Tato výzva je dostupná pouze pro registrované studenty a startupy.
      </p>
    </div>
  );
}