"use client";

import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useState, useMemo, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

type Category = { id: string; name: string; };

type FilterSidebarProps = {
  allCategories: Category[];
  selectedCategoryIds: string[];
  setSelectedCategoryIds: (ids: string[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  isMobileOpen: boolean;
  setMobileOpen: (isOpen: boolean) => void;
};

const popularCategoriesList = ['Informační technologie', 'Marketing a reklama', 'E-commerce', 'Fintech', 'Software (SaaS)', 'Mobilní aplikace', 'Zdravotnictví a wellness', 'Vzdělávání a e-learning'];

const FilterContent = ({
  allCategories,
  selectedCategoryIds,
  setSelectedCategoryIds,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
}: Omit<FilterSidebarProps, 'isMobileOpen' | 'setMobileOpen'>) => {
  const [categorySearch, setCategorySearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const handleCategoryToggle = (categoryId: string) => {
    const newSelectedIds = new Set(selectedCategoryIds);
    if (newSelectedIds.has(categoryId)) newSelectedIds.delete(categoryId);
    else newSelectedIds.add(categoryId);
    setSelectedCategoryIds(Array.from(newSelectedIds));
  };

  const selectedCategories = useMemo(() => 
    allCategories.filter(cat => selectedCategoryIds.includes(cat.id)),
    [allCategories, selectedCategoryIds]
  );
  
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
    <div className="bg-white h-full">
      <div className="mb-6">
        <label htmlFor="startup-search" className="text-sm font-bold text-[var(--barva-tmava)] block mb-2">Vyhledej startup</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 w-3 3xl:w-4 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            id="startup-search" 
            type="text" 
            placeholder="Název, popis..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full leading-none pl-8 3xl:pl-10 pr-4 py-1.5 text-sm 3xl:text-base 3xl:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition text-[var(--barva-tmava)]" />
        </div>
      </div>
      <div className="mb-6">
        <label htmlFor="sort-by" className="text-sm font-bold text-[var(--barva-tmava)] block mb-2">Seřadit podle</label>
        <select id="sort-by" className="w-full text-[var(--barva-tmava)] text-sm 3xl:text-base px-2 3xl:px-4 py-2 3xl:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition bg-white" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="match">Největší shoda</option>
          <option value="newest">Nejnovější</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-bold text-[var(--barva-tmava)] block mb-2">Filtruj podle kategorií</label>
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCategories.map(cat => (
              <button key={`selected-${cat.id}`} onClick={() => handleCategoryToggle(cat.id)} className="flex items-center cursor-pointer justify-center gap-1.5 bg-[var(--barva-svetle-pozadi)] leading-none text-[var(--barva-primarni)] border border-[var(--barva-primarni)] px-3 py-2 rounded-full text-sm font-semibold transition-colors">
                {cat.name}
                <X size={14} />
              </button>
            ))}
          </div>
        )}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 w-3 3xl:w-4 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Hledej kategorii..." value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} className="w-full leading-none pl-8 3xl:pl-10 pr-4 py-1.5 text-sm 3xl:text-base 3xl:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition text-[var(--barva-tmava)]" />
        </div>
        <div className="flex justify-between items-center my-2 mt-6">
            <h4 className="text-xs font-semibold text-gray-500 uppercase">{categorySearch ? 'Výsledky hledání' : (showAll ? 'Všechny kategorie' : 'Populární kategorie')}</h4>
            {!categorySearch && <button onClick={() => setShowAll(!showAll)} className="text-xs font-bold text-[var(--barva-primarni)] cursor-pointer hover:underline">{showAll ? 'Zobrazit méně' : 'Zobrazit vše'}</button>}
        </div>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
          {availableCategories.map(cat => (
            <button key={cat.id} onClick={() => handleCategoryToggle(cat.id)} className="cursor-pointer px-2 py-1 rounded-full text-sm text-[var(--barva-primarni)] font-normal border bg-white border-[var(--barva-primarni)] hover:bg-[var(--barva-svetle-pozadi)] transition-colors">
              {cat.name}
            </button>
          ))}
            {availableCategories.length === 0 && <p className="text-sm text-gray-500 w-full text-center py-4">{categorySearch ? 'Žádná kategorie nenalezena.' : 'Všechny populární kategorie jsou vybrány.'}</p>}
        </div>
      </div>
    </div>
  );
};

export default function StartupFilterSidebar(props: FilterSidebarProps) {
  const { isMobileOpen, setMobileOpen } = props;

  return (
    <>
      <aside className="hidden lg:block w-full lg:w-80 p-4 3xl:p-6 bg-white rounded-2xl shadow-xs border border-gray-100 h-fit sticky top-28 flex-shrink-0">
        <FilterContent {...props} />
      </aside>

      <Transition appear show={isMobileOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={() => setMobileOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all p-6">
                  <div className="flex justify-between items-center pb-4">
                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-[var(--barva-primarni)] flex items-center gap-2"><SlidersHorizontal size={20} /> Filtry</Dialog.Title>
                    <button onClick={() => setMobileOpen(false)} className="p-1 rounded-full text-[var(--barva-primarni)] hover:bg-gray-100"><X size={20} /></button>
                  </div>
                  <div className="max-h-[80vh] overflow-y-auto">
                    <FilterContent {...props} />
                  </div>
                  <div className="pt-6 flex justify-center">
                    <button onClick={() => setMobileOpen(false)} className="px-6 py-2.5 text-sm rounded-full bg-[var(--barva-primarni)] text-white font-semibold">Zobrazit výsledky</button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}