"use client";

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { X } from 'lucide-react';

type Language = {
  id: string;
  name: string;
};

type LanguageSelectorProps = {
  onSelectionChange: (selectedIds: string[]) => void;
  initialSelectedIds?: string[];
};

export default function LanguageSelectorEdit({ onSelectionChange, initialSelectedIds = [] }: LanguageSelectorProps) {
  const [allLanguages, setAllLanguages] = useState<Language[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSelectedIds(initialSelectedIds);
  }, [initialSelectedIds]);

  useEffect(() => {
    const fetchLanguages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('Language')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error("Chyba při načítání jazyků:", error);
      } else {
        setAllLanguages(data || []);
      }
      setLoading(false);
    };

    fetchLanguages();
  }, []);

  const handleToggleLanguage = (languageId: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(languageId)) {
      newSelectedIds.delete(languageId);
    } else {
      newSelectedIds.add(languageId);
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
      return languages.filter(lang => 
        lang.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return languages;
  }, [allLanguages, selectedIds, searchTerm]);

  if (loading) {
    return <p className='text-sm text-gray-500'>Načítám jazyky...</p>;
  }

  return (
    <div className='w-full space-y-6'>
      <div>
        <h4 className="text-md font-semibold text-[var(--barva-tmava)] mb-2">Tvoje jazyky</h4>
        <div className="p-3 bg-gray-50 rounded-lg min-h-[4rem] flex flex-wrap gap-2 border">
          {selectedLanguagesObjects.length > 0 ? (
            selectedLanguagesObjects.map(lang => (
              <button
                key={lang.id}
                type="button"
                onClick={() => handleToggleLanguage(lang.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--barva-primarni2)] text-[var(--barva-primarni)] rounded-full text-sm font-semibold hover:opacity-70 transition-all ease-in-out duration-300 cursor-pointer"
              >
                {lang.name}
                <X size={14} />
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-400 p-2">Zatím nemáš vybrané žádné jazyky.</p>
          )}
        </div>
      </div>
      <div>
        <h4 className="text-md font-semibold text-[var(--barva-tmava)] mb-2">Přidat jazyky</h4>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Hledej jazyk (např. Angličtina)..."
          className="w-full px-4 py-2 mb-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--barva-primarni)]"
        />
        <div className="p-3 bg-white rounded-lg max-h-60 overflow-y-auto flex flex-wrap gap-2 border">
          {availableLanguages.map(lang => (
            <button
              key={lang.id}
              type="button"
              onClick={() => handleToggleLanguage(lang.id)}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-[var(--barva-svetle-pozadi)] hover:border-[var(--barva-primarni)] hover:text-[var(--barva-primarni)] transition-colors"
            >
              + {lang.name}
            </button>
          ))}
          {searchTerm && availableLanguages.length === 0 && (
            <p className="text-sm text-gray-400 p-2">Jazyk nenalezen.</p>
          )}
        </div>
      </div>
    </div>
  );
}
