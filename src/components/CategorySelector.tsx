// src/components/CategorySelector.tsx

"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Přejmenovali jsme typ z Skill na Category
type Category = {
  id: string;
  name: string;
};

// Přejmenovali jsme props
type CategorySelectorProps = {
  onSelectionChange: (selectedIds: string[]) => void;
  initialSelectedIds?: string[];
};

export default function CategorySelector({ onSelectionChange, initialSelectedIds = [] }: CategorySelectorProps) {
  // Přejmenovali jsme všechny stavy a funkce
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      // ZMĚNA: Dotazujeme se do tabulky "Category" místo "Skill"
      const { data, error } = await supabase
        .from('Category')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error("Chyba při načítání kategorií:", error);
        setError("Nepodařilo se načíst kategorie.");
      } else {
        setAllCategories(data);
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  const handleToggleCategory = (categoryId: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(categoryId)) {
      newSelectedIds.delete(categoryId);
    } else {
      newSelectedIds.add(categoryId);
    }
    
    const updatedIds = Array.from(newSelectedIds);
    setSelectedIds(updatedIds);
    onSelectionChange(updatedIds);
    setSearchTerm('');
  };

  const filteredCategories = allCategories.filter(category => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return category.name.toLowerCase().split(' ').some(word => 
      word.startsWith(lowerCaseSearchTerm)
    );
  });

  if (loading) {
    // Změnili jsme text
    return <p className='text-center text-[var(--barva-primarni)] text-4xl font-bold'>Načítám kategorie...</p>;
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
        // Změnili jsme placeholder
        placeholder="Hledej kategorii"
        className="flex min-w-[24rem] content-start m-auto mb-12 px-6 py-3 border text-black border-gray-300 rounded-2xl focus:outline-none focus:bg-white focus:border-[var(--barva-primarni)]"
      />

      <div className="flex flex-wrap justify-center gap-8 px-32">
        {/* Procházíme vyfiltrované kategorie */}
        {filteredCategories.map(category => (
          <button
            key={category.id}
            onClick={() => handleToggleCategory(category.id)}
            className={`px-6 py-2 text-[var(--barva-primarni)] rounded-full font-light text-3xl outline-2 transition-colors duration-200 cursor-pointer
              ${selectedIds.includes(category.id)
                ? 'bg-[var(--barva-primarni2)]' // Styl pro vybranou bublinu
                : 'bg-white' // Styl pro nevybranou
              }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
