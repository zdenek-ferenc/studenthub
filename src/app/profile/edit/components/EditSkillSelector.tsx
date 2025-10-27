"use client";

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { X } from 'lucide-react';

type Skill = {
  id: string;
  name: string;
};

type SkillSelectorProps = {
  onSelectionChange: (selectedIds: string[]) => void;
  initialSelectedIds?: string[];
};

export default function SkillSelectorEdit({ onSelectionChange, initialSelectedIds = [] }: SkillSelectorProps) {
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    setSelectedIds(initialSelectedIds);
  }, [initialSelectedIds]);


  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true);
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

  const selectedSkillsObjects = useMemo(() => {
    return allSkills.filter(skill => selectedIds.includes(skill.id));
  }, [allSkills, selectedIds]);

  const availableSkills = useMemo(() => {
    const skills = allSkills.filter(skill => !selectedIds.includes(skill.id));
    if (searchTerm) {
      return skills.filter(skill => 
        skill.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return skills;
  }, [allSkills, selectedIds, searchTerm]);

  if (loading) {
    return <p className='text-sm text-gray-500'>Načítám dovednosti...</p>;
  }

  return (
    <div className='w-full space-y-6'>
      <div>
        <h4 className="text-md font-semibold text-[var(--barva-tmava)] mb-2">Tvoje dovednosti</h4>
        <div className="p-3 bg-gray-50/50 rounded-lg min-h-[4rem] flex flex-wrap gap-2 border">
          {selectedSkillsObjects.length > 0 ? (
            selectedSkillsObjects.map(skill => (
              <button
                key={skill.id}
                type="button"
                onClick={() => handleToggleSkill(skill.id)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--barva-svetle-pozadi)] border border-[var(--barva-primarni)] text-[var(--barva-primarni)] rounded-full text-sm font-semibold hover:opacity-70 transition-all ease-in-out duration-300 cursor-pointer"
              >
                {skill.name}
                <X size={14} />
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-400 p-2">Zatím nemáš vybrané žádné dovednosti.</p>
          )}
        </div>
      </div>
      <div>
        <h4 className="text-md font-semibold text-[var(--barva-tmava)] mb-2">Přidat dovednosti</h4>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Hledej dovednost (např. React)..."
          className="w-full px-4 py-2 mb-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--barva-primarni)]"
        />
        <div className="p-3 bg-white rounded-lg max-h-60 overflow-y-auto flex flex-wrap gap-2 border">
          {availableSkills.map(skill => (
            <button
              key={skill.id}
              type="button"
              onClick={() => handleToggleSkill(skill.id)}
              className="px-3 py-1.5 bg-white border border-gray-400 cursor-pointer text-gray-700 rounded-full text-sm hover:bg-[var(--barva-svetle-pozadi)] hover:border-[var(--barva-primarni)] hover:text-[var(--barva-primarni)] transition-colors"
            >
              + {skill.name}
            </button>
          ))}
          {searchTerm && availableSkills.length === 0 && (
            <p className="text-sm text-gray-400 p-2">Dovednost nenalezena.</p>
          )}
        </div>
      </div>
    </div>
  );
}
