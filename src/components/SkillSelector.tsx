// src/components/SkillSelector.tsx

"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

type Skill = {
  id: string;
  name: string;
};

type SkillSelectorProps = {
  onSelectionChange: (selectedIds: string[]) => void;
  initialSelectedIds?: string[];
};

export default function SkillSelector({ onSelectionChange, initialSelectedIds = [] }: SkillSelectorProps) {
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Stav pro vyhledávací text ---
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('Skill')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error("Chyba při načítání dovedností:", error);
        setError("Nepodařilo se načíst dovednosti.");
      } else {
        setAllSkills(data);
      }
      setLoading(false);
    };

    fetchSkills();
  }, []);

const handleToggleSkill = (skillId: string) => {
  const newSelectedIds = new Set(selectedIds);
  if (newSelectedIds.has(skillId)) {
    newSelectedIds.delete(skillId);
  } else {
    newSelectedIds.add(skillId);
  }
  
  const updatedIds = Array.from(newSelectedIds);
  setSelectedIds(updatedIds);
  onSelectionChange(updatedIds);
  setSearchTerm('');
};

const filteredSkills = allSkills.filter(skill => {
  // Převedeme hledaný výraz na malá písmena jen jednou
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  
  // Rozdělíme název dovednosti na jednotlivá slova a zkontrolujeme každé z nich
  return skill.name.toLowerCase().split(' ').some(word => 
    word.startsWith(lowerCaseSearchTerm)
  );
});

  if (loading) {
    return <p className='text-[var(--barva-primarni)] text-4xl font-bold'>Načítám dovednosti...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className='flex flex-col items-center'>
      {/*Vyhledávací políčko*/}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Hledej dovednost"
        className="flex min-w-[24rem] content-start m-auto mb-12 px-6 py-3 border text-black border-gray-300 rounded-2xl focus:outline-none focus:bg-white focus:border-[var(--barva-primarni)]"
      />

      {/* Zde se zobrazují skill bubliny" */}
      <div className="flex flex-wrap justify-center gap-8 px-32">
        {filteredSkills.map(skill => (
          <button
          key={skill.id}
          onClick={() => handleToggleSkill(skill.id)}
          className={`px-6 py-2 text-[var(--barva-primarni)] rounded-full font-light text-3xl outline-2 transition-colors duration-200 cursor-pointer
            ${selectedIds.includes(skill.id)
              ? 'bg-[var(--barva-primarni2)]' // Styl pro vybranou bublinu
              : 'bg-white' // Styl pro nevybranou
            }`}
        >
          {skill.name}
        </button>
        ))}
      </div>
    </div>
  );
}