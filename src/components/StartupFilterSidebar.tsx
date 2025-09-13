"use client";

import { Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';

// Definice typů pro props
type Category = {
  id: string;
  name: string;
};

type FilterSidebarProps = {
  allCategories: Category[];
  selectedCategoryIds: string[];
  setSelectedCategoryIds: (ids: string[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
};

// Seznam populárních kategorií pro rychlý výběr
const popularCategoriesList = ['Informační technologie', 'Marketing a reklama', 'E-commerce', 'Fintech', 'Software (SaaS)', 'Mobilní aplikace', 'Zdravotnictví a wellness', 'Vzdělávání a e-learning'];

export default function StartupFilterSidebar({
  allCategories,
  selectedCategoryIds,
  setSelectedCategoryIds,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
}: FilterSidebarProps) {
  
  const [categorySearch, setCategorySearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const handleCategoryToggle = (categoryId: string) => {
    const newSelectedIds = new Set(selectedCategoryIds);
    if (newSelectedIds.has(categoryId)) {
      newSelectedIds.delete(categoryId);
    } else {
      newSelectedIds.add(categoryId);
    }
    setSelectedCategoryIds(Array.from(newSelectedIds));
  };

  // Získáme plné objekty pro vybrané kategorie
  const selectedCategories = useMemo(() => 
    allCategories.filter(cat => selectedCategoryIds.includes(cat.id)),
    [allCategories, selectedCategoryIds]
  );
  
  // Získáme kategorie k zobrazení v seznamu pro výběr
  const availableCategories = useMemo(() => {
    let sourceCategories = showAll ? allCategories : allCategories.filter(cat => popularCategoriesList.includes(cat.name));
    
    if (categorySearch) {
      sourceCategories = allCategories.filter(cat => 
        cat.name.toLowerCase().includes(categorySearch.toLowerCase())
      );
    }
    
    return sourceCategories.filter(cat => !selectedCategoryIds.includes(cat.id));
  }, [allCategories, selectedCategoryIds, categorySearch, showAll]);

  return (
    <aside className="w-full lg:w-80 p-6 bg-white rounded-2xl shadow-xs border border-gray-100 h-fit sticky top-28 flex-shrink-0">
      {/* Hlavní vyhledávání startupů */}
      <div className="mb-6">
        <label htmlFor="startup-search" className="text-sm font-bold text-gray-700 block mb-2">
          Vyhledej startup
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            id="startup-search"
            type="text"
            placeholder="Název, popis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full leading-none pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition text-[var(--barva-tmava)]"
          />
        </div>
      </div>

      {/* Řazení */}
      <div className="mb-6">
        <label htmlFor="sort-by" className="text-sm font-bold text-[var(--barva-tmava)] block mb-2">
          Seřadit podle
        </label>
        <select 
          id="sort-by"
          className="w-full text-[var(--barva-tmava)] px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition bg-white"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="match">Největší shoda</option>
          <option value="newest">Nejnovější</option>
        </select>
      </div>

      {/* Filtrování podle kategorií */}
      <div>
        <label className="text-sm font-bold text-gray-700 block mb-2">
          Filtruj podle kategorií
        </label>
        
        {/* Sekce pro vybrané kategorie */}
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCategories.map(cat => (
              <button
                key={`selected-${cat.id}`}
                onClick={() => handleCategoryToggle(cat.id)}
                className="flex items-center cursor-pointer justify-center gap-1.5 bg-[var(--barva-svetle-pozadi)] leading-none text-[var(--barva-primarni)] border border-[var(--barva-primarni)] px-3 py-2 rounded-full text-sm font-semibold transition-colors"
              >
                {cat.name}
                <X size={14} />
              </button>
            ))}
          </div>
        )}
        
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Hledej kategorii..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg leading-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition text-[var(--barva-tmava)]"
          />
        </div>
        
        <div className="flex justify-between items-center my-2 mt-6">
            <h4 className="text-xs font-semibold text-gray-500 uppercase">
                {categorySearch ? 'Výsledky hledání' : (showAll ? 'Všechny kategorie' : 'Populární kategorie')}
            </h4>
            {!categorySearch && (
                 <button onClick={() => setShowAll(!showAll)} className="text-xs font-bold text-[var(--barva-primarni)] hover:underline">
                    {showAll ? 'Zobrazit méně' : 'Zobrazit vše'}
                </button>
            )}
        </div>
        
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
          {availableCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryToggle(cat.id)}
              className="cursor-pointer px-3 py-1.5 rounded-full text-sm text-[var(--barva-primarni)] font-normal border bg-white border-[var(--barva-primarni)] hover:bg-[var(--barva-svetle-pozadi)] transition-colors"
            >
              {cat.name}
            </button>
          ))}
            {availableCategories.length === 0 && (
            <p className="text-sm text-gray-500 w-full text-center py-4">
              {categorySearch ? 'Žádná kategorie nenalezena.' : 'Všechny populární kategorie jsou vybrány.'}
            </p>
            )}
        </div>
      </div>
    </aside>
  );
}

