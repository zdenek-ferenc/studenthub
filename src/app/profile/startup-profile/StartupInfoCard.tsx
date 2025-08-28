"use client";
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext'; // Uprav cestu, pokud je potřeba
import { supabase } from '../../../lib/supabaseClient'; // Uprav cestu, pokud je potřeba

type StartupProfileData = {
  company_name: string;
  website: string;
  logo_url: string | null;
  description: string | null;
};

export default function StartupInfoCard({ profile }: { profile: StartupProfileData | null }) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [descriptionText, setDescriptionText] = useState(profile?.description || '');
  const [saving, setSaving] = useState(false);

  // Efekt pro aktualizaci textu, pokud se změní profil
  useEffect(() => {
    setDescriptionText(profile?.description || '');
  }, [profile]);

  const handleSaveDescription = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from('StartupProfile')
      .update({ description: descriptionText }) // Ukládáme do sloupce 'description'
      .eq('user_id', user.id);

    if (error) {
      alert('Chyba při ukládání popisu.');
      console.error(error);
    } else {
      // Po úspěšném uložení vypneme editační mód
      // Zde by bylo ideální znovu načíst data profilu, aby se změna projevila,
      // ale pro jednoduchost zatím jen vypneme editaci.
      setIsEditing(false);
      // Můžeme také optimisticky aktualizovat lokální stav, ale to vynecháme.
    }
    setSaving(false);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xs">
      <div className="flex items-center gap-4">
        {profile?.logo_url ? (
          <Image src={profile.logo_url} alt={`${profile.company_name} logo`} width={80} height={80} className="rounded-3xl object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
            {profile?.company_name?.substring(0, 2)}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-[var(--barva-tmava)]">{profile?.company_name}</h2>
          <a href={profile?.website} target="_blank" rel="noopener noreferrer" className="text-[var(--barva-primarni)] hover:underline">{profile?.website}</a>
        </div>
      </div>
      
      {/* Sekce pro popis s logikou pro editaci */}
      <div className="mt-6">
        {descriptionText && !isEditing && (
          <div>
            <p className="text-gray-700 whitespace-pre-wrap">{descriptionText}</p>
            <button onClick={() => setIsEditing(true)} className="cursor-pointer mt-6 text-md rounded-full text-[var(--barva-primarni)] font-semibold hover:text-[#014688] transition-all duration-300">
              Upravit popis
            </button>
          </div>
        )}

        {(!descriptionText || isEditing) && (
          <div className="space-y-3">
            <textarea
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
              placeholder="Řekněte nám něco o vaší firmě, vizi a co hledáte..."
              className="w-full min-h-[120px] rounded-lg border border-gray-200 bg-gray-50 p-3 text-base text-[var(--barva-tmava)] placeholder-gray-400 transition-colors focus:border-[var(--barva-primarni)] focus:ring-1 focus:ring-[var(--barva-primarni)] focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button 
                onClick={handleSaveDescription} 
                disabled={saving} 
                className="text-sm rounded-2xl text-[var(--barva-primarni)] font-semibold cursor-pointer hover:text-[#295f91] transition-all duration-300 ease-in-out"
              >
                {saving ? 'Ukládám...' : 'Uložit popis'}
              </button>
              {isEditing && (
                <button onClick={() => setIsEditing(false)} className="px-6 text-sm font-semibold text-gray-600 hover:bg-gray-100">
                    Zrušit
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
