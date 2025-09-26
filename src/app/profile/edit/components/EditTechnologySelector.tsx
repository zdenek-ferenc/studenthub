"use client";

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { X } from 'lucide-react';

type Technology = {
  id: string;
  name: string;
};

type TechnologySelectorProps = {
  onSelectionChange: (selectedIds: string[]) => void;
  initialSelectedIds?: string[];
};

export default function TechnologySelectorEdit({ onSelectionChange, initialSelectedIds = [] }: TechnologySelectorProps) {
  const [allTechnologies, setAllTechnologies] = useState<Technology[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSelectedIds(initialSelectedIds);
  }, [initialSelectedIds]);

  useEffect(() => {
    const fetchTechnologies = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('Technology')
        .select('*')
        .order('name', { ascending: true });

      if (error) console.error("Chyba při načítání technologií:", error);
      else setAllTechnologies(data || []);
      setLoading(false);
    };
    fetchTechnologies();
  }, []);

  const handleToggleTechnology = (techId: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(techId)) newSelectedIds.delete(techId);
    else newSelectedIds.add(techId);
    
    const updatedIds = Array.from(newSelectedIds);
    setSelectedIds(updatedIds);
    onSelectionChange(updatedIds);
  };

  const selectedTechnologiesObjects = useMemo(() => {
    return allTechnologies.filter(tech => selectedIds.includes(tech.id));
  }, [allTechnologies, selectedIds]);

  const availableTechnologies = useMemo(() => {
    const technologies = allTechnologies.filter(tech => !selectedIds.includes(tech.id));
    if (searchTerm) {
      return technologies.filter(tech => 
        tech.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return technologies;
  }, [allTechnologies, selectedIds, searchTerm]);

  if (loading) return <p className='text-sm text-gray-500'>Načítám technologie...</p>;

  return (
    <div className='w-full space-y-6'>
      <div>
        <h4 className="text-md font-semibold text-[var(--barva-tmava)] mb-2">Váš Tech Stack</h4>
        <div className="p-3 bg-gray-50 rounded-lg min-h-[4rem] flex flex-wrap gap-2 border">
          {selectedTechnologiesObjects.map(tech => (
            <button key={tech.id} type="button" onClick={() => handleToggleTechnology(tech.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold hover:opacity-70 transition-all">
              {tech.name} <X size={14} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-md font-semibold text-[var(--barva-tmava)] mb-2">Přidat technologie</h4>
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Hledej technologii (např. React)..."
          className="w-full px-4 py-2 mb-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--barva-primarni)]"
        />
        <div className="p-3 bg-white rounded-lg max-h-60 overflow-y-auto flex flex-wrap gap-2 border">
          {availableTechnologies.map(tech => (
            <button key={tech.id} type="button" onClick={() => handleToggleTechnology(tech.id)}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-gray-100 transition-colors">
              + {tech.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}