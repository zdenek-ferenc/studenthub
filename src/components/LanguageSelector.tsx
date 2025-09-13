"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Ujisti se, že cesta je správná

type Language = {
  id: string;
  name: string;
};

type LanguageSelectorProps = {
  onSelectionChange: (selectedIds: string[]) => void;
  initialSelectedIds?: string[];
};

export default function LanguageSelector({ onSelectionChange, initialSelectedIds = [] }: LanguageSelectorProps) {
  const [allLanguages, setAllLanguages] = useState<Language[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLanguages = async () => {
      setLoading(true);
      // JEDINÁ ZMĚNA: Dotazujeme se do tabulky "Language" místo "Skill"
      const { data, error } = await supabase
        .from('Language')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error("Chyba při načítání jazyků:", error);
        setError("Nepodařilo se načíst jazyky.");
      } else {
        setAllLanguages(data);
      }
      setLoading(false);
    };

    fetchLanguages();
  }, []);

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
    setSearchTerm(''); // Resetujeme vyhledávání po kliknutí
  };

  const filteredLanguages = allLanguages.filter(lang => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return lang.name.toLowerCase().split(' ').some(word => 
      word.startsWith(lowerCaseSearchTerm)
    );
  });

  if (loading) {
    return <p>Načítám jazyky...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Hledej jazyk (např. Angličtina)"
        className="flex min-w-[24rem] content-start m-auto mb-12 px-6 py-3 border text-black border-gray-300 rounded-2xl focus:outline-none focus:bg-white focus:border-[var(--barva-primarni)]" // Používáme stejnou třídu jako u ostatních inputů
      />

      <div className="flex flex-wrap justify-center gap-3 min-h-[12rem] content-start">
        {filteredLanguages.map(lang => (
          <button
            key={lang.id}
            onClick={() => handleToggleLanguage(lang.id)}
            className={`px-6 py-2 text-[var(--barva-primarni)] rounded-full font-light text-3xl outline-2 transition-colors duration-200 cursor-pointer
              ${selectedIds.includes(lang.id)
                ? 'bg-[var(--barva-primarni2)]'
                : 'bg-white'
              }`}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
}
