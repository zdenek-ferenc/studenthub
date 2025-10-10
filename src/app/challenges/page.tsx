"use client";

import { useAuth } from '../../contexts/AuthContext'; 
import withAuth from '../../components/withAuth'; 

import StartupChallengesView from './startup/StartupChallengesView';
import StudentChallengesView from './student/StudentChallengesView';
import LoadingSpinner from '../../components/LoadingSpinner'

function ChallengesPage() {
  const { profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (profile?.role === 'startup') {
    return <StartupChallengesView />;
  }

  if (profile?.role === 'student') {
    return <StudentChallengesView />;
  }

  return <p className="text-center py-20">Pro zobrazení této stránky nemáte oprávnění.</p>;
}

export default withAuth(ChallengesPage);
