"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Bookmark} from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { supabase } from '../../../../lib/supabaseClient';
import { useState } from 'react';
import { useDashboard, SavedChallenge } from '../../../../contexts/DashboardContext';

export default function ModernSavedChallengeCard({ savedChallenge }: { savedChallenge: SavedChallenge }) {
    const { user, showToast } = useAuth();
    const { refreshSavedChallenges } = useDashboard();
    const [isRemoving, setIsRemoving] = useState(false);

    if (!savedChallenge || !savedChallenge.Challenge) return null;
    const { Challenge } = savedChallenge;

    const handleUnsave = async (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (!user || isRemoving) return;
        setIsRemoving(true);
        try {
            await supabase.from('SavedChallenge').delete().eq('student_id', user.id).eq('challenge_id', Challenge.id);
            showToast('Odebráno z uložených', 'success');
            refreshSavedChallenges();
        } catch { 
            showToast('Chyba při odebírání', 'error'); 
            setIsRemoving(false); 
        }
    };

    return (
        <Link href={`/challenges/${Challenge.id}`} className="block group relative">
            <button onClick={handleUnsave} disabled={isRemoving} className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all">
                <Bookmark size={16} fill="currentColor" />
            </button>

            <div className="bg-[#0B1623]/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-[#0B1623]/60 hover:border-white/10 transition-all">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                    {Challenge.StartupProfile?.logo_url && <Image src={Challenge.StartupProfile.logo_url} alt="logo" width={48} height={48} className="object-cover w-full h-full" />}
                </div>
                <div className="flex-grow min-w-0 pr-8">
                    <h4 className="text-white font-bold truncate group-hover:text-blue-400 transition-colors">{Challenge.title}</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {Challenge.ChallengeSkill.slice(0, 3).map((cs, i) => (
                            <span key={i} className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">{cs.Skill?.name}</span>
                        ))}
                    </div>
                </div>
            </div>
        </Link>
    );
}