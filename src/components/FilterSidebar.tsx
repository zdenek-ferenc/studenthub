"use client";

import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useState, useMemo, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

type Skill = {
  id: string;
  name: string;
};

type FilterSidebarProps = {
  allSkills: Skill[];
  selectedSkillIds: string[];
  setSelectedSkillIds: (ids: string[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  isMobileOpen: boolean;
  setMobileOpen: (isOpen: boolean) => void;
};

const popularSkillsList = ['Marketing', 'React', 'Python', 'UX Design', 'Figma', 'Copywriting', 'SEO', 'Frontend', 'Backend', 'Analýza dat'];

const FilterContent = ({
  allSkills,
  selectedSkillIds,
  setSelectedSkillIds,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
}: Omit<FilterSidebarProps, 'isMobileOpen' | 'setMobileOpen'>) => {
  const [skillSearch, setSkillSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const handleSkillToggle = (skillId: string) => {
    const newSelectedIds = new Set(selectedSkillIds);
    if (newSelectedIds.has(skillId)) newSelectedIds.delete(skillId);
    else newSelectedIds.add(skillId);
    setSelectedSkillIds(Array.from(newSelectedIds));
  };

  const selectedSkills = useMemo(() => 
    allSkills.filter(skill => selectedSkillIds.includes(skill.id)),
    [allSkills, selectedSkillIds]
  );
  
  const availableSkills = useMemo(() => {
    let sourceSkills = showAll ? allSkills : allSkills.filter(skill => popularSkillsList.includes(skill.name));
    if (skillSearch) {
      sourceSkills = allSkills.filter(skill => 
        skill.name.toLowerCase().includes(skillSearch.toLowerCase())
      );
    }
    return sourceSkills.filter(skill => !selectedSkillIds.includes(skill.id));
  }, [allSkills, selectedSkillIds, skillSearch, showAll]);

  return (
    <div className="bg-white h-full">
      <div className="mb-6">
        <label htmlFor="student-search" className="text-sm font-bold text-[var(--barva-tmava)] block mb-2">Vyhledej studenta</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            id="student-search"
            type="text"
            placeholder="Jméno, příjmení, bio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full leading-none pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition text-[var(--barva-tmava)]"
          />
        </div>
      </div>

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
            <option value="level">Nejvyšší úroveň</option>
          </select>
      </div>

      <div>
        <label className="text-sm font-bold text-[var(--barva-tmava)] block mb-2">
          Filtruj podle dovedností
        </label>
        
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedSkills.map(skill => (
              <button key={`selected-${skill.id}`} onClick={() => handleSkillToggle(skill.id)} className="cursor-pointer flex items-center justify-center gap-1.5 bg-[var(--barva-svetle-pozadi)] leading-none text-[var(--barva-primarni)] border border-[var(--barva-primarni)] px-3 py-2 rounded-full text-sm font-semibold transition-colors">
                {skill.name}
                <X size={14} />
              </button>
            ))}
          </div>
        )}
        
        <div className="relative mb-3 mt-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Hledej dovednost..." value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg leading-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition text-[var(--barva-tmava)]" />
        </div>
        
        <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase">
                {skillSearch ? 'Výsledky hledání' : (showAll ? 'Všechny dovednosti' : 'Populární dovednosti')}
            </h4>
            {!skillSearch && <button onClick={() => setShowAll(!showAll)} className="text-xs font-bold text-[var(--barva-primarni)] hover:underline">{showAll ? 'Zobrazit méně' : 'Zobrazit vše'}</button>}
        </div>
        
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
          {availableSkills.map(skill => (
            <button key={skill.id} onClick={() => handleSkillToggle(skill.id)} className="cursor-pointer px-3 py-1.5 rounded-full text-sm text-[var(--barva-primarni)] font-normal border bg-white border-[var(--barva-primarni)] hover:bg-[var(--barva-svetle-pozadi)] transition-colors">
              {skill.name}
            </button>
          ))}
          {availableSkills.length === 0 && <p className="text-sm text-gray-500 w-full text-center py-4">{skillSearch ? 'Žádná dovednost nenalezena.' : 'Všechny populární dovednosti jsou vybrány.'}</p>}
        </div>
      </div>
    </div>
  );
};

export default function FilterSidebar(props: FilterSidebarProps) {
  const { isMobileOpen, setMobileOpen } = props;

  return (
    <>
        <aside className="hidden lg:block w-full lg:w-80 p-6 bg-white rounded-2xl shadow-xs border border-gray-100 h-fit sticky top-28 flex-shrink-0">
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
                                <div className="flex justify-between items-center p-4 border-b">
                                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 flex items-center gap-2"><SlidersHorizontal size={20} /> Filtry</Dialog.Title>
                                    <button onClick={() => setMobileOpen(false)} className="p-1 rounded-full hover:bg-gray-100"><X size={20} /></button>
                                </div>
                                <div className="max-h-[80vh] overflow-y-auto">
                                <FilterContent {...props} />
                                </div>
                                <div className="p-4 border-t">
                                    <button onClick={() => setMobileOpen(false)} className="w-full px-6 py-2.5 rounded-full bg-[var(--barva-primarni)] text-white font-semibold">Zobrazit výsledky</button>
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