"use client";

import PublicStudentProfileView from './PublicStudentProfileView';
import PublicStartupProfileView from './PublicStartupProfileView';
import { StudentProfile, StartupProfile } from './types';

type ProfileViewProps = {
  profileId: string;
  role: 'student' | 'startup';
  studentData: StudentProfile | null;
  startupData: StartupProfile | null;
  viewerData: {
      skillIds: string[];
      appliedChallengeIds: string[];
  }
};

export default function ProfileView({ role, studentData, startupData, viewerData }: ProfileViewProps) {
  
  if (role === 'student' && studentData) {
    return <PublicStudentProfileView profile={studentData} />;
  }

  if (role === 'startup' && startupData) {
    return (
        <PublicStartupProfileView 
            profile={startupData} 
            viewerContext={viewerData}
        />
    );
  }

  return <div className="text-center py-20 text-gray-500">Profil se nepodařilo načíst.</div>;
}