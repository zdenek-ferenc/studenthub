"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

interface CookieConsentWidgetProps {
    onDecision: (enabled: boolean) => void;
}

export default function CookieConsentWidget({ onDecision }: CookieConsentWidgetProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consensus = localStorage.getItem('cookie_consent');
        
        if (consensus === 'true') {
            onDecision(true);
            setIsVisible(false);
        } else if (consensus === 'false') {
            onDecision(false);
            setIsVisible(false);
        } else {
            setIsVisible(true);
        }
    }, [onDecision]);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'true');
        onDecision(true);
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie_consent', 'false');
        onDecision(false); 
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed bottom-4 right-4 z-[9999] w-[calc(100vw-32px)] md:w-[400px] max-w-md"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <div className="bg-[#0B1623]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/50">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 shrink-0">
                                <Cookie className="text-blue-400" size={24} />
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-white font-bold text-sm">Nastavení soukromí</h4>
                                    <button 
                                        onClick={handleDecline}
                                        className="text-gray-500 hover:text-white transition-colors -mt-1 -mr-1 p-1"
                                        aria-label="Zavřít"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                
                                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                                    Používáme cookies k vylepšování platformy a analýze návštěvnosti. 
                                    Data jsou anonymizovaná. {' '}
                                    <Link href="/zasady-ochrany-udaju" className="text-blue-400 hover:underline">
                                        Více informací
                                    </Link>
                                </p>

                                <div className="flex gap-3">
                                    <button 
                                        onClick={handleAccept}
                                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                                    >
                                        Přijmout vše
                                    </button>
                                    <button 
                                        onClick={handleDecline}
                                        className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 text-xs font-medium hover:bg-white/5 transition-colors active:scale-95"
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