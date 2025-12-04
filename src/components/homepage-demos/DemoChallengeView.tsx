"use client";

import DemoStudentChallengeCard from './DemoStudentChallengeCard';
import { mockChallengeData1, mockChallengeData2 } from './mock-data';
import { Filter } from 'lucide-react';

export default function DemoChallengeView() {
  return (
    <div className="p-4 bg-gray-50 rounded-xl sm:max-h-[500px] overflow-y-auto custom-scrollbar">
      <div className="flex flex-wrap gap-2 mb-4">
        <button className="flex items-center gap-2 px-2 py-1 md:px-3 md:py-2 text-sm font-semibold text-white bg-[var(--barva-primarni)] rounded-full shadow-md cursor-default">
          <Filter size={16} className='w-4' />
          <span className='text-xs md:text-sm'>Filtrovat</span>
        </button>
        <span className="px-2.5 py-1 md:px-4 md:py-2 font-medium text-[var(--barva-primarni)] border border-[var(--barva-primarni)] bg-[var(--barva-svetle-pozadi)] text-xs md:text-sm rounded-full cursor-default">React</span>
        <span className="px-2.5 py-1 md:px-4 md:py-2 font-medium text-[var(--barva-primarni)] border border-[var(--barva-primarni)] bg-[var(--barva-svetle-pozadi)] text-xs md:text-sm rounded-full cursor-default">Figma</span>
        <span className="px-2.5 py-1 md:px-4 md:py-2 font-medium text-[var(--barva-primarni)] border border-[var(--barva-primarni)] bg-[var(--barva-svetle-pozadi)] text-xs md:text-sm rounded-full cursor-default">Finanční odměna</span>
      </div>
      
      <div className="space-y-2">
        <DemoStudentChallengeCard
          challenge={mockChallengeData1}
          isBookmarked={false}
        />
        <div className='hidden mt-4 md:block'>
          <DemoStudentChallengeCard
          challenge={mockChallengeData2}
          isBookmarked={true}
        />
        </div>
        
      </div>
    </div>
  );
}