"use client";

import { useMemo, useEffect, useState } from 'react';
import { useChallenges } from '../../../contexts/ChallengesContext';
import { useAuth } from '../../../contexts/AuthContext';
import StudentChallengeCard from './components/StudentChallengeCard';
import ChallengeFilterSidebar from './components/ChallengeFilterSidebar';
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
    <div className="container mx-auto flex flex-col lg:flex-row items-start gap-8 px-4 py-5 md:py-32">
      <ChallengeFilterSidebar
        allSkills={allSkills}
        selectedSkillIds={selectedSkillIds}
        setSelectedSkillIds={setSelectedSkillIds}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        isMobileOpen={isFilterOpen}
        setMobileOpen={setIsFilterOpen}
      />
      <main className="flex-1 w-full">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[var(--barva-tmava)]">Objevuj nové výzvy</h1>
                  <p className="text-sm md:text-lg text-gray-500 mt-1">Nalezeno <span className='text-[var(--barva-primarni)] font-bold'>{displayedChallenges.length}</span> výzev na základě tvých filtrů.</p>
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
            {displayedChallenges.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
                  <p className="text-gray-500 mt-2">Zkus upravit filtry nebo se podívej později.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}