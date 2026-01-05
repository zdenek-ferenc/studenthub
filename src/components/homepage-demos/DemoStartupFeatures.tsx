"use client";

import { Info, X } from 'lucide-react';
import { useState } from 'react';
import FeatureTooltip, { MODAL_CONTENT_MAP } from './FeatureTooltip';
import DemoSubmissionCard from './DemoSubmissionCard';
import DemoFinalSelection from './DemoFinalSelection';

export default function DemoStartupFeatures() {
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

    const handleToggle = (key: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveTooltip(prev => (prev === key ? null : key));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-6" onClick={() => setActiveTooltip(null)}>
            <div className="relative h-fit">
                <h3 className="mb-2 text-lg font-semibold">Ohodnocení řešení</h3>

                <button
                    onClick={(e) => handleToggle('submission', e)}
                    className="absolute top-12 right-4 z-10 w-8 h-8 flex cursor-pointer items-center justify-center bg-blue-100/50 text-[var(--barva-primarni)] rounded-full hover:bg-blue-200 transition-all ease-in-out duration-200"
                    title="Co to je?"
                >
                    {activeTooltip === 'submission' ? <X size={18} /> : <Info size={18} />}
                </button>

                <FeatureTooltip
                    content={MODAL_CONTENT_MAP['submission']}
                    isOpen={activeTooltip === 'submission'}
                    onClose={() => setActiveTooltip(null)}
                />

                <DemoSubmissionCard />
            </div>

            <div className="relative h-fit">
                <h3 className="mb-2 text-lg font-semibold">Výběr vítězů výzvy</h3>

                <button
                    onClick={(e) => handleToggle('selection', e)}
                    className="absolute top-12 right-4 z-10 w-8 h-8 flex cursor-pointer items-center justify-center bg-blue-100/50 text-[var(--barva-primarni)] rounded-full hover:bg-blue-200 transition-all ease-in-out duration-200"
                    title="Co to je?"
                >
                    {activeTooltip === 'selection' ? <X size={18} /> : <Info size={18} />}
                </button>

                <FeatureTooltip
                    content={MODAL_CONTENT_MAP['selection']}
                    isOpen={activeTooltip === 'selection'}
                    onClose={() => setActiveTooltip(null)}
                />

                <DemoFinalSelection />
            </div>
        </div>
    );
}