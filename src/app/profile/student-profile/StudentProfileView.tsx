"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext'; // Uprav cestu
import { supabase } from '../../../lib/supabaseClient'; // Uprav cestu
import Link from 'next/link';
import Image from 'next/image';

// Přejmenovali jsme komponenty pro lepší přehlednost
import StudentInfoCard from './StudentInfoCard';
import StudentSkillsCard from './StudentSkillsCard';
// Importujeme naši novou kartu pro zobrazení výzvy
import ProfileChallengeCard from './StudentChallengesCard';

// Definujeme si typy pro data
type StudentProfileData = {
  first_name: string;
  last_name: string;
  username: string;
  university: string;
  field_of_study: string;
  bio: string | null;
};
type SkillData = { Skill: { id: string; name: string; } };
type LanguageData = { Language: { id: string; name: string; } };
// Nový typ pro data o přihlášené výzvě
type AppliedChallenge = {
  Challenge: {
    id: string;
    title: string;
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
  // Nový stav pro uložení výzev, do kterých se student přihlásil
  const [appliedChallenges, setAppliedChallenges] = useState<AppliedChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProfileData = async () => {
      // Načteme všechna data najednou, včetně přihlášených výzev
      const [profileRes, skillsRes, languagesRes, challengesRes] = await Promise.all([
        supabase.from('StudentProfile').select('*').eq('user_id', user.id).single(),
        supabase.from('StudentSkill').select('Skill(*)').eq('student_id', user.id),
        supabase.from('StudentLanguage').select('Language(*)').eq('student_id', user.id),
        // Tento dotaz získá všechny výzvy, do kterých se student přihlásil
        supabase.from('Submission').select('Challenge(*, StartupProfile(company_name, logo_url))').eq('student_id', user.id)
      ]);

      if (profileRes.data) setProfileData(profileRes.data);
      if (skillsRes.data) setSkills(skillsRes.data as unknown as SkillData[]);
      if (languagesRes.data) setLanguages(languagesRes.data as unknown as LanguageData[]);
      if (challengesRes.data) setAppliedChallenges(challengesRes.data as unknown as AppliedChallenge[]);
      
      setLoading(false);
    };

    fetchProfileData();
  }, [user]);

  if (loading) {
    return <p className="text-center py-20">Načítám profil studenta...</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-2/3 mx-auto mt-12 mb-24">
      <div className="lg:col-span-2 space-y-8">
        <StudentInfoCard profile={profileData} />
        <StudentSkillsCard skills={skills} languages={languages} />
      </div>
      <div className="space-y-8">
        {/* Sekce pro aktuální výzvy */}
        <div className="bg-white p-8 py-4 rounded-2xl shadow-xs">
            <h3 className="text-xl text-center text-[var(--barva-tmava)] font-bold mb-4">Aktuální výzvy</h3>
            {appliedChallenges.length > 0 ? (
              <div className='flex flex-col justify-center'>
                <div className="space-y-4">
                    {appliedChallenges.map(item => 
                        item.Challenge ? <ProfileChallengeCard key={item.Challenge.id} challenge={item.Challenge} /> : null
                    )}
                </div>
                <button className="mt-6 w-1/2 mx-auto px-3 py-2 rounded-full bg-[var(--barva-primarni)] text-white font-semibold cursor-pointer">Najít výzvu</button>
              </div>
                
                
            ) : (
                <div className="text-center">
                    <Image
                        src="/frown.svg"
                        alt="Smutný smajlík"
                        width={50}
                        height={50}
                        className="w-12 mx-auto my-4"
                    />
                    <p className="text-gray-500">Nic tady není</p>
                    <Link href="/challenges" className="inline-block mt-6 px-6 py-2 rounded-full bg-[var(--barva-primarni)] text-white font-semibold cursor-pointer">
                        Najít výzvu
                    </Link>
                </div>
            )}
        </div>
        
        {/* Sekce pro hotové výzvy (zatím prázdný stav) */}
        <div className="bg-white p-8 py-4 rounded-2xl shadow-xs">
            <h3 className="text-xl text-center text-[var(--barva-tmava)] font-bold mb-4">Hotové výzvy</h3>
            <div className="text-center">
                <Image
                    src="/frown.svg"
                    alt="Smutný smajlík"
                    width={50}
                    height={50}
                    className="w-12 mx-auto my-4"
                />
                <p className="text-gray-500">Nic tady není</p>
                <Link href="/challenges" className="inline-block mt-6 px-6 py-2 rounded-full bg-[var(--barva-primarni)] text-white font-semibold cursor-pointer">
                        Najít výzvu
                    </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
