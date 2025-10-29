"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Bookmark } from 'lucide-react';
import { SavedChallenge } from '../../contexts/DashboardContext'; 
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { useState } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';

export default function SavedChallengeCard({ savedChallenge }: { savedChallenge: SavedChallenge }) {
    const { user, showToast } = useAuth();
    const { refetchDashboardData } = useDashboard(); 
    const [isRemoving, setIsRemoving] = useState(false);
    if (!savedChallenge || !savedChallenge.Challenge) {
        return null;
    }

    const { Challenge } = savedChallenge;

    const handleUnsave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user || isRemoving) return;

        setIsRemoving(true);
        try {
            const { error } = await supabase
                .from('SavedChallenge')
                .delete()
                .eq('student_id', user.id)
                .eq('challenge_id', Challenge.id);

            if (error) throw error;
            showToast('Výzva odebrána z uložených.', 'success');
            refetchDashboardData();
        } catch (error: unknown) {
            let errorMessage = "Odebrání se nezdařilo: Neznámá chyba.";
            if (error instanceof Error) { 
            errorMessage = `Odebrání se nezdařilo: ${error.message}`; 
        }
    showToast(errorMessage, 'error');
    setIsRemoving(false);
}
    };

    const skills = Challenge.ChallengeSkill.map(cs => cs.Skill?.name).filter(Boolean);

    return (
        <Link href={`/challenges/${Challenge.id}`} className="block group relative">
            <button
                onClick={handleUnsave}
                disabled={isRemoving}
                className={`absolute top-2 cursor-pointer right-2 z-10 p-1.5 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors ${isRemoving ? 'animate-pulse' : ''}`}
                aria-label="Odebrat z uložených"
            >
                <Bookmark size={16} fill="currentColor" />
            </button>

            <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 shadow-xs hover:border-blue-200 hover:shadow-sm hover:bg-blue-50/50 transition-all duration-300 flex items-center gap-4">
                <Image
                    src={Challenge.StartupProfile?.logo_url || '/logo.svg'}
                    alt="logo"
                    width={56}
                    height={56}
                    className="rounded-xl w-14 h-14 object-cover flex-shrink-0"
                />
                <div className="flex-grow min-w-0">
                    <h4 className="text-md sm:text-lg font-bold text-[var(--barva-tmava)] truncate">{Challenge.title}</h4>
                    <p className="text-sm font-semibold text-gray-500 truncate">{Challenge.StartupProfile?.company_name}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {skills.slice(0, 3).map((skillName, index) => (
                            <span key={index} className="text-xs border-1 text-[var(--barva-primarni)] px-2 py-1 rounded-xl">
                                {skillName}
                            </span>
                        ))}
                        {skills.length > 3 && (
                            <span className="text-xs text-[var(--barva-primarni)] self-center  px-2 py-1">
                                +{skills.length - 3}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-4">
                    <div className="hidden sm:block opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300">
                        <ChevronRight size={20} strokeWidth={2.5} className="text-blue-500" />
                    </div>
                </div>
            </div>
        </Link>
    );
}