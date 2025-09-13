"use client";

import { useMemo, useEffect } from 'react';
import { useChallenges } from '../../../contexts/ChallengesContext';
import { useAuth } from '../../../contexts/AuthContext'; // Potřebujeme usera pro porovnání
import StudentChallengeCard from './components/StudentChallengeCard';
import ChallengeFilterSidebar from './components/ChallengeFilterSidebar';
import ChallengeCardSkeleton from '../../../components/skeletons/ChallengeCardSkeleton';

export default function StudentChallengesView() {
  const { user } = useAuth(); // Získáme aktuálně přihlášeného uživatele
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

  useEffect(() => {
    refetchChallenges();
  }, [refetchChallenges]);

  const displayedChallenges = useMemo(() => {
    if (sortBy !== 'recommended' || studentSkills.length === 0) {
      return challenges;
    }
    const studentSkillIds = studentSkills.map(s => s.id);
    return [...challenges].sort((a, b) => {
      const aMatches = a.ChallengeSkill.filter(cs => cs.Skill && studentSkillIds.includes(cs.Skill.id)).length;
      const bMatches = b.ChallengeSkill.filter(cs => cs.Skill && studentSkillIds.includes(cs.Skill.id)).length;
      return bMatches - aMatches;
    });
  }, [challenges, studentSkills, sortBy]);

  const studentSkillIdsForCard = useMemo(() => studentSkills.map(s => s.id), [studentSkills]);

  return (
    <div className="container mx-auto flex flex-col lg:flex-row items-start gap-8 px-4 py-12">
      <ChallengeFilterSidebar
        allSkills={allSkills}
        selectedSkillIds={selectedSkillIds}
        setSelectedSkillIds={setSelectedSkillIds}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      <main className="flex-1 w-full">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            <ChallengeCardSkeleton />
            <ChallengeCardSkeleton />
            <ChallengeCardSkeleton />
            <ChallengeCardSkeleton />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[var(--barva-tmava)]">Objevuj nové výzvy</h1>
              <p className="text-gray-500 mt-1">Nalezeno {displayedChallenges.length} výzev na základě tvých filtrů.</p>
            </div>
            {displayedChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                {displayedChallenges.map(challenge => {
                  // Zjistíme, jestli submission od aktuálního studenta existuje
                  const isApplied = challenge.Submission.some(sub => sub.student_id === user?.id);
                  return (
                    <StudentChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      studentSkillIds={studentSkillIdsForCard}
                      isApplied={isApplied} // Předáme jako prop
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center bg-white p-12 rounded-2xl col-span-full">
                  <h2 className="text-xl font-bold text-[var(--barva-tmava)]">Žádné výzvy nenalezeny</h2>
                  <p className="text-gray-500 mt-2">Zkus upravit filtry nebo se podívej později.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}