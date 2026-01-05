"use client";

import { useAuth } from '../../contexts/AuthContext'; 
import withAuth from '../../components/withAuth'; 
import dynamic from 'next/dynamic'; 

// Pomocník pro fade-in animaci obsahu
const FadeInWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="animate-fade-in duration-500 w-full">
        {children}
    </div>
);

const StartupChallengesView = dynamic(
  () => import('./startup/StartupChallengesView').then(mod => function StartupLoaded() {
      return <FadeInWrapper><mod.default /></FadeInWrapper>;
  })
);

const StudentChallengesView = dynamic(
  () => import('./student/StudentChallengesView').then(mod => function StudentLoaded() {
      return <FadeInWrapper><mod.default /></FadeInWrapper>;
  })
);

function ChallengesView() {
  const { profile } = useAuth();

  // ZDE UŽ NENÍ ŽÁDNÝ LOADER!
  // Layout garantuje, že tuto komponentu zobrazí, až když je auth i data ready.
  
  if (profile?.role === 'startup') {
    return <StartupChallengesView />;
  }

  if (profile?.role === 'student') {
    return <StudentChallengesView />;
  }

  return null;
}

export default withAuth(ChallengesView);