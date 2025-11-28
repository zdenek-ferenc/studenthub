"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Check, Loader2 } from 'lucide-react';

type MissingItemSuggestionProps = {
    type: 'skill' | 'category'; 
    label: string; 
};

export default function MissingItemSuggestion({ type, label }: MissingItemSuggestionProps) {
    const { user, profile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [suggestion, setSuggestion] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async () => {
        if (!suggestion.trim() || !user) return;

        setStatus('loading');

        try {
            let userName = 'Neznámý uživatel';
            if (profile?.role === 'startup' && profile.StartupProfile) {
                userName = profile.StartupProfile.company_name ?? userName;
            } else if (profile?.role === 'student' && profile.StudentProfile) {
                userName = `${profile.StudentProfile.first_name} ${profile.StudentProfile.last_name}`;
            }

            const response = await fetch('/api/submit-missing-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    userName: userName,
                    suggestion: suggestion,
                    type: type
                }),
            });

            if (!response.ok) throw new Error('Chyba odeslání');

            setStatus('success');
            setSuggestion('');
            
            setTimeout(() => {
                setIsOpen(false);
                setStatus('idle');
            }, 3000);

        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2 animate-fade-in">
                <Check size={16} />
                <span>Díky! Váš návrh jsme uložili a brzy ho přidáme.</span>
            </div>
        );
    }

    return (
        <div className="mt-4 sm:mt-6 text-sm md:text-base">
            {!isOpen ? (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="text-[var(--barva-primarni)] cursor-pointer hover:underline font-medium flex items-center gap-1 opacity-80 hover:opacity-100 transition-all ease-in-out duration-200"
                >
                    Chybí vám zde {label}?
                </button>
            ) : (
                <div className="p-3 rounded-lg animate-in fade-in slide-in-from-top-2">
                    <p className="font-semibold text-[var(--barva-tmava)] mb-2">Jakou {label} postrádáte?</p>
                    <textarea
                        value={suggestion}
                        onChange={(e) => setSuggestion(e.target.value)}
                        placeholder={`Např. ${type === 'skill' ? 'Rust, Copywriting...' : 'Fintech, Healthtech...'}`}
                        className="w-full p-2 border text-[var(--barva-tmava)] border-gray-300 resize-none rounded-md text-sm focus:ring-2 focus:ring-[var(--barva-primarni)] focus:border-transparent outline-none bg-white"
                        rows={2}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="px-3 cursor-pointer py-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Zrušit
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={status === 'loading' || !suggestion.trim()}
                            className="bg-[var(--barva-primarni)] cursor-pointer text-white px-3 py-1.5 rounded-md flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            Odeslat
                        </button>
                    </div>
                    {status === 'error' && (
                        <p className="text-red-500 text-xs mt-2">Něco se pokazilo. Zkuste to prosím později.</p>
                    )}
                </div>
            )}
        </div>
    );
}