"use client";

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient'; // Uprav cestu, pokud je potřeba

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

export default function SkillSelectorChallenge({ onSelectionChange, initialSelectedIds = [] }: SkillSelectorProps) {
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // Nový stav pro zobrazení všech dovedností
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      const { data, error } = await supabase
        .from('Skill')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error("Chyba při načítání dovedností:", error);
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
  };

  const displayedSkills = useMemo(() => {
    // Pokud uživatel hledá, má to nejvyšší prioritu
    if (searchTerm) {
      return allSkills.filter(skill =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Pokud chce zobrazit všechny, zobrazíme všechny
    if (showAll) {
      return allSkills;
    }
    // Jinak zobrazíme jen ty populární
    return allSkills.filter(skill => popularSkills.includes(skill.name));
  }, [searchTerm, allSkills, showAll]);

  // Dynamický nadpis pro sekci s dovednostmi
  const getSkillsTitle = () => {
    if (searchTerm) return "Výsledky vyhledávání";
    if (showAll) return "Všechny dovednosti";
    return "Populární dovednosti";
  };

  if (loading) {
    return <p className="text-gray-500">Načítám dovednosti...</p>;
  }

  return (
    <div className="w-full bg-white rounded-lg p-3 mt-3">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Hledej dovednost (např. React)"
        className="w-full text-[var(--barva-primarni)] border-0 focus:outline-none p-2"
      />
      
      <div className="min-h-[6rem]">
        {/* Zobrazíme nejdříve vybrané dovednosti */}
        <div className="flex flex-wrap gap-3 mb-3 border-b-2 border-[var(--barva-svetle-pozadi)] py-6">
          {selectedIds.map(id => {
            const skill = allSkills.find(s => s.id === id);
            if (!skill) return null;
            return (
              <button
                key={`selected-${skill.id}`}
                type="button"
                onClick={() => handleToggleSkill(skill.id)}
                className="px-4 py-1 text-[var(--barva-primarni)] bg-[#F1F8FF] font-semibold rounded-full text-md outline-2 transition-colors duration-200 cursor-pointer"
              >
                {skill.name}
                <span className='ml-2 font-semibold'>&times;</span>
              </button>
            );
          })}
        </div>
        
        {/* Nadpis a tlačítko pro zobrazení všech */}
        <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-semibold opacity-70 text-[var(--barva-primarni)]">{getSkillsTitle()}</h4>
            {!searchTerm && (
                <button type="button" onClick={() => setShowAll(!showAll)} className="text-sm font-semibold text-[var(--barva-primarni)] flex items-center gap-1">
                    {showAll ? 'Skrýt' : 'Zobrazit vše'}
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            )}
        </div>

        {/* Poté zobrazíme zbytek (nevybrané) */}
        <div className="flex flex-wrap gap-3">
          {displayedSkills.filter(skill => !selectedIds.includes(skill.id)).map(skill => (
            <button
              key={skill.id}
              type="button"
              onClick={() => handleToggleSkill(skill.id)}
              className="px-4 py-1 text-[var(--barva-primarni)] rounded-full font-normal text-md outline-2 transition-colors duration-200 cursor-pointer"
            >
              {skill.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
