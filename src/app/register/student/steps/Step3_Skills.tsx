"use client";
import { useState, useEffect } from 'react';
import SkillSelector from '../../../../components/SkillSelector';

type Skill = { id: string; name: string; };

type StepProps = {
  onNext: (data: { skills: string[] }) => void;
  allSkills: Skill[];
  isLoading: boolean;
  initialSelectedIds: string[]; 
};

export default function Step3_Skills({ onNext, allSkills, isLoading, initialSelectedIds }: StepProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialSelectedIds);
  useEffect(() => {
    setSelectedSkills(initialSelectedIds);
  }, [initialSelectedIds]);


  const handleContinue = () => {
    onNext({ skills: selectedSkills });
  };

  return (
    <div className="flex items-center flex-col py-6 sm:py-8 md:py-12 px-8 sm:px-12 w-full max-w-5xl mx-auto bg-white shadow-lg rounded-3xl">
      <h2 className="text-[var(--barva-primarni)] text-2xl sm:text-3xl md:text-4xl mb-2 text-center">Dovednosti</h2>
      <p className="text-gray-600 mb-6 sm:mb-8 text-xs sm:text-sm md:text-base text-center px-4">Vyber vše, co umíš. Pomůže ti to najít relevantní výzvy.</p>
      
      {isLoading ? (
        <p className='text-[var(--barva-primarni)] text-2xl sm:text-4xl font-bold'>Načítám dovednosti...</p>
      ) : (
        <SkillSelector 
          onSelectionChange={setSelectedSkills} 
          allSkills={allSkills} 
          initialSelectedIds={initialSelectedIds} 
        />
      )}
      
      <div className='pt-6 flex justify-center'>
        <button 
        onClick={handleContinue} 
        disabled={isLoading} 
        className="px-5 py-3 md:px-6 md:py-3 rounded-full font-semibold text-white bg-[var(--barva-primarni)] text-sm sm:text-base md:text-xl cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out disabled:bg-gray-400"
      >
        Pokračovat
      </button>
      </div>
      
    </div>
  );
}