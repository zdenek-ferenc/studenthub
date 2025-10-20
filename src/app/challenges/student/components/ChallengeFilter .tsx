"use client";

import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useState, useMemo, Fragment } from 'react';
import { Dialog, Transition, Popover } from '@headlessui/react';

type Skill = {
  id: string;
  name: string;
};

type ChallengeFilterProps = {
  allSkills: Skill[];
  studentSkills: Skill[]; 
  selectedSkillIds: string[];
  setSelectedSkillIds: (ids: string[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  isMobileOpen: boolean;
  setMobileOpen: (isOpen: boolean) => void;
};

const popularSkillsListFallback = ['Marketing', 'React', 'Python', 'UX Design', 'Figma', 'Copywriting', 'SEO', 'Frontend', 'Backend', 'Analýza dat'];

const DesktopFilterContent = ({
    allSkills,
    studentSkills, 
    selectedSkillIds,
    setSelectedSkillIds,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
}: Omit<ChallengeFilterProps, 'isMobileOpen' | 'setMobileOpen'>) => {
  const [skillSearch, setSkillSearch] = useState('');

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
  
  const availableSkillsInPopover = useMemo(() => {
    let skills = allSkills.filter(skill => !selectedSkillIds.includes(skill.id));
    if (skillSearch) {
      skills = skills.filter(skill => 
          skill.name.toLowerCase().includes(skillSearch.toLowerCase())
      );
    }
    return skills;
  }, [allSkills, selectedSkillIds, skillSearch]);
  

  const quickSelectSkills = studentSkills.length > 0 ? studentSkills : popularSkillsListFallback.map(name => allSkills.find(s => s.name === name)).filter((s): s is Skill => !!s);


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSkillIds([]);
    setSortBy('recommended');
  }

  return (
    <div className="space-y-3">
        <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm w-full flex flex-col md:flex-row items-center gap-2">
            <div className="relative w-full flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    id="challenge-search"
                    type="text"
                    placeholder="Hledej výzvu, dovednost..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--barva-primarni)] transition text-[var(--barva-tmava)] bg-gray-50 md:bg-transparent"
                />
            </div>
            <div className="w-full md:w-auto md:border-l border-gray-100 md:pl-2">
                <select 
                    id="sort-by"
                    className="w-full text-[var(--barva-tmava)] py-3 px-4 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--barva-primarni)] transition bg-gray-50 md:bg-transparent cursor-pointer appearance-none"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="recommended">Doporučené</option>
                    <option value="newest">Nejnovější</option>
                    <option value="ending_soon">Brzy končí</option>
                    <option value="highest_reward">Nejvyšší odměna</option>
                </select>
            </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm w-full space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-500 mr-2">Tvoje dovednosti:</span>
                {quickSelectSkills.map(skill => {
                    if (selectedSkillIds.includes(skill.id)) return null;
                    return (
                        <button key={skill.id} onClick={() => handleSkillToggle(skill.id)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer">
                            {skill.name}
                        </button>
                    );
                })}
                <Popover className="relative">
                    {({ open }) => (
                        <>
                        <Popover.Button className="flex items-center gap-2 text-sm font-medium py-1.5 px-3 rounded-full border-2 border-dashed border-gray-300 text-gray-500 hover:border-[var(--barva-primarni)] hover:text-[var(--barva-primarni)] transition">
                            <span>Další</span>
                            <ChevronDown className={`transition-transform ${open ? 'rotate-180' : ''}`} size={16} />
                        </Popover.Button>
                        <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
                            <Popover.Panel className="absolute z-10 mt-2 w-72 bg-white shadow-lg rounded-lg p-4 border border-gray-100">
                                <input type="text" placeholder="Hledej..." value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg text-sm" />
                                <div className="max-h-48 overflow-y-auto flex flex-wrap gap-2">
                                    {availableSkillsInPopover.map(skill => (
                                        <button key={skill.id} onClick={() => handleSkillToggle(skill.id)} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200">{skill.name}</button>
                                    ))}
                                </div>
                            </Popover.Panel>
                        </Transition>
                        </>
                    )}
                </Popover>
            </div>

            {(selectedSkillIds.length > 0) && (
                <div className="border-t border-gray-100 pt-3 flex flex-wrap items-center gap-2">
                    {selectedSkills.map(skill => (
                        <button key={`selected-${skill.id}`} onClick={() => handleSkillToggle(skill.id)} className="flex items-center gap-1.5 bg-[var(--barva-svetle-pozadi)] border border-[var(--barva-primarni)] text-[var(--barva-primarni)] px-3 py-1.5 rounded-full text-sm cursor-pointer font-semibold">
                            {skill.name} <X size={16} />
                        </button>
                    ))}
                    <button onClick={() => setSelectedSkillIds([])} className="text-gray-500 hover:text-red-500 text-sm font-medium ml-auto">
                        Vymazat vybrané
                    </button>
                </div>
            )}
        </div>
    </div>
);
};

const MobileFilterContent = (props: Omit<ChallengeFilterProps, 'isMobileOpen' | 'setMobileOpen'>) => {
    const {
        allSkills,
        selectedSkillIds,
        setSelectedSkillIds,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
    } = props;
    const [skillSearch, setSkillSearch] = useState('');

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
        let skills = allSkills.filter(skill => !selectedSkillIds.includes(skill.id));
        if (skillSearch) {
            skills = skills.filter(skill => 
                skill.name.toLowerCase().includes(skillSearch.toLowerCase())
            );
        }
        return skills;
    }, [allSkills, selectedSkillIds, skillSearch]);

    return (
        <div className="p-4 space-y-6">
            <div>
                <label htmlFor="challenge-search-mobile" className="text-sm font-bold text-gray-700 block mb-2">Vyhledej výzvu</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input id="challenge-search-mobile" type="text" placeholder="Název, popis..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"/>
                </div>
            </div>
            <div>
                <label htmlFor="sort-by-mobile" className="text-sm font-bold text-gray-700 block mb-2">Seřadit podle</label>
                <select id="sort-by-mobile" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full py-2 px-4 border border-gray-300 rounded-lg bg-white">
                    <option value="recommended">Doporučené</option>
                    <option value="newest">Nejnovější</option>
                    <option value="ending_soon">Brzy končí</option>
                    <option value="highest_reward">Nejvyšší odměna</option>
                </select>
            </div>
            <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Filtruj podle dovedností</label>
                {selectedSkillIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 p-2 bg-gray-100 rounded-lg">
                        {selectedSkills.map(skill => (
                            <button key={`mobile-selected-${skill.id}`} onClick={() => handleSkillToggle(skill.id)} className="flex items-center gap-1.5 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                {skill.name} <X size={14} />
                            </button>
                        ))}
                    </div>
                )}
                <input type="text" placeholder="Hledej dovednost..." value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-lg"/>
                <div className="max-h-48 overflow-y-auto flex flex-wrap gap-2 p-2 bg-gray-100 rounded-lg">
                    {availableSkills.map(skill => (
                        <button key={`mobile-available-${skill.id}`} onClick={() => handleSkillToggle(skill.id)} className="px-3 py-1 bg-white text-gray-800 rounded-full text-sm border hover:bg-gray-200">
                        + {skill.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function ChallengeFilter(props: ChallengeFilterProps) {
    const { isMobileOpen, setMobileOpen } = props;

    return (
        <>
            <div className="hidden lg:block w-full">
                <DesktopFilterContent {...props} />
            </div>
            <Transition appear show={isMobileOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50 lg:hidden" onClose={() => setMobileOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                                    <div className="flex justify-between items-center p-4 border-b">
                                        <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 flex items-center gap-2"><SlidersHorizontal size={20} /> Filtry</Dialog.Title>
                                        <button onClick={() => setMobileOpen(false)} className="p-1 rounded-full hover:bg-gray-100"><X size={20} /></button>
                                    </div>
                                    <MobileFilterContent {...props} />
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