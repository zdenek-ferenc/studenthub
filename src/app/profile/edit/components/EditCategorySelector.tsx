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

  // Efekt pro synchronizaci, pokud se změní initialSelectedIds zvenčí
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
      {/* Sekce pro již vybrané kategorie */}
      <div>
        <h4 className="text-md font-semibold text-[var(--barva-tmava)] mb-2">Vaše kategorie</h4>
        <div className="p-3 bg-gray-50 rounded-lg min-h-[4rem] flex flex-wrap gap-2 border">
          {selectedCategoriesObjects.length > 0 ? (
            selectedCategoriesObjects.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleToggleCategory(cat.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--barva-primarni2)] text-[var(--barva-primarni)] rounded-full text-sm font-semibold hover:opacity-70 transition-all ease-in-out duration-100 cursor-pointer"
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

      {/* Sekce pro přidání nových kategorií */}
      <div>
        <h4 className="text-md font-semibold text-[var(--barva-tmava)] mb-2">Přidat kategorie</h4>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Hledej kategorii (např. E-commerce)..."
          className="w-full px-4 py-2 mb-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--barva-primarni)]"
        />
        <div className="p-3 bg-white rounded-lg max-h-60 overflow-y-auto flex flex-wrap gap-2 border">
          {availableCategories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleToggleCategory(cat.id)}
              className="cursor-pointer px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-[var(--barva-svetle-pozadi)] hover:border-[var(--barva-primarni)] hover:text-[var(--barva-primarni)] transition-all ease-in-out duration-100"
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
