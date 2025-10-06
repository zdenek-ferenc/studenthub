"use client";
import { useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';

type StepProps = {
  onNext: (data: { logo_url: string | null }) => void;
  userId: string;
};

export default function Step4_LogoUpload({ onNext, userId }: StepProps) {
  const [uploading, setUploading] = useState(false);
  const { showToast } = useAuth();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(data.path);
      
      onNext({ logo_url: publicUrl });
      showToast("Logo bylo úspěšně nahráno!", 'success');

    } catch (error: unknown) { // <-- ZMĚNA ZDE
      let errorMessage = 'Nahrávání selhalo. Zkuste to prosím znovu.';
      if (error instanceof Error) {
        errorMessage = `Nahrávání selhalo: ${error.message}`;
      }
      showToast(errorMessage, 'error');
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
          <input 
            type="file" 
            id="logoUpload" 
            accept="image/*"
            onChange={handleUpload} 
            disabled={uploading} 
            className="hidden" 
          />
          <label 
            htmlFor="logoUpload" 
            className={`cursor-pointer md:px-12 px-6 py-3 md:py-4 rounded-3xl md:text-xl font-semibold transition-all duration-300 ease-in-out
              ${uploading 
                ? 'bg-gray-400 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
          >
            {uploading ? 'Nahrávám...' : 'Vybrat soubor'}
          </label>
        </div>
        
        <div className="pt-6 flex justify-center">
          <button 
            onClick={() => onNext({ logo_url: null })}
            className="text-gray-500 hover:text-gray-800 hover:underline"
          >
            Přeskočit a dokončit registraci
          </button>
        </div>
      </div>
    </div>
  );
}