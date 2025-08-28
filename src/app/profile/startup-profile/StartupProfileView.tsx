"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import Link from 'next/link';

import StartupInfoCard from './StartupInfoCard';
import StartupCategoriesCard from './StartupCategoriesCard';
import StartupChallengeCard from './StartupChallengesCard'; 

// OPRAVA: Definujeme si přesné typy pro data
type StartupProfileData = {
  company_name: string;
  website: string;
  logo_url: string | null;
  description: string | null;
  ico?: string;
  phone_number?: string;
  contact_email?: string;
  address?: string;
  contact_first_name?: string;
  contact_last_name?: string;
  contact_position?: string;
};

type CategoryData = { 
  Category: { 
    id: string; 
    name: string; 
  } | null 
};

// Vytvoříme si nový typ pro validní kategorie, který budeme předávat dál
export type ValidCategoryData = {
    Category: {
        id: string;
        name: string;
    }
}

type ChallengeData = {
  id: string;
  title: string;
  deadline: string | null;
  status: 'draft' | 'open' | 'closed' | 'archived';
  StartupProfile: {
    company_name: string;
    logo_url: string | null;
  } | null;
};

export default function StartupProfileView() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<StartupProfileData | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [challenges, setChallenges] = useState<ChallengeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProfileData = async () => {
      const [profileRes, categoriesRes, challengesRes] = await Promise.all([
        supabase.from('StartupProfile').select('*').eq('user_id', user.id).single(),
        supabase.from('StartupCategory').select('Category(*)').eq('startup_id', user.id),
        supabase.from('Challenge').select('*, StartupProfile(*)').eq('startup_id', user.id)
      ]);

      if (profileRes.data) setProfileData(profileRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data as unknown as CategoryData[]);
      if (challengesRes.data) setChallenges(challengesRes.data as unknown as ChallengeData[]);
      
      setLoading(false);
    };

    fetchProfileData();
  }, [user]);

  if (loading) {
    return <p className="text-center py-20">Načítám profil startupu...</p>;
  }

  const activeChallenges = challenges.filter(c => c.status === 'open' || c.status === 'draft');
  const completedChallenges = challenges.filter(c => c.status === 'closed' || c.status === 'archived');
  
  // OPRAVA: Filtrujeme kategorie a zároveň je přetypujeme na bezpečný typ
  const validCategories: ValidCategoryData[] = categories.filter(
    (c): c is ValidCategoryData => c.Category !== null
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-2/3 mx-auto mt-12 mb-24">
      <div className="lg:col-span-2 space-y-8">
        <StartupInfoCard profile={profileData} />
        {/* Předáváme jen validní kategorie */}
        <StartupCategoriesCard categories={validCategories} />
      </div>
      <div className="space-y-8">
        {/* Sekce pro aktivní výzvy */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
            <h3 className="text-xl text-center text-[var(--barva-tmava)] font-bold mb-4">Aktivní výzvy</h3>
            {activeChallenges.length > 0 ? (
                <div className="space-y-3">
                    {activeChallenges.map(challenge => 
                        <StartupChallengeCard key={challenge.id} challenge={challenge} />
                    )}
                </div>
            ) : (
                <div className="text-center text-gray-500 py-4">
                    <p>Žádné aktivní výzvy.</p>
                </div>
            )}
            <div className='pt-6 text-center'>
                <Link href="/challenges/create" className="px-6 py-2 rounded-full bg-[var(--barva-primarni)] text-white font-semibold text-sm">
                    Vytvořit novou výzvu
                </Link>
            </div>
        </div>
        
        {/* Sekce pro ukončené výzvy */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
            <h3 className="text-xl text-center text-[var(--barva-tmava)] font-bold mb-4">Ukončené výzvy</h3>
            {completedChallenges.length > 0 ? (
                 <div className="space-y-3">
                    {completedChallenges.map(challenge => 
                        <StartupChallengeCard key={challenge.id} challenge={challenge} />
                    )}
                </div>
            ) : (
                <div className="text-center text-gray-500 py-4">
                    <p>Žádné ukončené výzvy.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
