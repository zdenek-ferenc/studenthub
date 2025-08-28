"use client";

import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient'; // Uprav cestu, pokud je potřeba
import { useAuth } from '../../../contexts/AuthContext'; // Importujeme useAuth pro přístup k user ID

// Typ pro data z tabulky StudentProfile
type StudentProfileData = {
  first_name: string;
  last_name: string;
  username: string;
  university: string;
  field_of_study: string;
  bio: string | null; // Bio může být i null
};

// Komponenta teď přijímá jen profil, ID si vezme z AuthContextu
export default function ProfileInfoCard({ profile }: { profile: StudentProfileData | null }) {
  const { user } = useAuth(); // Získáme přihlášeného uživatele
  
  // Stavy pro řízení editace
  const [isEditing, setIsEditing] = useState(false);
  const [bioText, setBioText] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSaveBio = async () => {
    if (!user) return; // Pojistka, kdyby user nebyl dostupný

    setSaving(true);
    const { error } = await supabase
      .from('StudentProfile')
      .update({ bio: bioText })
      .eq('user_id', user.id);

    if (error) {
      alert('Chyba při ukládání bio.');
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
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-[#86C5FF] text-[var(--barva-primarni)] flex items-center justify-center text-2xl font-light ">
            {profile?.first_name?.[0]}{profile?.last_name?.[0]}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--barva-tmava)]">{profile?.first_name} {profile?.last_name}</h2>
            <p className="text-[var(--barva-tmava)]">@{profile?.username}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 text-sm">
          <span className="bg-red-600 text-white flex justify-center px-3 py-1 rounded-2xl">{profile?.university}</span>
          <span className="bg-purple-400 text-white flex justify-center px-3 py-1 rounded-2xl">{profile?.field_of_study}</span>
        </div>
      </div>
      
      {/* Sekce pro BIO s logikou pro editaci */}
      <div className="mt-6">
        {/* Pokud je bio a nejsme v editačním módu, zobrazíme text a tlačítko "Upravit" */}
        {profile?.bio && !isEditing && (
          <div>
            <p className="text-gray-700 text-lg whitespace-pre-wrap">{profile.bio}</p>
            <button onClick={() => setIsEditing(true)} className="cursor-pointer mt-6 text-md rounded-full text-[var(--barva-primarni)] font-semibold hover:text-[#014688] transition-all duration-300">
              Upravit bio
            </button>
          </div>
        )}

        {/* Pokud bio neexistuje NEBO jsme v editačním módu, zobrazíme textarea */}
        {(!profile?.bio || isEditing) && (
          <div className="space-y-3">
            <textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              placeholder="Řekni nám něco o sobě, o svých zájmech a co hledáš..."
              // OPRAVA: Nový, hezčí styl pro textarea
              className="w-full min-h-[120px] rounded-lg border border-gray-200 bg-gray-50 p-3 text-base text-[var(--barva-tmava)] placeholder-gray-400 transition-colors focus:border-[var(--barva-primarni)] focus:ring-1 focus:ring-[var(--barva-primarni)] focus:outline-none"
            />
            <div className="flex items-center justify-between px-4 gap-2 leading-none">
              <button 
                onClick={handleSaveBio} 
                disabled={saving} 
                // OPRAVA: Nový, hezčí styl pro tlačítko
                className="cursor-pointer text-md rounded-full text-[var(--barva-primarni)] font-semibold hover:text-[#014688] transition-all duration-300"
              >
                {saving ? 'Ukládám...' : 'Uložit bio'}
              </button>
              {isEditing && (
                <button onClick={() => setIsEditing(false)} className="cursor-pointer text-md rounded-full text-[var(--barva-primarni)] hover:text-[#014688] transition-all duration-300">
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
