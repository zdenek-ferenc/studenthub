"use client";

import { useState, useMemo } from 'react';

type Skill = {
  id: string;
  name: string;
};

type SkillSelectorProps = {
  onSelectionChange: (selectedIds: string[]) => void;
  initialSelectedIds?: string[];
  allSkills: Skill[]; 
};

const popularSkills = [
  'Marketing', 'Copywriting', 'SEO', 'Sociální sítě', 'React', 
  'Python', 'UI Design', 'UX Design', 'Figma', 'Canva', 
  'Adobe Photoshop', 'Frontend', 'Backend', 'Analýza dat'
];

export default function SkillSelector({ onSelectionChange, initialSelectedIds = [], allSkills }: SkillSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

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

  const getSkillsTitle = () => {
    if (searchTerm) return "Výsledky vyhledávání";
    if (showAll) return "Všechny dovednosti";
    return "Populární dovednosti";
  };

  return (
    <div className='flex flex-col items-center w-full'>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Hledej dovednost"
        className="w-full max-w-sm mb-8 sm:mb-12 px-6 py-3 border text-black border-gray-300 rounded-2xl focus:outline-none focus:bg-white focus:border-[var(--barva-primarni)]"
      />

      <div className="w-full max-w-4xl md:px-4 sm:px-8 flex justify-between items-center mb-8">
            <h4 className="text-xs sm:text-lg font-semibold opacity-70 text-[var(--barva-primarni)]">{getSkillsTitle()}</h4>
            {!searchTerm && (
                <button type="button" onClick={() => setShowAll(!showAll)} className="text-xs sm:text-lg font-semibold text-[var(--barva-primarni)] flex items-center gap-1">
                    {showAll ? 'Skrýt' : 'Zobrazit vše'}
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${showAll ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            )}
        </div>

      <div className="w-full max-w-4xl sm:px-8 flex flex-wrap justify-center gap-3 md:gap-4">
        {displayedSkills.map(skill => (
          <button
            key={skill.id}
            type="button"
            onClick={() => handleToggleSkill(skill.id)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[var(--barva-primarni)] rounded-full font-semibold sm:font-light text-sm sm:text-xl outline-2 transition-colors duration-200 cursor-pointer
              ${selectedIds.includes(skill.id)
                ? 'bg-[var(--barva-primarni2)]'
                : 'bg-white'
              }`}
          >
            {skill.name}
          </button>
        ))}
      </div>
    </div>
  );
}