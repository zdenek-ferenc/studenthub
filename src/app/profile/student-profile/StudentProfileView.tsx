"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import Link from 'next/link';

import StudentInfoCard from './StudentInfoCard';
import StudentSkillsCard from './StudentSkillsCard';
// Použijeme jen jednu, jednoduchou kartu pro odkaz
import ProfileChallengeCard from './StudentChallengesCard'; 
import LoadingSpinner from '../../../components/LoadingSpinner'

// Typy můžeme zjednodušit, nepotřebujeme už tolik detailů přímo na profilu
type StudentProfileData = {
  first_name: string;
  last_name: string;
  username: string;
  university: string;
  field_of_study: string;
  bio: string | null;
};
type SkillData = { Skill: { id: string; name:string; } };
type LanguageData = { Language: { id: string; name: string; } };

type SubmissionWithChallenge = {
  status: string | null;
  Challenge: {
    id: string;
    title: string;
    deadline: string | null; 
    StartupProfile: {
      company_name: string;
      logo_url: string | null;
    } | null;
  } | null;
};

export default function StudentProfileView() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<StudentProfileData | null>(null);
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [languages, setLanguages] = useState<LanguageData[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionWithChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProfileData = async () => {
      const [profileRes, skillsRes, languagesRes, submissionsRes] = await Promise.all([
        supabase.from('StudentProfile').select('*').eq('user_id', user.id).single(),
        supabase.from('StudentSkill').select('Skill(*)').eq('student_id', user.id),
        supabase.from('StudentLanguage').select('Language(*)').eq('student_id', user.id),
        // Stále načítáme všechna řešení s detaily o výzvě
        supabase
            .from('Submission')
            .select('status, Challenge(*, StartupProfile(company_name, logo_url))')
            .eq('student_id', user.id)
      ]);

      if (profileRes.data) setProfileData(profileRes.data);
      if (skillsRes.data) setSkills(skillsRes.data as unknown as SkillData[]);
      if (languagesRes.data) setLanguages(languagesRes.data as unknown as LanguageData[]);
      if (submissionsRes.data) setSubmissions(submissionsRes.data as unknown as SubmissionWithChallenge[]);
      
      setLoading(false);
    };

    fetchProfileData();
  }, [user]);

  const activeChallenges = submissions.filter(s => s.status === 'applied' || s.status === 'submitted');
  const completedChallenges = submissions.filter(s => s.status === 'reviewed' || s.status === 'winner' || s.status === 'rejected');

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className='w-2/3 mx-auto pt-12'>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mx-auto">
      <div className="lg:col-span-2 space-y-8">
        <StudentInfoCard profile={profileData} />
        <StudentSkillsCard skills={skills} languages={languages} />
      </div>
      <div className="space-y-8">
        
        <div className="bg-white p-6 rounded-2xl shadow-xs">
            <h3 className="text-xl text-center text-[var(--barva-tmava)] font-bold mb-4">Aktivní výzvy</h3>
            {activeChallenges.length > 0 ? (
                <div className="space-y-4">
                    {activeChallenges.map(item => 
                        item.Challenge ? <ProfileChallengeCard key={item.Challenge.id} challenge={item.Challenge} /> : null
                    )}
                </div>
            ) : (
                <div className="text-center py-4">
                    <p className="text-gray-500">Momentálně nepracuješ na žádné výzvě.</p>
                    <Link href="/challenges" className="inline-block mt-4 px-6 py-2 rounded-full bg-[var(--barva-primarni)] text-white font-semibold cursor-pointer text-sm">
                        Najít novou výzvu
                    </Link>
                </div>
            )}
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-xs">
            <h3 className="text-xl text-center text-[var(--barva-tmava)] font-bold mb-4">Hotové výzvy</h3>
            {completedChallenges.length > 0 ? (
                <div className="space-y-4">
                    {/* Zde je ta změna - i pro hotové výzvy použijeme stejnou odkazovací kartu */}
                    {completedChallenges.map(item => 
                        item.Challenge ? <ProfileChallengeCard key={item.Challenge.id} challenge={item.Challenge} /> : null
                    )}
                </div>
            ) : (
                 <div className="text-center py-4">
                    <p className="text-gray-500">Zatím jsi nedokončil žádnou výzvu.</p>
                </div>
            )}
        </div>
      </div>
    </div>
    </div>
    
  );
}