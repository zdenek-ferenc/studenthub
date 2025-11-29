"use client";

import { Download } from 'lucide-react';
import { useState } from 'react';

const DemoSubmissionCard = () => {
    const [selectedRating, setSelectedRating] = useState(9);

    return (
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
                                onClick={() => setSelectedRating(i + 1)}
                                className={`w-8 h-8 grid place-items-center text-sm font-bold border rounded transition-all ${
                                    selectedRating === i + 1
                                        ? 'bg-[var(--barva-primarni)] text-white border-[var(--barva-primarni)]'
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
                        className="w-full h-24 p-2 border border-gray-200 rounded-lg focus:outline-none mt-1 bg-gray-50 resize-none"
                        placeholder="Skvělá práce! Líbí se nám..."
                    />
                </div>
                <button className='flex justify-center items-center mx-auto text-white bg-[var(--barva-primarni)] px-5 py-2 rounded-full hover:bg-[var(--barva-primarni)]/80 transition-all ease-in-out duration-200 cursor-pointer text-sm sm:text-base'>
                    Uložit hodnocení
                </button>
            </div>
        </div>
    );
};

export default DemoSubmissionCard;
