"use client";

import { Download, Info, GripVertical, Check, X } from 'lucide-react';
import { useState } from 'react';
import FeatureTooltip, { MODAL_CONTENT_MAP } from './FeatureTooltip'; 

const DemoSubmissionCard = () => (
<div className="bg-white rounded-2xl shadow-xs border-2 border-gray-100 p-5 h-full">
    <div className="flex flex-col justify-between items-start gap-2 mb-4">
    <h4 className="text-lg font-bold text-[var(--barva-tmava)]">Řešení #1</h4>
    <button className="px-4 py-2 bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)] text-sm font-semibold rounded-full flex items-center gap-2 cursor-pointer">
        <Download size={16} />
        <span>Stáhnout (.zip)</span>
    </button>
    </div>
    <div className="space-y-4">
    <div>
        <label className="text-sm font-semibold text-gray-700">Hodnocení (1-10)</label>
        <div className="flex flex-wrap gap-1 mt-1">
        {Array.from({ length: 10 }).map((_, i) => (
            <button
            key={i}
            className={`w-8 h-8 grid place-items-center text-sm font-bold border rounded transition-all ${
                i === 8 
                ? 'bg-[var(--barva-primarni)] text-white  border-[var(--barva-primarni)]'
                : 'bg-gray-100 text-gray-600 cursor-pointer hover:text-white transition-all ease-in-out duration-200 hover:bg-[var(--barva-primarni)] border-gray-200'
            }`}
            >
            {i + 1}
            </button>
        ))}
        </div>
    </div>
    <div>
        <label className="text-sm font-semibold text-gray-700">Slovní feedback</label>
        <textarea
        className="w-full h-24 p-2 border border-gray-200 rounded-lg mt-1 bg-gray-50 resize-none"
        placeholder="Skvělá práce! Líbí se nám..."
        disabled
        />
    </div>
    <button className='flex justify-center items-center mx-auto text-white bg-[var(--barva-primarni)] px-5 py-2 rounded-full hover:bg-[var(--barva-primarni)]/80 transition-all ease-in-out duration-200 cursor-pointer text-sm sm:text-base'>
      Uložit hodnocení
    </button>
    </div>
</div>
);


const DemoFinalSelection = () => (
<div className="grid grid-cols-2 gap-5 p-5 bg-gray-50 rounded-2xl shadow-xs border-2 border-gray-100 h-full">
    <div>
    <h4 className="block sm:hidden font-semibold text-gray-800 mb-3">Finalisté</h4>
    <h4 className="hidden sm:block font-semibold text-gray-800 mb-3">Finalisté k výběru</h4>
    <div className="space-y-3">
        <div className="p-3 bg-white rounded-lg shadow-sm border flex items-center justify-between">
            <div className='flex flex-col'>
                <span className="font-medium text-sm">Řešení #2</span>
                <span className="font-medium text-gray-500 text-xs">(8/10)</span>
            </div>
        
        <GripVertical className="text-gray-400" />
        </div>
        <div className="p-3 bg-white rounded-lg shadow-sm border flex items-center justify-between">
        <div className='flex flex-col'>
                <span className="font-medium text-sm">Řešení #3</span>
                <span className="font-medium text-gray-500 text-xs">(7/10)</span>
            </div>
        <GripVertical className="text-gray-400" />
        </div>
    </div>
    </div>
    <div>
    <h4 className="hidden sm:block font-semibold text-gray-800 mb-3">Vítězné pozice</h4>
    <h4 className="sm:hidden font-semibold text-gray-800 mb-3">Vítězové</h4>
    <div className="space-y-3">
        <div className="p-3 bg-white rounded-lg shadow-md border-2 border-amber-400 flex gap-1 items-center justify-between">
        <span className="font-medium text-sm">1. místo: Řešení #1</span>
        <Check className="text-green-500" />
        </div>
        <div className="p-3 h-12 bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
        <span className="text-gray-500 text-sm">Přetáhni 2. místo</span>
        </div>
        <div className="p-3 h-12 bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
        <span className="text-gray-500 text-sm">Přetáhni 3. místo</span>
        </div>
    </div>
    </div>
</div>
);

export default function DemoStartupFeatures() {
const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

const handleToggle = (key: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setActiveTooltip(prev => (prev === key ? null : key));
};

return (
<div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-6" onClick={() => setActiveTooltip(null)}>
  <div className="relative">
    {/* Nadpis sekce */}
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

  <div className="relative">
    {/* Nadpis sekce */}
    <h3 className=" mb-2 text-lg font-semibold">Výběr vítězů výzvy</h3>

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