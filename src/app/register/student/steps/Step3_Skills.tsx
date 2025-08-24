"use client";
import { useState } from 'react';
import SkillSelector from '../../../../components/SkillSelector'; // Uprav cestu, pokud je potřeba

type StepProps = {
  onNext: (data: { skills: string[] }) => void;
};

export default function Step3_Skills({ onNext }: StepProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const handleContinue = () => {
    onNext({ skills: selectedSkills });
  };

  return (
    <div className="flex items-center flex-col py-24 w-2/3 mx-auto bg-white shadow-lg rounded-4xl">
      <h2 className="text-5xl text-[var(--barva-tmava)] font-bold mb-2">Zvol si své dovednosti</h2>
      <p className="text-gray-600 mb-6">Vyber vše, co umíš. Pomůže ti to najít relevantní výzvy.</p>
      <SkillSelector onSelectionChange={setSelectedSkills} />
      <button onClick={handleContinue} className="mt-8 px-14 py-4 rounded-3xl font-semibold text-white bg-[var(--barva-primarni)] text-2xl cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out">Pokračovat</button>
      {/* Tento blok je jen pro ukázku, abys viděl, že se stav mění */}
      <div className="mt-8 p-4 bg-gray-100 rounded-md">
        <h3 className="font-semibold text-black">testing: Aktuálně vybrané IDčka dovedností:</h3>
        <p className="text-sm text-black">{selectedSkills.join(', ')}</p>
      </div>
    </div>
  );
}