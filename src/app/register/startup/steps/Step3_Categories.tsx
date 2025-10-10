"use client";
import { useState } from 'react';
import CategorySelector from '../../../../components/CategorySelector';

type Category = { id: string; name: string; };

type StepProps = {
  onNext: (data: { categories: string[] }) => void;
  allCategories: Category[];
  isLoading: boolean;
};

export default function Step3_Categories({ onNext, allCategories, isLoading }: StepProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleContinue = () => {
    onNext({ categories: selectedCategories });
  };

  return (
    <div className='mx-auto py-12 px-8 sm:px-12 rounded-3xl shadow-xl bg-white'>
      <div className="space-y-6">
        <h2 className="text-4xl text-center text-[var(--barva-primarni)] mb-4">Kategorie</h2>
        <p className="text-gray-600 text-center mb-6">Vyberte kategorie, které nejlépe vystihují vaši firmu.</p>
        
        {isLoading ? (
          <p className='text-2xl text-center font-bold text-[var(--barva-primarni)]'>Načítám kategorie...</p>
        ) : (
          <CategorySelector 
            onSelectionChange={setSelectedCategories} 
            allCategories={allCategories}
          />
        )}
        
        <div className="pt-6 flex justify-center">
          <button 
            onClick={handleContinue} 
            disabled={isLoading}
            className="px-6 py-3 md:px-8 md:py-4 rounded-3xl bg-[var(--barva-primarni)] md:text-xl text-white font-semibold shadow-sm hover:opacity-90 transition-all duration-300 ease-in-out disabled:bg-gray-400"
          >
            Pokračovat
          </button>
        </div>
      </div>
    </div>
  );
}