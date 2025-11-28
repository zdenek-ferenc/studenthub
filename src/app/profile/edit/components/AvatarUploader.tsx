"use client";

import { useState, ChangeEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import { Loader2, Edit2, User as UserIcon, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AvatarUploaderProps {
  userId: string;
  currentAvatarUrl: string | null; 
  onUploadSuccess: (newUrl: string) => void;
  onDeleteSuccess: () => void;
  tableName?: 'StudentProfile' | 'StartupProfile';
  columnName?: string;
  bucketName?: string;
}

export default function AvatarUploader({
  userId,
  currentAvatarUrl, 
  onUploadSuccess,
  onDeleteSuccess,
  tableName = 'StudentProfile', 
  columnName = 'profile_picture_url',
  bucketName = 'profile-pictures'
}: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useAuth();

  const deleteOldAvatar = async (oldUrl: string | null) => {
    if (!oldUrl) return;
    try {
      const oldFileName = oldUrl.split('/').pop();
      if (oldFileName) {
        const { error: removeError } = await supabase.storage.from(bucketName).remove([oldFileName]);
        if (removeError && !removeError.message.includes('Not Found')) {
            console.warn("Nepodařilo se smazat starý obrázek (ale pokračujeme):", removeError);
        }
      }
    } catch (err) {
      console.error("Chyba při pokusu o smazání starého obrázku:", err);
    }
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { 
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
      await deleteOldAvatar(currentAvatarUrl);

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const newUrl = publicUrlData.publicUrl;

      const { error: dbError } = await supabase
        .from(tableName)
        .update({ [columnName]: newUrl })
        .eq('user_id', userId);

      if (dbError) throw dbError;

      onUploadSuccess(newUrl);
      showToast(tableName === 'StartupProfile' ? 'Logo úspěšně nahráno!' : 'Profilovka úspěšně nahrána!', 'success');

    } catch (err: unknown) {
      console.error("Chyba při nahrávání:", err);
      const message = (err instanceof Error) ? err.message : "Neznámá chyba";
      setError(`Nahrávání selhalo: ${message}`);
      showToast(`Nahrávání selhalo: ${message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentAvatarUrl) return;
    if (!confirm(tableName === 'StartupProfile' ? "Opravdu chcete smazat logo firmy?" : "Opravdu chcete smazat profilový obrázek?")) return;

    setUploading(true);
    try {
        await deleteOldAvatar(currentAvatarUrl);

        const { error: dbError } = await supabase
            .from(tableName)
            .update({ [columnName]: null })
            .eq('user_id', userId);

        if (dbError) throw dbError;

        onDeleteSuccess();
        showToast(tableName === 'StartupProfile' ? 'Logo smazáno.' : 'Profilovka smazána.', 'success');

    } catch (err: unknown) {
        console.error("Chyba při mazání:", err);
        showToast("Mazání selhalo.", "error");
    } finally {
        setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full group bg-white shadow-sm">
        {currentAvatarUrl ? ( 
          <Image
            src={currentAvatarUrl} 
            alt="Profilový obrázek"
            width={128}
            height={128}
            className="w-full h-full rounded-full object-contain p-1 border border-gray-100"
            key={currentAvatarUrl}
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-50 text-gray-300 flex items-center justify-center border-2 border-dashed border-gray-200">
            {tableName === 'StartupProfile' ? <Building2 size={40} /> : <UserIcon size={40} />}
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

      <div className="flex items-center gap-3">
        <label htmlFor="avatar-upload" className="text-sm font-semibold text-[var(--barva-primarni)] cursor-pointer hover:underline">
            {uploading ? "Nahrávám..." : (tableName === 'StartupProfile' ? "Změnit logo" : "Změnit obrázek")}
        </label>
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
      <p className="text-gray-400 text-xs">Max 2MB (PNG, JPG)</p>
    </div>
  );
}