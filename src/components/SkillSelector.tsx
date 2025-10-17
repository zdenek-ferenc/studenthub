"use client";

import { useState,useRef, useMemo, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react'; 

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
  const didInit = useRef(false); 
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!didInit.current) {
      setSelectedIds(initialSelectedIds);
      didInit.current = true;
    }
  }, [initialSelectedIds]);

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

  const selectedSkillsObjects = useMemo(() => {
    return allSkills.filter(skill => selectedIds.includes(skill.id));
  }, [allSkills, selectedIds]);

  const availableSkills = useMemo(() => {
    const sourceSkills = showAll ? allSkills : allSkills.filter(skill => popularSkills.includes(skill.name));
    let filteredSkills = sourceSkills.filter(skill => !selectedIds.includes(skill.id));

    if (searchTerm) {
      filteredSkills = allSkills.filter(skill => 
        !selectedIds.includes(skill.id) &&
        skill.name.toLowerCase().split(' ').some(word => 
          word.startsWith(searchTerm.toLowerCase())
        )
      );
    }
    return filteredSkills;
  }, [searchTerm, allSkills, showAll, selectedIds]);

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
        className="px-3 py-1.5 sm:px-5 sm:py-2 text-[var(--barva-primarni)] rounded-full font-base sm:font-light text-sm sm:text-xl outline-1 md:outline-2 transition-colors duration-200 cursor-text focus:outline-2 outline-[var(--barva-primarni)]"
      />
      {selectedSkillsObjects.length > 0 && (
        <div className="w-full max-w-4xl sm:px-8 flex flex-wrap gap-3 md:gap-4 md:mb-6 pt-4">
            {selectedSkillsObjects.map(skill => (
                <button
                    key={`selected-${skill.id}`}
                    type="button"
                    onClick={() => handleToggleSkill(skill.id)}
                    className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-[var(--barva-primarni)] bg-sky-100 rounded-full font-base sm:font-light text-sm sm:text-xl outline-1 md:outline-2 transition-colors duration-200 cursor-pointer"
                >
                    {skill.name}
                    <X size={20} className='w-4 h-4' />
                </button>
            ))}
        </div>
      )}

      <div className="w-full max-w-4xl md:px-4 sm:px-8 flex justify-between items-center mb-8">
            <h4 className="text-xs sm:text-lg font-semibold opacity-70 text-[var(--barva-primarni)]">{getSkillsTitle()}</h4>
            {!searchTerm && (
                <button type="button" onClick={() => setShowAll(!showAll)} className="text-xs sm:text-lg font-semibold text-[var(--barva-primarni)] flex items-center gap-1">
                    {showAll ? 'Skrýt' : 'Zobrazit vše'}
                    <ChevronDown className={`h-5 w-5 transition-transform ${showAll ? 'rotate-180' : ''}`} />
                </button>
            )}
        </div>

      <div className="w-full max-w-4xl pt-4 sm:px-8 flex flex-wrap justify-center gap-3 md:gap-4 min-h-[12rem] content-start">
        {availableSkills.map(skill => (
          <button
            key={skill.id}
            type="button"
            onClick={() => handleToggleSkill(skill.id)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[var(--barva-primarni)] rounded-full font-semibold sm:font-light text-sm sm:text-xl outline-1 md:outline-2 transition-colors duration-200 cursor-pointer
              ${selectedIds.includes(skill.id)
                ? 'bg-[var(--barva-primarni2)]'
                : 'bg-white hover:bg-[var(--barva-svetle-pozadi)] border border-[var(--barva-primarni2)]'
              }`}
          >
            {skill.name}
          </button>
        ))}
        {searchTerm && availableSkills.length === 0 && <p className="text-sm text-gray-500 py-4">Dovednost nenalezena.</p>}
      </div>
    </div>
  );
}