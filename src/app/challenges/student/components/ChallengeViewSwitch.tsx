"use client";

import { motion } from 'framer-motion';

export type ChallengeViewType = 'available' | 'applied';

interface ChallengeViewSwitchProps {
    currentView: ChallengeViewType;
    setCurrentView: (view: ChallengeViewType) => void;
    availableCount: number;
    appliedCount: number;
}

function ChallengeViewSwitch({ currentView, setCurrentView, availableCount, appliedCount }: ChallengeViewSwitchProps) {
    const buttons: { id: ChallengeViewType; label: string; count: number }[] = [
        { id: 'available', label: 'Dostupné', count: availableCount },
        { id: 'applied', label: 'Přihlášené', count: appliedCount },
    ];

    return (
        <div className="p-1 bg-white rounded-full flex items-center max-w-sm my-2">
            {buttons.map(button => (
                <button
                    key={button.id}
                    onClick={() => setCurrentView(button.id)}
                    className={`relative flex-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap focus:outline-none flex items-center justify-center gap-1 sm:gap-2 z-10
                        ${currentView === button.id ? 'text-[var(--barva-primarni)]' : 'text-[var(--barva-primarni)]/70 hover:text-[var(--barva-primarni)] cursor-pointer'}
                    `}
                >
                    <span className="relative z-10">{button.label}</span>
                    <span className={`relative z-10 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold transition-colors ${currentView === button.id ? 'bg-[var(--barva-primarni2)] text-[var(--barva-primarni)]' : 'cursor-pointer bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)]'}`}>
                        {button.count}
                    </span>
                    {currentView === button.id && (
                        <motion.div
                            className="absolute inset-0 bg-white rounded-full border border-[var(--barva-primarni)] shadow-sm"
                            layoutId="activeChallengeViewPill"
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            style={{ zIndex: 0 }}
                        />
                    )}
                </button>
            ))}
        </div>
    );
}

export default ChallengeViewSwitch;