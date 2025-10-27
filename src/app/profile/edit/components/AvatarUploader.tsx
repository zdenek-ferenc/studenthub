"use client";

import { useState, ChangeEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import { UploadCloud, Loader2, Edit2, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AvatarUploaderProps {
  userId: string;
  currentAvatarUrl: string | null; // URL předaná z formuláře
  onUploadSuccess: (newUrl: string) => void;
  onDeleteSuccess: () => void;
}

const BUCKET_NAME = 'profile-pictures';

export default function AvatarUploader({
  userId,
  currentAvatarUrl, // Použijeme přímo tento prop pro zobrazení
  onUploadSuccess,
  onDeleteSuccess,
}: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Odebrali jsme interní stav avatarUrl a useEffect pro synchronizaci
  const { showToast } = useAuth();

  const deleteOldAvatar = async (oldUrl: string | null) => {
    if (!oldUrl) return;
    try {
      const oldFileName = oldUrl.split('/').pop();
      if (oldFileName) {
        // Zkusíme smazat, i když nevíme jistě, jestli existuje
        const { error: removeError } = await supabase.storage.from(BUCKET_NAME).remove([oldFileName]);
        // Ignorujeme chybu, pokud soubor neexistoval
        if (removeError && !removeError.message.includes('Not Found')) {
            console.warn("Nepodařilo se smazat starý avatar (ale pokračujeme):", removeError);
        }
      }
    } catch (err) {
      console.error("Chyba při pokusu o smazání starého avataru:", err);
    }
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setError("Soubor je příliš velký (max 2MB).");
      showToast("Soubor je příliš velký (max 2MB).", "error");
      return;
    }

    setUploading(true);
    setError(null);

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      // 1. Smažeme starý obrázek (použijeme prop currentAvatarUrl)
      await deleteOldAvatar(currentAvatarUrl);

      // 2. Nahrání nového souboru
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Získání veřejné URL
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      const newUrl = publicUrlData.publicUrl;

      // 4. Aktualizace URL v databázi (StudentProfile)
      const { error: dbError } = await supabase
        .from('StudentProfile')
        .update({ profile_picture_url: newUrl })
        .eq('user_id', userId);

      if (dbError) throw dbError;

      // 5. Zavolání callbacku - TÍM SE AKTUALIZUJE FORMULÁŘ A PROP currentAvatarUrl!
      onUploadSuccess(newUrl);
      showToast('Profilovka úspěšně nahrána!', 'success');

    } catch (err: unknown) {
      console.error("Chyba při nahrávání avataru:", err);
      const message = (err instanceof Error) ? err.message : "Neznámá chyba";
      setError(`Nahrávání selhalo: ${message}`);
      showToast(`Nahrávání selhalo: ${message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
     // Použijeme přímo prop
     if (!currentAvatarUrl) return;
     if (!confirm("Opravdu chcete smazat profilový obrázek?")) return;

     setUploading(true);
     try {
        // 1. Smazání z Storage
        await deleteOldAvatar(currentAvatarUrl);

        // 2. Smazání z DB
        const { error: dbError } = await supabase
            .from('StudentProfile')
            .update({ profile_picture_url: null })
            .eq('user_id', userId);

        if (dbError) throw dbError;

        // 3. Zavolání callbacku pro aktualizaci formuláře
        onDeleteSuccess();
        showToast('Profilovka smazána.', 'success');

     } catch (err: unknown) {
         console.error("Chyba při mazání avataru:", err);
         showToast("Mazání selhalo.", "error");
     } finally {
         setUploading(false);
     }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32 rounded-full group">
        {currentAvatarUrl ? ( // Používáme přímo prop
          <Image
            src={currentAvatarUrl} // Používáme přímo prop
            alt="Profilový obrázek"
            width={1000}
            height={1000}
            className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
            key={currentAvatarUrl} // Používáme přímo prop
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center border-2 border-dashed border-gray-300">
            <UserIcon size={48} />
          </div>
        )}
        <label
          htmlFor="avatar-upload"
          className="absolute inset-0 w-full h-full rounded-full hover:bg-black/40 group-hover:bg-opacity-50 flex items-center justify-center transition-all ease-in-out duration-200 cursor-pointer"
        >
          {uploading ? (
            <Loader2 className="animate-spin text-white" size={32} />
          ) : (
            <Edit2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
          )}
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/png, image/jpeg"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
      </div>

      <div className="flex items-center gap-2">
         <label htmlFor="avatar-upload" className="text-sm font-semibold text-[var(--barva-primarni)] cursor-pointer hover:underline">
            {uploading ? "Nahrávám..." : "Změnit obrázek"}
         </label>
         {/* Kontrolujeme přímo prop */}
         {currentAvatarUrl && (
            <button
                type="button"
                onClick={handleDelete}
                disabled={uploading}
                className="text-sm font-semibold text-red-500 cursor-pointer hover:underline"
            >
                Odebrat
            </button>
         )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      <p className="text-gray-500 text-xs">Max 2MB (PNG, JPG)</p>
    </div>
  );
}