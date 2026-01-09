"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, ComponentType } from 'react';
import { 
    MapPin, 
    Github, 
    Linkedin, 
    Globe, 
    Edit3, 
    Save, 
    X, 
    GraduationCap,
    Settings,
} from 'lucide-react';
import { StudentProfile } from '../types';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';

const SocialButton = ({ icon: Icon, href, label }: { icon: ComponentType<{ size?: number; className?: string }>, href?: string | null, label: string }) => {
    if (!href) return null;
    const safeHref = href.startsWith('http') ? href : `https://${href}`;
    return (
        <a 
            href={safeHref} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300"
            title={label}
        >
            <div className="absolute inset-0 bg-blue-500/10 blur-lg rounded-full transition-opacity duration-300" />
            <Icon size={18} className="w-4 h-4 md:h-full md:w-full text-gray-400 group-hover:text-blue-400 relative z-10 transition-colors" />
        </a>
    );
};

export default function ModernStudentHeader({ profile, isOwner }: { profile: StudentProfile, isOwner: boolean }) {
    const { showToast } = useAuth();
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioText, setBioText] = useState(profile.bio || "");
    const [isSaving, setIsSaving] = useState(false);

    const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase();

    const handleSaveBio = async () => {
        setIsSaving(true);
        const { error } = await supabase
            .from('StudentProfile')
            .update({ bio: bioText })
            .eq('user_id', profile.user_id);

        if (error) {
            showToast("Chyba při ukládání bia", "error");
        } else {
            showToast("Bio úspěšně uloženo", "success");
            setIsEditingBio(false);
        }
        setIsSaving(false);
    };

    return (
        <div className="group relative w-full">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent rounded-3xl blur-xl" />
            
            <div className="relative bg-[#0B1623]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-6 shadow-2xl overflow-hidden">               
                <div className="absolute top-4 right-4 flex gap-1 z-20">
                    {isOwner && (
                        <button
                            onClick={() => setIsEditingBio(!isEditingBio)}
                            className={`
                                p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors
                                ${isEditingBio 
                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' 
                                    : 'text-neutral-400 hover:text-white hover:bg-white/10'
                                }
                            `}
                            title={isEditingBio ? "Zavřít úpravy" : "Upravit profil"}
                        >
                            <Edit3 size={16} />
                        </button>
                    )}
                    {isOwner && (
                        <Link 
                            href="/profile/edit"
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Nastavení profilu"
                        >
                            <Settings size={16} />
                        </Link>
                    )}
                </div>

                <div className="flex flex-col items-center relative z-10">                    
                    <div className="relative w-22 h-22 md:w-26 md:h-26 mb-5">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-teal-500 rounded-full blur-md opacity-40 animate-pulse" />
                        
                        <div className="absolute -bottom-1 -right-1 z-20">
                            <div className="bg-[#001224] p-1 rounded-full">
                                <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[8px] md:text-[10px] font-bold px-2 md:px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg border border-amber-400/30">
                                    <span>LVL <span className='text-[10px] md:text-[12px]'>{profile.level}</span></span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-full rounded-full overflow-hidden relative bg-[#001224] ring-2 ring-white/10 shadow-2xl group-hover:ring-blue-500/30 transition-all duration-500">
                            {profile.profile_picture_url ? (
                                <Image 
                                    src={profile.profile_picture_url} 
                                    alt="Profile" 
                                    fill 
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400 bg-gradient-to-br from-[#1a2c42] to-[#0B1623]">
                                    {initials}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-center w-full mb-5">
                        <h1 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">
                            {profile.first_name} {profile.last_name}
                        </h1>
                        
                        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-400">
                            {profile.recruitment_status === 'open_to_work' && (
                                <span className="flex items-center gap-1.5 text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Open to Work
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <MapPin size={14} className="text-gray-500" />
                                ČR
                            </span>
                        </div>

                        {(profile.university || profile.field_of_study) && (
                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-full text-xs text-gray-300 max-w-full truncate">
                                <GraduationCap size={14} className="text-blue-400 shrink-0" />
                                <span className="truncate">
                                    {profile.university}
                                    {profile.university && profile.field_of_study && <span className="mx-1 opacity-50">|</span>}
                                    {profile.field_of_study}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-1" />

                    <div className="w-full mt-4 mb-6 px-1 group/bio">
                        {isEditingBio ? (
                            <div className="relative animate-fade-in-up">
                                <textarea
                                    value={bioText}
                                    onChange={(e) => setBioText(e.target.value)}
                                    className="w-full bg-[#001224]/50 border border-blue-500/50 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[100px] resize-none shadow-inner custom-scrollbar"
                                    placeholder="Napište něco o sobě..."
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    <button 
                                        onClick={() => setIsEditingBio(false)}
                                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        title="Zrušit"
                                    >
                                        <X size={16} />
                                    </button>
                                    <button 
                                        onClick={handleSaveBio}
                                        disabled={isSaving}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                                    >
                                        {isSaving ? '...' : <><Save size={14} /> Uložit</>}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="min-h-[40px]">
                                <p className="text-gray-400 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                                    {bioText || "Zatím bez popisu."}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center gap-3 w-full pt-2">
                        <SocialButton icon={Github} href={profile.github_url} label="GitHub" />
                        <SocialButton icon={Linkedin} href={profile.linkedin_url} label="LinkedIn" />
                        <SocialButton icon={Globe} href={profile.personal_website_url} label="Web" />
                    </div>
                </div>
            </div>
        </div>
    );
}