import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';

interface ProfileBioProps {
    bio: string | null;
    isOwner: boolean;
}

const ProfileBio = ({ bio, isOwner }: ProfileBioProps) => {
    const { user, showToast } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [bioText, setBioText] = useState(bio || '');
    const [saving, setSaving] = useState(false);

    const handleSaveBio = async () => {
        if (!user) return;
        setSaving(true);
        const { error } = await supabase.from('StudentProfile').update({ bio: bioText }).eq('user_id', user.id);
        if (error) {
            showToast(`Chyba: ${error.message}`, 'error');
        } else {
            setIsEditing(false);
            showToast('Bio bylo úspěšně uloženo!', 'success');
        }
        setSaving(false);
    };

    return (
        <div className="text-gray-700">
            {isEditing ? (
                <div className="space-y-2">
                    <textarea
                        value={bioText}
                        onChange={(e) => setBioText(e.target.value)}
                        placeholder="Řekni něco o sobě, co tě zajímá, na čem pracuješ..."
                        className="w-full min-h-[100px] text-xs sm:text-sm rounded-lg border border-gray-200 bg-gray-50 p-2 focus:border-[var(--barva-primarni)] focus:ring-1 focus:ring-[var(--barva-primarni)] focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                        <button onClick={handleSaveBio} disabled={saving} className="text-sm cursor-pointer font-semibold text-[var(--barva-primarni)]/90 hover:text-[var(--barva-primarni)] disabled:text-gray-400">{saving ? 'Ukládám...' : 'Uložit'}</button>
                        <button onClick={() => setIsEditing(false)} className="text-sm cursor-pointer text-gray-500 hover:text-gray-700">Zrušit</button>
                    </div>
                </div>
            ) : (
                <>
                    <p className={`text-xs sm:text-sm whitespace-pre-wrap ${!bioText ? 'text-gray-500' : ''}`}>
                        {bioText
                            ? bioText
                            : isOwner
                                ? "Přidej krátký popisek o sobě, aby startupy věděly, co tě zajímá a na čem pracuješ."
                                : "Student o sobě zatím nic nenapsal."
                        }
                    </p>
                    {isOwner && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className={`flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer font-semibold transition-colors mt-3 ${bioText
                                    ? 'text-gray-400 hover:text-[var(--barva-tmava)]'
                                    : 'text-[var(--barva-primarni)] hover:opacity-80'
                                }`}
                        >
                            <Edit size={12} />
                            {bioText ? 'Upravit bio' : 'Přidat bio'}
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

export default ProfileBio;
