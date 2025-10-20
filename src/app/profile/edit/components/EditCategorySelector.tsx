"use client";

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { X } from 'lucide-react';

type Category = {
  id: string;
  name: string;
};

type CategorySelectorProps = {
  onSelectionChange: (selectedIds: string[]) => void;
  initialSelectedIds?: string[];
};

export default function CategorySelectorEdit({ onSelectionChange, initialSelectedIds = [] }: CategorySelectorProps) {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    setSelectedIds(initialSelectedIds);
  }, [initialSelectedIds]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('Category')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error("Chyba při načítání kategorií:", error);
      } else {
        setAllCategories(data || []);
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
  };

  const selectedCategoriesObjects = useMemo(() => {
    return allCategories.filter(cat => selectedIds.includes(cat.id));
  }, [allCategories, selectedIds]);

  const availableCategories = useMemo(() => {
    const categories = allCategories.filter(cat => !selectedIds.includes(cat.id));
    if (searchTerm) {
      return categories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return categories;
  }, [allCategories, selectedIds, searchTerm]);

  if (loading) {
    return <p className='text-sm text-gray-500'>Načítám kategorie...</p>;
  }

  return (
    <div className='w-full space-y-6'>
      <div>
        <h4 className="text-md font-semibold text-[var(--barva-tmava)] mb-2">Vaše kategorie</h4>
        <div className="py-2 flex flex-wrap gap-2">
          {selectedCategoriesObjects.length > 0 ? (
            selectedCategoriesObjects.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleToggleCategory(cat.id)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--barva-svetle-pozadi)] border border-[var(--barva-primarni)] text-[var(--barva-primarni)] rounded-lg text-sm font-semibold hover:opacity-80 transition-all ease-in-out duration-200 cursor-pointer"
              >
                {cat.name}
                <X size={14} />
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-400 p-2">Zatím nemáte vybrané žádné kategorie.</p>
          )}
        </div>
      </div>
      <div>
        <h4 className="text-md font-semibold text-[var(--barva-tmava)] mb-2">Přidat kategorie</h4>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Hledej kategorii (např. E-commerce)..."
          className="w-full px-4 py-2 mb-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-0"
        />
        <div className="py-3 max-h-60 overflow-y-auto flex flex-wrap gap-2">
          {availableCategories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleToggleCategory(cat.id)}
              className="cursor-pointer px-3 py-1.5 bg-white text-gray-700 border border-gray-700 rounded-lg text-sm hover:bg-[var(--barva-svetle-pozadi)] hover:text-[var(--barva-primarni)] hover:border-[var(--barva-primarni)]  transition-all ease-in-out duration-200"
            >
              + {cat.name}
            </button>
          ))}
          {searchTerm && availableCategories.length === 0 && (
            <p className="text-sm text-gray-400 p-2">Kategorie nenalezena.</p>
          )}
        </div>
      </div>
    </div>
  );
}
