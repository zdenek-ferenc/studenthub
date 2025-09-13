"use client";

import Image from 'next/image';
import { Briefcase, CheckCircle } from 'lucide-react';
import { Startup } from '../contexts/DataContext';

type StartupCardProps = {
  startup: Startup;
};

// --- NOVÁ POMOCNÁ FUNKCE PRO SKLOŇOVÁNÍ ---
const formatChallengeText = (count: number, type: 'active' | 'completed') => {
  const activeNouns = {
    one: 'aktivní výzva',
    few: 'aktivní výzvy',
    other: 'aktivních výzev',
  };

  const completedNouns = {
    one: 'hotová výzva',
    few: 'hotové výzvy',
    other: 'hotových výzev',
  };

  const nouns = type === 'active' ? activeNouns : completedNouns;

  if (count === 1) {
    return `${count} ${nouns.one}`;
  }
  if (count >= 2 && count <= 4) {
    return `${count} ${nouns.few}`;
  }
  // Pro 0, 5 a více
  return `${count} ${nouns.other}`;
};


export default function StartupCard({ startup }: StartupCardProps) {
  if (!startup) {
    return null;
  }

  const activeChallenges = startup.Challenge?.filter(c => c.status === 'open').length ?? 0;
  const completedChallenges = startup.Challenge?.filter(c => c.status === 'closed').length ?? 0;

  return (
      <div className="bg-white rounded-2xl shadow-xs p-6 border border-gray-100 hover:shadow-none transition-all duration-300 ease-in-out flex flex-col h-full cursor-pointer">
        
        <div className="flex items-center gap-4 mb-4">
          {startup.logo_url ? (
            <Image 
              src={startup.logo_url} 
              alt={startup.company_name}
              width={56}
              height={56}
              className="w-14 h-14 rounded-full object-cover" 
            />
          ) : (
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full text-xl font-bold text-indigo-600">
              <span>{startup.company_name.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-gray-800">{startup.company_name}</h3>
            {startup.website && <p className="text-sm text-blue-500 hover:underline">{startup.website}</p>}
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-5 line-clamp-3 flex-grow">
          {startup.description || 'Tento startup zatím nepřidal žádný popis.'}
        </p>

        {/* --- ZMĚNA ZDE: POUŽITÍ NOVÉ FUNKCE --- */}
        <div className="flex items-center gap-6 mb-5 text-sm font-medium text-gray-500">
          <div className="flex items-center gap-1.5">
            <Briefcase className="text-blue-500" size={18} />
            <span>{formatChallengeText(activeChallenges, 'active')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="text-green-500" size={18} />
            <span>{formatChallengeText(completedChallenges, 'completed')}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          {startup.StartupCategory?.slice(0, 3).map(({ Category }) => (
            Category && (
              <span key={Category.id} className="flex items-center justify-center gap-1.5 bg-[var(--barva-svetle-pozadi)] leading-none text-[var(--barva-primarni)] border border-[var(--barva-primarni)] px-3 py-2 rounded-full text-sm font-semibold transition-colors">
                {Category.name}
              </span>
            )
          ))}
          {startup.StartupCategory?.length > 3 && (
             <span className="text-[var(--barva-primarni)] text-sm">
               +{startup.StartupCategory.length - 3} další
             </span>
          )}
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-center">
          <div className="flex justify-between items-center bg-[var(--barva-primarni)] text-white font-bold py-2 px-5 rounded-2xl hover:opacity-90 transition-opacity">
            Profil startupu
          </div>
        </div>
      </div>
  );
}