import { useState, useEffect } from 'react';

/**
 * Custom hook, který zpozdí aktualizaci hodnoty.
 * @param value Hodnota, kterou chceme zpozdit (např. text z vyhledávání).
 * @param delay Prodleva v milisekundách.
 * @returns Zpožděnou hodnotu.
 */
export function useDebounce<T>(value: T, delay: number): T {
  // Stav pro uložení zpožděné hodnoty
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Nastavíme časovač, který aktualizuje hodnotu až po uplynutí 'delay'
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Důležitý "úklid": pokud se 'value' změní dříve, než časovač doběhne,
    // starý časovač zrušíme a nastavíme nový.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Spustí se znovu jen když se změní hodnota nebo prodleva

  return debouncedValue;
}