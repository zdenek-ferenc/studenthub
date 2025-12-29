"use client";

import { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsentWidget({ onDecision }: { onDecision: (allowed: boolean) => void }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('rh_cookie_consent');
        
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        } else if (consent === 'granted') {
            onDecision(true);
        }
    }, [onDecision]);

    const handleAccept = () => {
        localStorage.setItem('rh_cookie_consent', 'granted');
        setIsVisible(false);
        onDecision(true);
    };

    const handleDecline = () => {
        localStorage.setItem('rh_cookie_consent', 'denied');
        setIsVisible(false);
        onDecision(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-0 left-0 right-0 md:bottom-8 md:left-1/2 md:-translate-x-1/2 md:w-[480px] z-[100] p-4"
                >
                    <div className="bg-[#0B1623]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-5 relative overflow-hidden">
                        
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[50px] rounded-full pointer-events-none"></div>

                        <div className="flex gap-4 relative z-10">
                            <div className="shrink-0">
                                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                    <Cookie size={24} />
                                </div>
                            </div>
                            
                            <div className="flex-1">
                                <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                                    Respektujeme tvé soukromí
                                </h3>
                                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                                    Používáme cookies k vylepšování platformy a analýze návštěvnosti. 
                                    Data jsou anonymní. Souhlasíš s jejich zapnutím?
                                </p>

                                <div className="flex gap-3">
                                    <button 
                                        onClick={handleAccept}
                                        className="flex-1 btn-shiny bg-[var(--barva-primarni)] hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <ShieldCheck size={14} />
                                        Souhlasím
                                    </button>
                                    <button 
                                        onClick={handleDecline}
                                        className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white text-xs font-bold transition-all active:scale-95"
                                    >
                                        Odmítnout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}