"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext'; // Uprav cestu
import { supabase } from '../../../lib/supabaseClient'; // Uprav cestu
import StudentChallengeCard from './components/StudentChallengeCard'; // Importujeme naši novou kartu

type Skill = { id: string; name: string; };
type StartupProfile = { company_name: string; logo_url: string | null; };
type Challenge = {
  id: string;
  title: string;
  short_description: string | null;
  budget_in_cents: number | null;
  deadline: string | null;
  created_at: string;
  max_applicants: number | null;
  status: 'open' | 'draft' | 'closed' | 'archived';
  type: 'public' | 'anonymous';
  ChallengeSkill: { Skill: Skill }[];
  Submission: { id: string }[];
  StartupProfile: StartupProfile | null;
};

type FilterType = 'active' | 'new' | 'ending_soon' | 'completed';

export default function StudentChallengesView() {
  const { user } = useAuth(); 
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [studentSkills, setStudentSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('active');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const [challengesRes, skillsRes] = await Promise.all([
        supabase
          .from('Challenge')
          .select(`*, ChallengeSkill(Skill(id, name)), Submission(id), StartupProfile(company_name, logo_url)`)
          .eq('status', 'open')
          .eq('type', 'public'),
        supabase
          .from('StudentSkill')
          .select('Skill(id, name)') // Tento dotaz je správně
          .eq('student_id', user.id)
      ]);

      if (challengesRes.error) {
        console.error("Chyba při načítání výzev:", challengesRes.error);
      } else {
        setAllChallenges((challengesRes.data as Challenge[]) || []);
      }

      if (skillsRes.error) {
        console.error("Chyba při načítání dovedností studenta:", skillsRes.error);
      } else {
        // --- ELEGANTNÍ ŘEŠENÍ ---
        // Použijeme flatMap k přímému extrahování a zploštění pole dovedností.
        const skills = skillsRes.data?.flatMap(item => item.Skill || []) || [];
        setStudentSkills(skills);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const sortedChallenges = useMemo(() => {
    if (studentSkills.length === 0) {
      return allChallenges;
    }
    
    const studentSkillIds = studentSkills.map(s => s.id);

    return [...allChallenges].sort((a, b) => {
      const aMatches = a.ChallengeSkill.filter(cs => studentSkillIds.includes(cs.Skill.id)).length;
      const bMatches = b.ChallengeSkill.filter(cs => studentSkillIds.includes(cs.Skill.id)).length;
      return bMatches - aMatches;
    });
  }, [allChallenges, studentSkills]);

  const displayedChallenges = sortedChallenges;
  const studentSkillIds = studentSkills.map(s => s.id);

  if (loading) {
    return <p className="text-center py-20">Načítám výzvy...</p>;
  }

  return (
    <div className="container mx-auto pb-12">
      <div className="flex flex-col justify-between items-center my-8 mb-12 gap-4">
        <h1 className="text-3xl font-bold text-[var(--barva-tmava)]">Objevuj nové výzvy</h1>
        
        <div className="bg-white p-1 gap-2 rounded-full shadow-sm flex items-center border border-gray-200">
            {['active', 'new', 'ending_soon', 'completed'].map(filter => (
                <button 
                    key={filter}
                    onClick={() => setActiveFilter(filter as FilterType)}
                    className={`px-5 py-2 leading-none rounded-full text-sm font-semibold transition-colors ${activeFilter === filter ? 'bg-[var(--barva-svetle-pozadi)] border-1 border-[var(--barva-primarni)] text-[var(--barva-primarni)]' : 'hover:bg-[var(--barva-svetle-pozadi)] text-[var(--barva-tmava)]'}`}>
                    {
                        {
                            'active': 'Aktivní',
                            'new': 'Nové',
                            'ending_soon': 'Brzy končí',
                            'completed': 'Ukončené'
                        }[filter]
                    }
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedChallenges.map(challenge => (
          <StudentChallengeCard key={challenge.id} challenge={challenge} studentSkillIds={studentSkillIds} />
        ))}
      </div>

      {displayedChallenges.length === 0 && (
        <div className="text-center bg-white p-12 rounded-2xl col-span-full">
            <h2 className="text-xl font-bold text-[var(--barva-tmava)]">Žádné výzvy k zobrazení</h2>
            <p className="text-gray-500 mt-2">V této kategorii se momentálně nenachází žádná výzva.</p>
        </div>
      )}
    </div>
  );
}
