"use client";

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';

type Skill = {
  id: string;
  name: string;
};

type SkillSelectorProps = {
  onSelectionChange: (selectedIds: string[]) => void;
  initialSelectedIds?: string[];
};

// Seznam nejdůležitějších dovedností, které se zobrazí na začátku
const popularSkills = [
  'Marketing', 'Copywriting', 'SEO', 'Sociální sítě', 'React', 
  'Python', 'UI Design', 'UX Design', 'Figma', 'Canva', 
  'Adobe Photoshop', 'Frontend', 'Backend', 'Analýza dat'
];

export default function SkillSelector({ onSelectionChange, initialSelectedIds = [] }: SkillSelectorProps) {
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  // Nový stav pro zobrazení všech dovedností
  const [showAll, setShowAll] = useState(false);

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
        setAllSkills(data || []);
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

  // Logika pro zobrazení dovedností
  const displayedSkills = useMemo(() => {
    if (searchTerm) {
      return allSkills.filter(skill => 
        skill.name.toLowerCase().split(' ').some(word => 
          word.startsWith(searchTerm.toLowerCase())
        )
      );
    }
    if (showAll) {
      return allSkills;
    }
    return allSkills.filter(skill => popularSkills.includes(skill.name));
  }, [searchTerm, allSkills, showAll]);

  // Dynamický nadpis
  const getSkillsTitle = () => {
    if (searchTerm) return "Výsledky vyhledávání";
    if (showAll) return "Všechny dovednosti";
    return "Populární dovednosti";
  };

  if (loading) {
    return <p className='text-[var(--barva-primarni)] text-4xl font-bold'>Načítám dovednosti...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className='flex flex-col items-center'>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Hledej dovednost"
        className="flex min-w-[24rem] content-start m-auto mb-12 px-6 py-3 border text-black border-gray-300 rounded-2xl focus:outline-none focus:bg-white focus:border-[var(--barva-primarni)]"
      />

      {/* Nadpis a tlačítko pro zobrazení všech */}
      <div className="w-full flex justify-between items-center px-32 mb-8">
            <h4 className="text-lg font-semibold opacity-70 text-[var(--barva-primarni)]">{getSkillsTitle()}</h4>
            {!searchTerm && (
                <button type="button" onClick={() => setShowAll(!showAll)} className="text-md font-semibold text-[var(--barva-primarni)] flex items-center gap-1">
                    {showAll ? 'Skrýt' : 'Zobrazit vše'}
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${showAll ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            )}
        </div>

      {/* Zde se zobrazují skill bubliny */}
      <div className="flex flex-wrap justify-center gap-8 px-32">
        {displayedSkills.map(skill => (
          <button
            key={skill.id}
            type="button"
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
