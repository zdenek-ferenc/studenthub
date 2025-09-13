import { Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';

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
};

// Seznam populárních dovedností pro rychlý výběr
const popularSkillsList = ['Marketing', 'React', 'Python', 'UX Design', 'Figma', 'Copywriting', 'SEO', 'Frontend', 'Backend', 'Analýza dat'];

export default function FilterSidebar({
  allSkills,
  selectedSkillIds,
  setSelectedSkillIds,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
}: FilterSidebarProps) {
  
  const [skillSearch, setSkillSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const handleSkillToggle = (skillId: string) => {
    const newSelectedIds = new Set(selectedSkillIds);
    if (newSelectedIds.has(skillId)) {
      newSelectedIds.delete(skillId);
    } else {
      newSelectedIds.add(skillId);
    }
    setSelectedSkillIds(Array.from(newSelectedIds));
  };

  // Získáme plné objekty pro vybrané dovednosti
  const selectedSkills = useMemo(() => 
    allSkills.filter(skill => selectedSkillIds.includes(skill.id)),
    [allSkills, selectedSkillIds]
  );
  
  // Získáme dovednosti k zobrazení v seznamu pro výběr
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
    <aside className="w-full lg:w-80 p-6 bg-white rounded-2xl shadow-xs border border-gray-100 h-fit sticky top-28 flex-shrink-0">
      {/* Hlavní vyhledávání studentů */}
      <div className="mb-6">
        <label htmlFor="student-search" className="text-sm font-bold text-gray-700 block mb-2">
          Vyhledej studenta
        </label>
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
            <option value="level">Nejvyšší úroveň</option>
          </select>
      </div>

      {/* Filtrování podle dovedností */}
      <div>
        <label className="text-sm font-bold text-gray-700 block mb-2">
          Filtruj podle dovedností
        </label>
        
        {/* Sekce pro vybrané dovednosti */}
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedSkills.map(skill => (
              <button
                key={`selected-${skill.id}`}
                onClick={() => handleSkillToggle(skill.id)}
                className="cursor-pointer flex items-center justify-center gap-1.5 bg-[var(--barva-svetle-pozadi)] leading-none text-[var(--barva-primarni)] border border-[var(--barva-primarni)] px-3 py-2 rounded-full text-sm font-semibold transition-colors"
              >
                {skill.name}
                <X size={14} />
              </button>
            ))}
          </div>
        )}
        
         <div className="relative mb-3 mt-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Hledej dovednost..."
            value={skillSearch}
            onChange={(e) => setSkillSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg leading-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition text-[var(--barva-tmava)]"
          />
        </div>
        
        <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase">
                {skillSearch ? 'Výsledky hledání' : (showAll ? 'Všechny dovednosti' : 'Populární dovednosti')}
            </h4>
            {!skillSearch && (
                 <button onClick={() => setShowAll(!showAll)} className="text-xs font-bold text-[var(--barva-primarni)] hover:underline">
                    {showAll ? 'Zobrazit méně' : 'Zobrazit vše'}
                </button>
            )}
        </div>
        
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
          {availableSkills.map(skill => (
            <button
              key={skill.id}
              onClick={() => handleSkillToggle(skill.id)}
              className="cursor-pointer px-3 py-1.5 rounded-full text-sm text-[var(--barva-primarni)] font-normal border bg-white border-[var(--barva-primarni)] hover:bg-[var(--barva-svetle-pozadi)] transition-colors"
            >
              {skill.name}
            </button>
          ))}
           {availableSkills.length === 0 && (
            <p className="text-sm text-gray-500 w-full text-center py-4">
              {skillSearch ? 'Žádná dovednost nenalezena.' : 'Všechny populární dovednosti jsou vybrány.'}
            </p>
           )}
        </div>
      </div>
    </aside>
  );
}

