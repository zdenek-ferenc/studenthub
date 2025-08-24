"use client";
import { useState } from 'react';
import LanguageSelector from '../../../../components/LanguageSelector'; // Uprav cestu

type StepProps = {
  onNext: (data: { languages: string[] }) => void;
};

export default function Step4_Languages({ onNext }: StepProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const handleContinue = () => {
    onNext({ languages: selectedLanguages });
  };

  return (
    <div className="flex items-center flex-col py-24 w-2/3 mx-auto bg-white shadow-lg rounded-4xl">
      <h2 className="text-5xl text-[var(--barva-tmava)] font-bold mb-2">Jazyky</h2>
      <p className="text-gray-600 mb-6">Jakými jazyky se domluvíš?</p>
      <LanguageSelector onSelectionChange={setSelectedLanguages} />
      <button onClick={handleContinue} className="mt-8 px-14 py-4 rounded-3xl font-semibold text-white bg-[var(--barva-primarni)] text-2xl cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out">Dokončit registraci</button>
    </div>
  );
}
