"use client";

import { useAuth } from '../../contexts/AuthContext';
import withAuth from '../../components/withAuth';

// Zatím si jen představujeme, že tyto komponenty existují.
// V dalším kroku je vytvoříme.
import StudentProfileView from './student-profile/StudentProfileView';
import StartupProfileView from './startup-profile/StartupProfileView';

function ProfilePage() {
  // Vezmeme si data z našeho funkčního AuthContextu
  const { profile, loading } = useAuth();

  // Během načítání zobrazíme jednoduchou zprávu
  if (loading) {
    return <p className="text-center py-20">Načítám...</p>;
  }

  // --- Tady je ta "výhybka" ---
  // Podle role zobrazíme správnou komponentu
  if (profile?.role === 'student') {
    return <StudentProfileView />;
  }

  if (profile?.role === 'startup') {
    return <StartupProfileView />;
  }

  // Záložní stav, pokud by se něco pokazilo
  return <p className="text-center py-20">Profil se nepodařilo načíst nebo nemá platnou roli.</p>;
}

export default withAuth(ProfilePage);