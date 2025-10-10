"use client";

import { useState, useMemo } from 'react';

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
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredCategories = useMemo(() => {
    return allCategories.filter(category => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return category.name.toLowerCase().split(' ').some(word => 
        word.startsWith(lowerCaseSearchTerm)
      );
    });
  }, [allCategories, searchTerm]);

  return (
    <div className='flex flex-col items-center'>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Hledej kategorii"
        className="flex min-w-[24rem] content-start m-auto mb-12 px-6 py-3 border text-black border-gray-300 rounded-2xl focus:outline-none focus:bg-white focus:border-[var(--barva-primarni)]"
      />

      <div className="w-full max-w-4xl sm:px-8 flex flex-wrap justify-center gap-3 md:gap-4 min-h-[12rem] content-start">
        {filteredCategories.map(category => (
          <button
            key={category.id}
            onClick={() => handleToggleCategory(category.id)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[var(--barva-primarni)] rounded-full font-semibold sm:font-light text-sm sm:text-xl outline-2 transition-colors duration-200 cursor-pointer
              ${selectedIds.includes(category.id)
                ? 'bg-[var(--barva-primarni2)]' 
                : 'bg-white' 
              }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}