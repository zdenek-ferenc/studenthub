"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import Link from 'next/link';

import StartupInfoCard from './StartupInfoCard';
import StartupCategoriesCard from './StartupCategoriesCard';
import StartupChallengeCard from './StartupChallengesCard';

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
  Submission: { status: string }[];
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
        supabase.from('Challenge').select('*, StartupProfile(*), Submission(status)').eq('startup_id', user.id)
      ]);

      if (profileRes.data) setProfileData(profileRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data as unknown as CategoryData[]);
      if (challengesRes.data) setChallenges(challengesRes.data as unknown as ChallengeData[]);
      
      setLoading(false);
    };

    fetchProfileData();
  }, [user]);

  // --- VŠECHNY HOOKY A DEKLARACE PŘESUNUTY NA ZAČÁTEK ---
  const activeChallenges = useMemo(() => challenges.filter(c => c.status === 'open' || c.status === 'draft'), [challenges]);
  const completedChallenges = useMemo(() => challenges.filter(c => c.status === 'closed' || c.status === 'archived'), [challenges]);

  const sortedActiveChallenges = useMemo(() => {
      const getNeedsAttention = (challenge: ChallengeData) => {
          const isPastDeadline = challenge.deadline ? new Date() > new Date(challenge.deadline) : false;
          const hasUnreviewedSubmissions = challenge.Submission?.some(
              s => s.status === 'applied' || s.status === 'submitted'
          );
          return isPastDeadline && hasUnreviewedSubmissions;
      };
      
      return [...activeChallenges].sort((a, b) => {
          const aNeedsAttention = getNeedsAttention(a);
          const bNeedsAttention = getNeedsAttention(b);

          if (aNeedsAttention && !bNeedsAttention) return -1;
          if (!bNeedsAttention && aNeedsAttention) return 1;

          const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          
          return dateA - dateB;
      });
  }, [activeChallenges]);

  const validCategories: ValidCategoryData[] = useMemo(() => categories.filter(
    (c): c is ValidCategoryData => c.Category !== null
  ), [categories]);

  // Až teď, když jsou všechny hooky zavolané, můžeme mít podmíněný return
  if (loading) {
    return <p className="text-center py-20">Načítám profil startupu...</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-2/3 mx-auto mt-12 mb-24">
      <div className="lg:col-span-2 space-y-8">
        <StartupInfoCard profile={profileData} />
        <StartupCategoriesCard categories={validCategories} />
      </div>
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
            <h3 className="text-xl text-center text-[var(--barva-tmava)] font-bold mb-4">Aktivní výzvy</h3>
            {sortedActiveChallenges.length > 0 ? (
                <div className="space-y-3">
                    {sortedActiveChallenges.map(challenge => 
                        <StartupChallengeCard key={challenge.id} challenge={challenge} />
                    )}
                </div>
            ) : (
                <div className="text-center text-gray-500 py-4">
                    <p>Žádné aktivní výzvy.</p>
                </div>
            )}
            <div className='pt-7 text-center'>
                <Link href="/challenges/create" className="px-4 py-3 leading-none rounded-full font-semibold text-white bg-[var(--barva-primarni)] text-md cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out">
                    Vytvořit novou výzvu
                </Link>
            </div>
        </div>
        
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