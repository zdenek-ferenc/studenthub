"use client";
import { useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient'; // Uprav cestu, pokud je potřeba

type StepProps = {
  onNext: (data: { logo_url: string }) => void;
  userId: string; // Potřebujeme ID uživatele pro unikátní cestu k souboru
};

export default function Step4_LogoUpload({ onNext, userId }: StepProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      setUploading(true);

      // Vytvoříme unikátní název souboru, aby se nepřepsala loga jiných firem
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Date.now()}.${fileExt}`;

      // Nahrajeme soubor do Supabase Storage do "bucketu" s názvem 'logos'
      const { data, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Získáme veřejnou URL nahraného souboru
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(data.path);
      
      // Předáme URL rodičovské komponentě a ta dokončí registraci
      onNext({ logo_url: publicUrl });

    } catch (error) { // OPRAVA: Odstranili jsme ': any' pro lepší typovou bezpečnost
      setError('Nahrávání selhalo. Zkuste to prosím znovu.');
      console.error('Chyba při nahrávání loga:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className='max-w-lg mx-auto py-12 px-8 sm:px-12 rounded-3xl shadow-xl bg-white'>
      <div className="space-y-6 text-center">
        <h2 className="text-4xl text-[var(--barva-primarni)] mb-4">Firemní logo</h2>
        <p className="text-gray-600 mb-6">Nahrajte své logo. Tento krok můžete přeskočit.</p>
        
        <div className='my-12'>
          {/* Skrytý input pro výběr souboru */}
          <input 
            type="file" 
            id="logoUpload" 
            accept="image/*" // Povolíme jen obrázky
            onChange={handleUpload} 
            disabled={uploading} 
            className="hidden" 
          />
          {/* Tlačítko, které vizuálně nahrazuje input */}
          <label 
            htmlFor="logoUpload" 
            className={`cursor-pointer px-12 py-4 rounded-3xl text-xl font-semibold transition-all duration-300 ease-in-out
              ${uploading 
                ? 'bg-gray-400 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
          >
            {uploading ? 'Nahrávám...' : 'Vybrat soubor z počítače'}
          </label>
        </div>

        {error && <p className="error text-center">{error}</p>}
        
        <div className="pt-6 flex justify-center">
          <button 
            onClick={() => onNext({ logo_url: '' })} // Pošleme prázdný string, pokud uživatel přeskočí
            className="text-gray-500 hover:text-gray-800 hover:underline"
          >
            Přeskočit a dokončit registraci
          </button>
        </div>
      </div>
    </div>
  );
}
