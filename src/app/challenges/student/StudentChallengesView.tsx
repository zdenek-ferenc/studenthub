"use client";

import { useMemo, useEffect, useState } from 'react';
import { useChallenges } from '../../../contexts/ChallengesContext';
import { useAuth } from '../../../contexts/AuthContext';
import StudentChallengeCard from './components/StudentChallengeCard';
import ChallengeFilter from './components/ChallengeFilter '; 
import LoadingSpinner from '../../../components/LoadingSpinner';
import { SlidersHorizontal } from 'lucide-react'; 

export default function StudentChallengesView() {
  const { user } = useAuth();
  const {
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
  } = useChallenges();

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    refetchChallenges();
  }, [refetchChallenges]);

  const displayedChallenges = useMemo(() => {
    let filtered = challenges.filter(challenge => 
        challenge.deadline ? new Date(challenge.deadline) >= new Date() : false
    );

    if (user) {
        filtered = filtered.filter(challenge => 
            !challenge.Submission.some(sub => sub.student_id === user.id)
        );
    }

    if (searchQuery && selectedSkillIds.length === 0) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(challenge => 
            challenge.title.toLowerCase().includes(lowerCaseQuery) ||
            challenge.short_description.toLowerCase().includes(lowerCaseQuery) ||
            challenge.ChallengeSkill.some(cs => cs.Skill && cs.Skill.name.toLowerCase().includes(lowerCaseQuery))
        );
    }
    
    if (sortBy === 'recommended' && studentSkills.length > 0) {
        const studentSkillIdsSet = new Set(studentSkills.map(s => s.id));
        return [...filtered].sort((a, b) => {
            const aMatches = a.ChallengeSkill.filter(cs => cs.Skill && studentSkillIdsSet.has(cs.Skill.id)).length;
            const bMatches = b.ChallengeSkill.filter(cs => cs.Skill && studentSkillIdsSet.has(cs.Skill.id)).length;
            return bMatches - aMatches;
        });
    }

    return filtered;
  }, [challenges, studentSkills, sortBy, searchQuery, selectedSkillIds, user]);

  const studentSkillIdsForCard = useMemo(() => studentSkills.map(s => s.id), [studentSkills]);

  return (
    <div className="flex flex-col md:mx-20 2xl:mx-28 3xl:mx-32 px-4 py-8 md:py-28 3xl:py-32 items-start gap-2 xl:gap-3">
      <div className="w-full">
        <div className="xl:mb-6 flex justify-between items-center">
          <div>
              <h1 className="text-2xl 3xl:text-3xl font-bold text-[var(--barva-tmava)]">Objev nové výzvy</h1>
          </div>
          <div className="lg:hidden">
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="p-3 rounded-full bg-white shadow-md border text-[var(--barva-primarni)] cursor-pointer hover:bg-[var(--barva-primarni2)] ease-in-out duration-200"
              >
                  <SlidersHorizontal size={20} />
              </button>
          </div>
        </div>
        <ChallengeFilter
          allSkills={allSkills}
          selectedSkillIds={selectedSkillIds}
          studentSkills={studentSkills}
          setSelectedSkillIds={setSelectedSkillIds}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          isMobileOpen={isFilterOpen}
          setMobileOpen={setIsFilterOpen}
        />
        <p className="text-base pt-3 p-2 text-gray-500 mt-1">Nalezeno <span className='text-[var(--barva-primarni)] font-bold'>{displayedChallenges.length}</span> výzev na základě tvých filtrů.</p>
      </div>
      <main className="flex-1 w-full">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {displayedChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                {displayedChallenges.map(challenge => {
                  const isApplied = challenge.Submission.some(sub => sub.student_id === user?.id);
                  return (
                    <StudentChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      studentSkillIds={studentSkillIdsForCard}
                      isApplied={isApplied} 
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center bg-white p-12 rounded-2xl col-span-full">
                  <h2 className="text-xl font-bold text-[var(--barva-tmava)]">Žádné výzvy nenalezeny</h2>
                  <p className="text-gray-500 mt-2">Vypadá to, že jsi se přihlásil do všech dostupných výzev, nebo zkus upravit filtry.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}