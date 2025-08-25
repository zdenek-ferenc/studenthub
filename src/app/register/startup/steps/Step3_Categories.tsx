"use client";
import { useState } from 'react';
import CategorySelector from '../../../../components/CategorySelector'; // Uprav cestu, pokud je potřeba

type StepProps = {
  onNext: (data: { categories: string[] }) => void;
};

export default function Step3_Categories({ onNext }: StepProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleContinue = () => {
    // Předáme vybraná IDčka rodičovské komponentě
    onNext({ categories: selectedCategories });
  };

  return (
    // Používáme stejný hlavní kontejner pro konzistentní vzhled
    <div className='mx-auto py-12 px-8 sm:px-12 rounded-3xl shadow-xl bg-white'>
      <div className="space-y-6">
        <h2 className="text-4xl text-center text-[var(--barva-primarni)] mb-4">Kategorie</h2>
        <p className="text-gray-600 text-center mb-6">Vyberte kategorie, které nejlépe vystihují vaši firmu.</p>
        
        <CategorySelector onSelectionChange={setSelectedCategories} />
        
        <div className="pt-6 flex justify-center">
          <button onClick={handleContinue} className="px-8 py-4 rounded-3xl bg-[var(--barva-primarni)] text-xl text-white font-semibold shadow-sm hover:opacity-90 transition-all duration-300 ease-in-out">
            Pokračovat
          </button>
        </div>
      </div>
    </div>
  );
}
