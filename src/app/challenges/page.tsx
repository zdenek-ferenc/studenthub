"use client";

import { useAuth } from '../../contexts/AuthContext'; // Uprav cestu
import withAuth from '../../components/withAuth'; // Uprav cestu

// Importujeme nové komponenty pro jednotlivé pohledy
import StartupChallengesView from './startup/StartupChallengesView';
import StudentChallengesView from './student/StudentChallengesView';

function ChallengesPage() {
  const { profile, loading } = useAuth();

  if (loading) {
    return <p className="text-center py-20">Načítání...</p>;
  }

  // --- Tady je ta "výhybka" ---
  if (profile?.role === 'startup') {
    return <StartupChallengesView />;
  }

  if (profile?.role === 'student') {
    return <StudentChallengesView />;
  }

  return <p className="text-center py-20">Pro zobrazení této stránky nemáte oprávnění.</p>;
}

export default withAuth(ChallengesPage);
