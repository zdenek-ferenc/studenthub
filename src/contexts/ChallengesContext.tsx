"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext'; // <-- Přidáno
import { useDebounce } from '../hooks/useDebounce';

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
  const { user, loading: authLoading } = useAuth(); // <-- Získání authLoading
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [studentSkills, setStudentSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true); // Začínáme jako true

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recommended');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const refetchChallenges = useCallback(async () => {
    // Pokud stále probíhá autentizace, počkáme
    if (authLoading) {
      setLoading(false); // Ukončíme lokální loading, protože čekáme na auth
      return;
    }

    // Pokud potřebujeme uživatele pro řazení a není k dispozici, nehledáme
    if (sortBy === 'recommended' && !user) {
        setChallenges([]);
        setStudentSkills([]); // Vyčistíme i skilly studenta
        setLoading(false);
        return;
    }

    setLoading(true); // Zahájíme načítání

    try {
        // Načtení všech skillů, pokud ještě nejsou
        if (allSkills.length === 0) {
          const { data: skillsData } = await supabase.from('Skill').select('id, name');
          setAllSkills(skillsData || []);
        }

        // Načtení skillů studenta, pokud je přihlášen a ještě nejsou načteny
        if (user && studentSkills.length === 0) {
            const { data: studentSkillsData } = await supabase.from('StudentSkill').select('Skill(id, name)').eq('student_id', user.id);
            const skills = studentSkillsData?.flatMap(item => item.Skill || []) || [];
            setStudentSkills(skills);
        } else if (!user) {
            setStudentSkills([]); // Reset skillů pokud není uživatel přihlášen
        }

        // Sestavení dotazu na výzvy
        let query = supabase.from('Challenge').select(`*, ChallengeSkill(Skill(*)), Submission(student_id), StartupProfile(*)`);

        if (selectedSkillIds.length > 0) {
            const { data: rpcData } = await supabase.rpc('get_challenges_with_skills', {
                p_skill_ids: selectedSkillIds,
                p_search_term: debouncedSearchQuery
            });
            const challengeIds = rpcData?.map((c: {id: string}) => c.id) || [];
            if (challengeIds.length === 0) {
              setChallenges([]);
              setLoading(false); // Ukončíme načítání zde, protože nic nenajdeme
              return;
            }
            query = query.in('id', challengeIds);
        } else if (debouncedSearchQuery) {
            query = query.or(`title.ilike.%${debouncedSearchQuery}%,short_description.ilike.%${debouncedSearchQuery}%`);
        }

        query = query.eq('status', 'open').eq('type', 'public');

        switch(sortBy) {
            case 'newest': query = query.order('created_at', { ascending: false }); break;
            case 'ending_soon': query = query.order('deadline', { ascending: true }); break;
            case 'highest_reward': query = query.order('reward_first_place', { ascending: false, nullsFirst: false }); break;
            // 'recommended' řazení se provede až po načtení dat, pokud je potřeba (viz useMemo níže)
            default: break;
        }

        const { data: challengesData, error: challengesError } = await query;

        if (challengesError) {
          console.error("Chyba při načítání výzev:", challengesError);
          setChallenges([]);
        } else {
          setChallenges((challengesData as Challenge[]) ?? []);
        }

    } catch (error) {
        console.error("Neočekávaná chyba v refetchChallenges:", error);
        setChallenges([]);
    } finally {
        setLoading(false); // Ukončíme načítání vždy
    }

  }, [user, authLoading, debouncedSearchQuery, selectedSkillIds, sortBy, allSkills.length, studentSkills.length]); // Odebráno challenges.length

  useEffect(() => {
    // Spustíme načítání, až když je AuthContext hotový
    if (!authLoading) {
      refetchChallenges();
    }
  }, [authLoading, refetchChallenges]); // Závislost na authLoading a refetchChallenges

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