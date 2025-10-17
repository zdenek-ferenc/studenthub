"use client";

import { useState, useRef, useMemo, useEffect } from 'react';
import { X } from 'lucide-react';

type Category = {
  id: string;
  name: string;
};

type CategorySelectorProps = {
  onSelectionChange: (selectedIds: string[]) => void;
  initialSelectedIds?: string[];
  allCategories: Category[];
};

export default function CategorySelector({ onSelectionChange, initialSelectedIds = [], allCategories }: CategorySelectorProps) {
  const didInit = useRef(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!didInit.current) {
      setSelectedIds(initialSelectedIds);
      didInit.current = true;
    }
  }, [initialSelectedIds]);

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
    let categories = allCategories.filter(cat => !selectedIds.includes(cat.id));
    
    if (searchTerm) {
      categories = categories.filter(category => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return category.name.toLowerCase().split(' ').some(word => 
          word.startsWith(lowerCaseSearchTerm)
        );
      });
    }
    return categories;
  }, [allCategories, selectedIds, searchTerm]);

  return (
    <div className='flex flex-col items-center'>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Hledej kategorii"
        className="px-3 py-1.5 sm:px-4 sm:py-2 text-[var(--barva-primarni)] rounded-2xl font-semibold sm:font-light text-sm sm:text-xl outline-1 transition-colors duration-200 cursor-text focus:outline-2 outline-[var(--barva-primarni)]"
      />
      {selectedCategoriesObjects.length > 0 && (
        <div className="w-full max-w-4xl sm:px-8 flex flex-wrap gap-3 md:gap-4 md:mb-6 pt-4">
            {selectedCategoriesObjects.map(category => (
                <button
                    key={`selected-${category.id}`}
                    type="button"
                    onClick={() => handleToggleCategory(category.id)}
                    className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-[var(--barva-primarni)] bg-sky-100 rounded-full font-baset sm:font-light text-sm sm:text-xl outline-1 md:outline-2 transition-colors duration-200 cursor-pointer"
                >
                    {category.name}
                    <X size={20} className='w-4 h-4' />
                </button>
            ))}
        </div>
      )}

      <div className="w-full max-w-4xl pt-6 md:pt-12 sm:px-8 flex flex-wrap justify-center gap-3 md:gap-4 min-h-[12rem] content-start">
        {availableCategories.map(category => (
          <button
            key={category.id}
            type="button"
            onClick={() => handleToggleCategory(category.id)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[var(--barva-primarni)] rounded-full font-base sm:font-light text-sm sm:text-xl outline-1 md:outline-2 transition-colors duration-200 cursor-pointer
              bg-white hover:bg-[var(--barva-svetle-pozadi)] border border-[var(--barva-primarni2)]
            `}
          >
            {category.name}
          </button>
        ))}
        {searchTerm && availableCategories.length === 0 && <p className="text-sm text-gray-500 py-4">Kategorie nenalezena.</p>}
        {!searchTerm && availableCategories.length === 0 && selectedCategoriesObjects.length > 0 && <p className="text-sm text-gray-500 py-4">Všechny kategorie jsou vybrány.</p>}
      </div>
    </div>
  );
}