"use client";
import { useState } from 'react';
import SkillSelector from '../../../../components/SkillSelector';

type Skill = { id: string; name: string; };

type StepProps = {
  onNext: (data: { skills: string[] }) => void;
  allSkills: Skill[];
  isLoading: boolean;
};

export default function Step3_Skills({ onNext, allSkills, isLoading }: StepProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const handleContinue = () => {
    onNext({ skills: selectedSkills });
  };

  return (
    <div className="flex items-center flex-col py-12 px-8 sm:px-12 w-full max-w-5xl mx-auto bg-white shadow-lg rounded-3xl">
      <h2 className="text-[var(--barva-primarni)] text-4xl mb-2 text-center">Dovednosti</h2>
      <p className="text-gray-600 mb-6 sm:mb-8 text-center px-4">Vyber vše, co umíš. Pomůže ti to najít relevantní výzvy.</p>
      
      {isLoading ? (
        <p className='text-[var(--barva-primarni)] text-2xl sm:text-4xl font-bold'>Načítám dovednosti...</p>
      ) : (
        <SkillSelector 
          onSelectionChange={setSelectedSkills} 
          allSkills={allSkills} 
        />
      )}
      
      <div className='pt-6 flex justify-center'>
        <button 
        onClick={handleContinue} 
        disabled={isLoading} 
        className="px-6 py-3 md:px-8 md:py-4 rounded-3xl font-semibold text-white bg-[var(--barva-primarni)] md:text-xl cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out disabled:bg-gray-400"
      >
        Pokračovat
      </button>
      </div>
      
    </div>
  );
}