"use client";

import Image from 'next/image';
import { CheckCircle, Globe } from 'lucide-react';
import { Startup } from '../contexts/DataContext';
import Link from 'next/link';

type StartupCardProps = {
  startup: Startup;
};

export default function StartupCard({ startup }: StartupCardProps) {
  if (!startup || !startup.company_name) {
    return null;
  }

  const now = new Date();

  // Statistiky
  const activeChallenges = startup.Challenge?.filter(c => {
    const deadlineDate = new Date(c.deadline);
    return c.status === 'open' && deadlineDate >= now;
  }).length ?? 0;

  const completedChallenges = startup.Challenge?.filter(c => {
    const deadlineDate = new Date(c.deadline);
    return c.status === 'closed' || (c.status === 'open' && deadlineDate < now);
  }).length ?? 0;

  // URL úprava
  const displayUrl = startup.website?.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  const websiteUrl = startup.website && (startup.website.startsWith('http') ? startup.website : `https://${startup.website}`);

  return (
    <Link href={`/profile/${startup.user_id}`} className="block group h-full">
      <div className="
        relative flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm 
        transition-all duration-200 ease-in-out
      group-hover:border-blue-200 group-hover:-translate-y-0.5
        overflow-hidden
      ">
        
        {/* HLAVNÍ ČÁST */}
        <div className="p-5 flex-grow flex flex-col">
          
          {/* HEADER: Logo + Jméno */}
          <div className="flex items-center gap-4">
            {/* Logo - fixní velikost */}
            <div className="relative flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border border-gray-100 bg-gray-50">
              {startup.logo_url ? (
                <Image 
                  src={startup.logo_url} 
                  alt={startup.company_name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center bg-[var(--barva-svetle-pozadi)] justify-center text-[var(--barva-primarni)] font-bold text-lg">
                  {startup.company_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Texty */}
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900 text-base truncate group-hover:text-[var(--barva-primarni)] transition-colors">
                {startup.company_name}
              </h3>
              {websiteUrl && (
                 <div 
                   onClick={(e) => {
                     e.stopPropagation();
                     window.open(websiteUrl, '_blank');
                   }}
                   className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 cursor-pointer w-fit transition-colors mt-0.5"
                 >
                   <Globe size={11} />
                   <span className="truncate max-w-[140px]">{displayUrl}</span>
                 </div>
               )}
            </div>
          </div>

          <div className="flex-grow" />

          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 h-[45px]"> 
            {startup.StartupCategory?.length > 0 ? (
                <>
                    {startup.StartupCategory.slice(0, 2).map(({ Category }) => (
                    Category && (
                        <span 
                        key={Category.id} 
                        className="px-2.5 py-1 rounded-full text-xs border border-[var(--barva-primarni)] font-medium text-[var(--barva-primarni)] bg-[var(--barva-svetle-pozadi)] whitespace-nowrap"
                        >
                        {Category.name}
                        </span>
                    )
                    ))}
                    {startup.StartupCategory.length > 2 && (
                    <span className="px-2 py-1 text-xs text-gray-400 font-medium whitespace-nowrap">
                        +{startup.StartupCategory.length - 2}
                    </span>
                    )}
                </>
            ) : (
                <span className="text-xs text-gray-300 italic">Bez kategorie</span>
            )}
          </div>
        </div>

        <div className="bg-gray-50/80 px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm h-[45px]">
          
          <div className={`flex items-center gap-2 ${activeChallenges > 0 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
            <div className={`
                flex-shrink-0 w-2 h-2 rounded-full 
                ${activeChallenges > 0 ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-300'}
            `} />
            <span>
              <span className="font-bold">{activeChallenges}</span> Aktivní výzvy
            </span>
          </div>

          {completedChallenges > 0 && (
            <div className="flex items-center gap-1.5 text-gray-500" title="Dokončené výzvy">
              <CheckCircle size={14} className="text-blue-500" />
              <span>{completedChallenges} Hotové</span>
            </div>
          )}

        </div>
      </div>
    </Link>
  );
}