"use client";

import { useMemo, useEffect, useState } from 'react';
import { useChallenges } from '../../../contexts/ChallengesContext';
import { useAuth } from '../../../contexts/AuthContext';
import StudentChallengeCard from './components/StudentChallengeCard';
import ChallengeFilter from './components/ChallengeFilter';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { SlidersHorizontal } from 'lucide-react';
import ChallengeViewSwitch, { ChallengeViewType } from './components/ChallengeViewSwitch';

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
  const [currentView, setCurrentView] = useState<ChallengeViewType>('available');

  useEffect(() => {
    refetchChallenges();
  }, [refetchChallenges]);

  const { availableChallenges, appliedChallenges } = useMemo(() => {
    const applied = challenges.filter(challenge =>
      user && challenge.Submission.some(sub => sub.student_id === user.id)
    );

    const available = challenges.filter(challenge =>
      (!user || !challenge.Submission.some(sub => sub.student_id === user.id)) &&
      (challenge.deadline ? new Date(challenge.deadline) >= new Date() : true) 
    );

    const sortedApplied = [...applied].sort((a, b) => {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        if (dateA === Infinity && dateB === Infinity) return 0; 
        if (dateA === Infinity) return 1; 
        if (dateB === Infinity) return -1;
        return dateA - dateB; 
    });

    return {
      availableChallenges: available, 
      appliedChallenges: sortedApplied,
    };
  }, [challenges, user]); 

  const displayedChallenges = useMemo(() => {
    return currentView === 'available' ? availableChallenges : appliedChallenges;
  }, [currentView, availableChallenges, appliedChallenges]);

  const studentSkillIdsForCard = useMemo(() => studentSkills.map(s => s.id), [studentSkills]);

  return (
    <div className="min-h-screen flex flex-col max-w-5/6 mx-auto py-8 md:py-28 3xl:py-32 items-start gap-2 xl:gap-3">
      <div className="w-full">
        <div className="xl:mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl 3xl:text-3xl font-semibold text-[var(--barva-tmava)]">Objev nové výzvy</h1>
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
        <p className="text-base pt-3 p-2 text-gray-500 mt-1">
            Nalezeno <span className='text-[var(--barva-primarni)] font-bold'>{availableChallenges.length}</span> výzev na základě tvých filtrů.
        </p>
        <ChallengeViewSwitch
            currentView={currentView}
            setCurrentView={setCurrentView}
            availableCount={availableChallenges.length}
            appliedCount={appliedChallenges.length}
        />
      </div>
      <main className="flex-1 w-full">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {displayedChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                {displayedChallenges.map(challenge => {
                  const isApplied = user && challenge.Submission.some(sub => sub.student_id === user.id);
                  return (
                    <StudentChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      studentSkillIds={studentSkillIdsForCard}
                      isApplied={!!isApplied}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center bg-white p-12 rounded-2xl col-span-full">
                <h2 className="text-xl font-bold text-[var(--barva-tmava)]">
                  {currentView === 'available' ? 'Žádné další dostupné výzvy' : 'Zatím žádné přihlášené výzvy'}
                </h2>
                <p className="text-gray-500 mt-2">
                  {currentView === 'available'
                    ? 'Všechny výzvy odpovídající filtrům už máš v přihlášených, nebo zkus upravit filtry.'
                    : 'Přihlas se do nějaké výzvy a uvidíš ji zde.'}
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}