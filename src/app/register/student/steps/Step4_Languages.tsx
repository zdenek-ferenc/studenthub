"use client";
import { useState, useEffect } from 'react';
import LanguageSelector from '../../../../components/LanguageSelector';

type Language = { id: string; name: string; };

type StepProps = {
  onNext: (data: { languages: string[] }) => void;
  allLanguages: Language[];
  isLoading: boolean;
  initialSelectedIds: string[]; 
};

export default function Step4_Languages({ onNext, allLanguages, isLoading, initialSelectedIds }: StepProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(initialSelectedIds);

  useEffect(() => {
    setSelectedLanguages(initialSelectedIds);
  }, [initialSelectedIds]);

  const handleContinue = () => {
    onNext({ languages: selectedLanguages });
  };

  return (
    <div className="flex items-center flex-col py-12 px-8 sm:px-12 w-full max-w-5xl mx-auto bg-white shadow-lg rounded-3xl">
      <h2 className="text-4xl text-[var(--barva-primarni)] mb-2 text-center">Jazyky</h2>
      <p className="text-gray-600 mb-6 sm:mb-8 text-center">Jakými jazyky se domluvíš?</p>

      {isLoading ? (
        <p className='text-2xl sm:text-4xl font-bold'>Načítám jazyky...</p>
      ) : (
        <LanguageSelector 
          onSelectionChange={setSelectedLanguages} 
          allLanguages={allLanguages}
          initialSelectedIds={initialSelectedIds} 
        />
      )}
      
      <button 
        onClick={handleContinue} 
        disabled={isLoading}
        className="mt-8 sm:mt-12 px-8 py-3 sm:px-14 sm:py-4 rounded-3xl font-semibold text-white bg-[var(--barva-primarni)] text-lg sm:text-2xl cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out disabled:bg-gray-400"
      >
        Dokončit registraci
      </button>
    </div>
  );
}