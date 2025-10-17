"use client";

import { useState, useRef, useMemo, useEffect } from 'react';
import Flag from 'react-world-flags';
import { X } from 'lucide-react';

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
  const didInit = useRef(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm] = useState('');

  useEffect(() => {
    if (!didInit.current) {
      setSelectedIds(initialSelectedIds);
      didInit.current = true;
    }
  }, [initialSelectedIds]);

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
  };

  const selectedLanguagesObjects = useMemo(() => {
    return allLanguages.filter(lang => selectedIds.includes(lang.id));
  }, [allLanguages, selectedIds]);
  const availableLanguages = useMemo(() => {
    const languages = allLanguages.filter(lang => !selectedIds.includes(lang.id));
    if (searchTerm) {
      return languages.filter(lang => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return lang.name.toLowerCase().split(' ').some(word => 
          word.startsWith(lowerCaseSearchTerm)
        );
      });
    }
    return languages; 
  }, [allLanguages, selectedIds, searchTerm]);

  return (
    <div className='flex flex-col items-center w-full'>      
      {availableLanguages.length === 0 && !searchTerm && selectedLanguagesObjects.length > 0 && (
          <p className="text-sm text-gray-500 py-4">Všechny jazyky jsou již vybrány.</p>
      )}
      {selectedLanguagesObjects.length > 0 && (
        <div className="w-full max-w-4xl sm:px-8 flex flex-wrap gap-3 md:gap-4 pb-6">
            {selectedLanguagesObjects.map(lang => {
                const countryCode = languageCountryCodes[lang.name];
                return (
                    <button
                        key={`selected-${lang.id}`}
                        type="button"
                        onClick={() => handleToggleLanguage(lang.id)}
                        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-[var(--barva-primarni)] bg-sky-100 rounded-full font-base sm:font-light text-sm sm:text-xl outline-1 md:outline-2 transition-colors duration-200 cursor-pointer"
                    >
                        {countryCode && <Flag code={countryCode} className="w-6 h-6 rounded-full object-cover" />}
                        <span className='hidden sm:block'>{lang.name}</span>
                        <X size={20} className='w-4 h-4' />
                    </button>
                );
            })}
        </div>
      )}
      <div className="w-full max-w-4xl px-4 sm:px-8 flex flex-wrap justify-center gap-3 md:gap-4 min-h-[12rem] content-start">
        {availableLanguages.map(lang => {
          const countryCode = languageCountryCodes[lang.name];
          return (
            <button
              key={lang.id}
              type="button"
              onClick={() => handleToggleLanguage(lang.id)}
              title={lang.name}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[var(--barva-primarni)] rounded-full font-base sm:font-light text-sm sm:text-xl sm:outline-2 transition-colors duration-200 cursor-pointer`}
            >
              <div className="block sm:hidden">
                {countryCode ? (
                  <Flag code={countryCode} className="w-10 h-10 rounded-full object-cover outline-1 md:outline-2 outline-offset-2" />
                ) : (
                  <span className="text-xl">{lang.name.charAt(0)}</span>
                )}
              </div>
              <span className="hidden sm:block text-xl text-[var(--barva-primarni)]">{lang.name}</span>
            </button>
          )
        })}
        {searchTerm && availableLanguages.length === 0 && <p className="text-sm text-gray-500 py-4">Jazyk nenalezen.</p>}
      </div>
    </div>
  );
}