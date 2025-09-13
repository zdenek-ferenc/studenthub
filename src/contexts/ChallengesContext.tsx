"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { useDebounce } from '../hooks/useDebounce'; // <-- 1. IMPORTUJEME NÁŠ HOOK

// ... (typy zůstávají stejné)
type Skill = { id: string; name: string; };
type StartupProfile = { company_name: string; logo_url: string | null; };

export type Challenge = {
  id: string;
  title: string;
  short_description: string;
  reward_first_place: number | null;
  reward_second_place: number | null;
  reward_third_place: number | null;
  max_applicants: number | null;
  deadline: string;
  created_at: string;
  Submission: { student_id: string }[];
  ChallengeSkill: { Skill: Skill }[];
  StartupProfile: StartupProfile | null;
};

type ChallengesContextType = {
  challenges: Challenge[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSkillIds: string[];
  setSelectedSkillIds: (ids: string[]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  allSkills: Skill[];
  studentSkills: Skill[];
  refetchChallenges: () => void;
};

const ChallengesContext = createContext<ChallengesContextType | undefined>(undefined);

export function ChallengesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [studentSkills, setStudentSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recommended');
  
  // <-- 2. VYTVOŘÍME "ZPOŽDĚNOU" HODNOTU
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const refetchChallenges = useCallback(async () => {
    if (challenges.length === 0) {
      setLoading(true);
    }

    if (allSkills.length === 0) {
      const { data: skillsData } = await supabase.from('Skill').select('id, name');
      setAllSkills(skillsData || []);
    }
    if (user && studentSkills.length === 0) {
        const { data: studentSkillsData } = await supabase.from('StudentSkill').select('Skill(id, name)').eq('student_id', user.id);
        const skills = studentSkillsData?.flatMap(item => item.Skill || []) || [];
        setStudentSkills(skills);
    }

    let query = supabase.from('Challenge').select(`*, ChallengeSkill(Skill(*)), Submission(student_id), StartupProfile(*)`);

    // <-- 3. V DOTAZU POUŽIJEME ZPOŽDĚNOU HODNOTU
    if (selectedSkillIds.length > 0) {
        const { data: rpcData } = await supabase.rpc('get_challenges_with_skills', {
            p_skill_ids: selectedSkillIds,
            p_search_term: debouncedSearchQuery // <-- ZMĚNA ZDE
        });
        const challengeIds = rpcData?.map((c: {id: string}) => c.id) || [];
        if (challengeIds.length === 0) {
          setChallenges([]);
          setLoading(false);
          return;
        }
        query = query.in('id', challengeIds);
    } else if (debouncedSearchQuery) { // <-- ZMĚNA ZDE
        query = query.or(`title.ilike.%${debouncedSearchQuery}%,short_description.ilike.%${debouncedSearchQuery}%`);
    }

    query = query.eq('status', 'open').eq('type', 'public');
    switch(sortBy) {
        case 'newest': query = query.order('created_at', { ascending: false }); break;
        case 'ending_soon': query = query.order('deadline', { ascending: true }); break;
        case 'highest_reward': query = query.order('reward_first_place', { ascending: false, nullsFirst: false }); break;
        default: break;
    }

    const { data: challengesData, error: challengesError } = await query;

    if (challengesError) {
      console.error("Chyba při načítání výzev:", challengesError);
      setChallenges([]);
    } else {
      setChallenges((challengesData as Challenge[]) ?? []);
    }
    
    setLoading(false);
    
  }, [user, debouncedSearchQuery, selectedSkillIds, sortBy, allSkills.length, studentSkills.length, challenges.length]); // <-- 4. PŘIDÁME DO ZÁVISLOSTÍ

  useEffect(() => {
    refetchChallenges();
  }, [debouncedSearchQuery, selectedSkillIds, sortBy, refetchChallenges]); // <-- ZMĚNA ZDE

  // ... zbytek souboru zůstává stejný
  const value = useMemo(() => ({
    challenges,
    loading,
    searchQuery,
    setSearchQuery,
    selectedSkillIds,
    setSelectedSkillIds,
    sortBy,
    setSortBy,
    allSkills,
    studentSkills,
    refetchChallenges,
  }), [challenges, loading, searchQuery, selectedSkillIds, sortBy, allSkills, studentSkills, refetchChallenges]);

  return (
    <ChallengesContext.Provider value={value}>
      {children}
    </ChallengesContext.Provider>
  );
}

export function useChallenges() {
  const context = useContext(ChallengesContext);
  if (context === undefined) {
    throw new Error('useChallenges must be used within a ChallengesProvider');
  }
  return context;
}