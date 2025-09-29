"use client";

import { useState} from 'react';
import Flag from 'react-world-flags';

type Language = {
  id: string;
  name: string;
};

type LanguageSelectorProps = {
  onSelectionChange: (selectedIds: string[]) => void;
  initialSelectedIds?: string[];
  allLanguages: Language[];
};

const languageCountryCodes: { [key: string]: string } = {
  'Angličtina': 'GB',
  'Čeština': 'CZ',
  'Čínština': 'CN',
  'Francouzština': 'FR',
  'Italština': 'IT',
  'Japonština': 'JP',
  'Korejština': 'KR',
  'Maďarština': 'HU',
  'Němčina': 'DE',
  'Polština': 'PL',
  'Ruština': 'RU',
  'Slovenština': 'SK',
  'Španělština': 'ES',
  'Ukrajinština': 'UA',
};


export default function LanguageSelector({ onSelectionChange, initialSelectedIds = [], allLanguages }: LanguageSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleLanguage = (langId: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(langId)) {
      newSelectedIds.delete(langId);
    } else {
      newSelectedIds.add(langId);
    }
    
    const updatedIds = Array.from(newSelectedIds);
    setSelectedIds(updatedIds);
    onSelectionChange(updatedIds);
    setSearchTerm('');
  };

  const filteredLanguages = allLanguages.filter(lang => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return lang.name.toLowerCase().split(' ').some(word => 
      word.startsWith(lowerCaseSearchTerm)
    );
  });

  return (
    <div className='flex flex-col items-center w-full'>
      <div className={`w-full max-w-sm mb-8 sm:mb-12 ${filteredLanguages.length < 5 && 'hidden sm:block'}`}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Hledej jazyk (např. Angličtina)"
          className="w-full px-6 py-3 border text-black border-gray-300 rounded-2xl focus:outline-none focus:bg-white focus:border-[var(--barva-primarni)]"
        />
      </div>

      <div className="w-full max-w-4xl px-4 sm:px-8 flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 min-h-[12rem] content-start">
        {filteredLanguages.map(lang => {
          const countryCode = languageCountryCodes[lang.name];
          return (
            <button
              key={lang.id}
              type="button"
              onClick={() => handleToggleLanguage(lang.id)}
              title={lang.name}
              className={`
                flex items-center justify-center 
                rounded-full transition-all duration-200 cursor-pointer group
                w-16 h-16 sm:w-auto sm:h-auto
                sm:px-5 sm:py-2 
                font-light 
                ring-2 ring-[var(--barva-primarni)]
                ${selectedIds.includes(lang.id)
                  ? 'bg-[var(--barva-primarni2)]'
                  : 'bg-white hover:bg-gray-100'
                }`}
            >
              <div className="block sm:hidden">
                {countryCode ? (
                  <Flag code={countryCode} className="w-10 h-10 rounded-full object-cover shadow-md" />
                ) : (
                  <span className="text-xl">{lang.name.charAt(0)}</span>
                )}
              </div>
              <span className="hidden sm:block text-lg sm:text-2xl text-[var(--barva-primarni)]">{lang.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  );
}