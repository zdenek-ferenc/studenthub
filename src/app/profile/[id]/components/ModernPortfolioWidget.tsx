"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Star, ArrowRight, Rocket, Lock, EyeOff, CheckCircle, RefreshCcw, Medal, Plus, Folder } from 'lucide-react';
import { Submission } from '../types';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';

type Props = {
    submissions: Submission[];
    isOwner: boolean;
};

export default function ModernPortfolioWidget({ submissions, isOwner }: Props) {
    const { showToast } = useAuth();
    const [localSubmissions, setLocalSubmissions] = useState(submissions);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Rozdělení na veřejné a skryté
    const publicSubmissions = localSubmissions.filter(s => s.is_public_on_profile);
    const hiddenSubmissions = localSubmissions.filter(s => !s.is_public_on_profile);

    // Seřazení skrytých podle ratingu (nejlepší první)
    const bestHiddenSubmission = hiddenSubmissions.sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA;
    })[0];

    // Funkce pro přepínání viditelnosti (Zveřejnit / Skrýt)
    const toggleVisibility = async (submissionId: string, currentStatus: boolean) => {
        setUpdatingId(submissionId);
        const newStatus = !currentStatus;

        const { error } = await supabase
            .from('Submission')
            .update({ is_public_on_profile: newStatus })
            .eq('challenge_id', submissionId);

        if (error) {
            showToast("Nepodařilo se změnit viditelnost výzvy.", "error");
        } else {
            showToast(newStatus ? "Výzva je nyní veřejná!" : "Výzva byla skryta.", "success");
            // Lokální update stavu
            setLocalSubmissions(prev => prev.map(s => 
                s.challenge_id === submissionId ? { ...s, is_public_on_profile: newStatus } : s
            ));
        }
        setUpdatingId(null);
    };

    const HiddenSubmissionPreview = ({ sub }: { sub: Submission }) => (
        <div 
            onClick={() => toggleVisibility(sub.challenge_id, false)}
            className={`
                group relative w-full bg-[#001224] border border-blue-500/30 hover:border-blue-400 
                rounded-xl p-4 flex flex-row items-center gap-4 
                transition-all duration-300 cursor-pointer shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1
                ${updatingId === sub.challenge_id ? 'opacity-50 pointer-events-none' : ''}
            `}
        >
            <div className="w-12 h-12 hidden md:flex shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-1.5 backdrop-blur-sm">
                {sub.Challenge?.StartupProfile?.logo_url ? (
                    <Image src={sub.Challenge.StartupProfile.logo_url} alt="Logo" width={40} height={40} className="object-contain" />
                ) : (
                    <span className="font-bold text-gray-500 text-xs">
                        {sub.Challenge?.StartupProfile?.company_name.substring(0, 2).toUpperCase()}
                    </span>
                )}
            </div>

            <div className="flex-1 text-left min-w-0">
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">
                    {sub.Challenge?.StartupProfile?.company_name}
                </div>
                <h4 className="text-base font-bold text-white leading-tight truncate">
                    {sub.Challenge?.title}
                </h4>
            </div>

            <div className="flex items-center gap-3 shrink-0">
                {sub.position && sub.position <= 3 && (
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 px-3 py-1.5 rounded-lg text-amber-400 font-bold text-xs shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                        <Medal size={14} /> 
                        <span>{sub.position}. místo</span>
                    </div>
                )}

                {sub.rating && (
                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-white font-bold text-xs">
                        <Star size={12} className="fill-amber-400 text-amber-400" /> 
                        <span>{sub.rating}/5</span>
                    </div>
                )}

                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg group-hover:bg-blue-500 transition-colors ml-2">
                    {updatingId === sub.challenge_id ? <RefreshCcw size={14} className="animate-spin" /> : <Plus size={16} />}
                </div>
            </div>
        </div>
    );

    const SubmissionCard = ({ sub }: { sub: Submission }) => (
        <div className="group relative bg-[#001224]/40 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all duration-300 overflow-hidden flex flex-col h-full">
            
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 via-blue-600/0 to-blue-600/5 group-hover:to-blue-600/10 transition-all duration-500 pointer-events-none"></div>

            <div className="p-5 relative z-10 flex flex-col h-full">
                
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-1.5 backdrop-blur-sm">
                        {sub.Challenge?.StartupProfile?.logo_url ? (
                            <Image src={sub.Challenge.StartupProfile.logo_url} alt="Logo" width={32} height={32} className="object-contain" />
                        ) : (
                            <span className="font-bold text-gray-500 text-xs">
                                {sub.Challenge?.StartupProfile?.company_name.substring(0, 2).toUpperCase()}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {sub.position && sub.position <= 3 && (
                            <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400" title={`${sub.position}. místo`}>
                                <Trophy size={12} />
                            </div>
                        )}
                        {sub.rating && (
                            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg text-amber-400 font-bold text-xs">
                                <Star size={12} className="fill-amber-400" /> {sub.rating}/10
                            </div>
                        )}
                        {isOwner && (
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleVisibility(sub.challenge_id, true);
                                }}
                                disabled={updatingId === sub.challenge_id}
                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
                                title="Skrýt z profilu"
                            >
                                {updatingId === sub.challenge_id ? <RefreshCcw size={16} className="animate-spin" /> : <EyeOff size={16} />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="mb-2">
                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">
                        {sub.Challenge?.StartupProfile?.company_name}
                    </div>
                    <h4 className="text-lg font-bold text-white leading-tight line-clamp-2 group-hover:text-blue-300 transition-colors">
                        {sub.Challenge?.title}
                    </h4>
                </div>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-emerald-400/80 font-medium">
                        <CheckCircle size={12} />
                        <span>Dokončeno</span>
                    </div>

                    <Link href={`/challenges/${sub.challenge_id}`} className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-blue-400 transition-colors">
                        Detail <ArrowRight size={12} />
                    </Link>
                </div>
            </div>
        </div>
    );


    // --- RENDER HLAVNÍ KOMPONENTY ---

    return (
        <div className="bg-[#0B1623]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-6 flex flex-col relative overflow-hidden">
            
            {/* Header Sekce */}
            <div className="flex justify-between items-end mb-4 md:mb-8 relative z-10">
                <div className="flex items-center gap-1">
                        <div className="p-1.5 text-teal-400">
                            <Folder size={18} />
                        </div>
                        <h3 className="md:text-lg font-bold text-white">Portfolio</h3>
                    </div>
                
                {publicSubmissions.length > 0 && (
                    <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-center">
                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Projekty</div>
                            <div className="text-base font-bold text-white">{publicSubmissions.length}</div>
                        </div>
                        <div className="w-px h-6 bg-white/10 mx-1"></div>
                        <div className="text-center">
                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Rating</div>
                            <div className="text-base font-bold text-amber-400 flex items-center gap-1">
                                <Star size={12} className="fill-amber-400" /> 
                                {(publicSubmissions.reduce((acc, s) => acc + (s.rating || 0), 0) / publicSubmissions.filter(s => s.rating).length || 0).toFixed(1)}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {publicSubmissions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in-up">
                    {publicSubmissions.map((sub) => (
                        <SubmissionCard key={sub.challenge_id} sub={sub} />
                    ))}
                        {isOwner && hiddenSubmissions.length > 0 && (
                        <div className="min-h-[200px] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all cursor-pointer group p-6 text-center"
                            onClick={() => toggleVisibility(bestHiddenSubmission.challenge_id, false)}
                        >
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-100 transition-transform">
                                <Plus size={24} />
                            </div>
                            <span className="text-sm font-bold">Přidat další projekt</span>
                            <span className="text-xs text-gray-500 mt-1">
                                (+{hiddenSubmissions.length} skrytých)
                            </span>
                        </div>
                    )}
                </div>
            )}

            {publicSubmissions.length === 0 && hiddenSubmissions.length > 0 && isOwner && (
                <div className="flex-1 flex flex-col items-center justify-center py-2 animate-fade-in">
                    <div className="max-w-md w-full text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 mb-4 border border-blue-500/20">
                            <Lock size={20} />
                        </div>
                        <h3 className="md:text-lg font-bold text-white mb-2">Tvé portfolio je zatím soukromé</h3>
                        <p className="text-gray-400 text-xs md:text-sm mb-8">
                            Máš v šuplíku skvělé výsledky. Zveřejni ten nejlepší a ukaž firmám, co umíš:
                        </p>
                        
                        <div className="mx-auto w-full max-w-[90%] md:max-w-full text-left transform transition-transform hover:scale-100 duration-300">
                            <HiddenSubmissionPreview sub={bestHiddenSubmission} />
                        </div>
                    </div>
                </div>
            )}

            {publicSubmissions.length === 0 && hiddenSubmissions.length === 0 && isOwner && (
                <div className="flex-1 flex flex-col items-center justify-center py-12 animate-fade-in text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 relative border border-white/5">
                        <Rocket size={32} className="text-gray-500" />
                        <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75"></div>
                        <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full border-2 border-[#0B1623]"></div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Startujeme kariéru?</h3>
                    <p className="text-gray-400 max-w-xs mx-auto mb-8 text-sm leading-relaxed">
                        Tvůj profil potřebuje důkazy o tvých schopnostech. Vyber si výzvu a ukaž startupům, co v tobě je.
                    </p>
                    <Link 
                        href="/challenges" 
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2 hover:scale-100 active:scale-95"
                    >
                        <Rocket size={18} /> Najít první výzvu
                    </Link>
                </div>
            )}

            {publicSubmissions.length === 0 && !isOwner && (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center opacity-60">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                        <Lock size={24} className="text-gray-500" />
                    </div>
                    <p className="text-gray-400 font-medium text-xs md:text-sm">Uživatel zatím nezveřejnil žádné projekty.</p>
                </div>
            )}
        </div>
    );
}