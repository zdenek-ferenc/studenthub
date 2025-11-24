"use client";
import { useState, useEffect } from 'react';
import CategorySelector from '../../../../components/CategorySelector';

type Category = { id: string; name: string; };

type StepProps = {
  onNext: (data: { categories: string[] }) => void;
  allCategories: Category[];
  isLoading: boolean;
  initialSelectedIds: string[];
};

export default function Step3_Categories({ onNext, allCategories, isLoading, initialSelectedIds }: StepProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialSelectedIds);

  useEffect(() => {
    setSelectedCategories(initialSelectedIds);
  }, [initialSelectedIds]);

  const handleContinue = () => {
    onNext({ categories: selectedCategories });
  };

  return (
    <div className='flex items-center flex-col py-6 sm:py-8 md:py-12 px-8 sm:px-12 w-full max-w-5xl mx-auto bg-white shadow-lg rounded-3xl'>
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl text-center text-[var(--barva-primarni)] mb-4">Kategorie</h2>
        <p className="text-gray-600 text-xs sm:text-sm md:text-base text-center mb-6">Vyberte kategorie, které nejlépe vystihují vaši firmu.</p>
        
        {isLoading ? (
          <p className='text-2xl text-center font-bold text-[var(--barva-primarni)]'>Načítám kategorie...</p>
        ) : (
          <CategorySelector 
            onSelectionChange={setSelectedCategories} 
            allCategories={allCategories}
            initialSelectedIds={initialSelectedIds}
          />
        )}
        
        <div className="pt-3 md:pt-6 flex justify-center">
          <button 
            onClick={handleContinue} 
            disabled={isLoading}
            className="px-5 py-3 md:px-6 md:py-3 rounded-full font-semibold text-white bg-[var(--barva-primarni)] text-sm sm:text-base md:text-xl cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out disabled:bg-gray-400"
          >
            Pokračovat
          </button>
        </div>
      </div>
    </div>
  );
}