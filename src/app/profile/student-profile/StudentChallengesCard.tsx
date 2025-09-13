"use client";

import Link from 'next/link';
import Image from 'next/image';
import DeadlineTag from '../../../components/DeadlineTag'; // <-- IMPORT

// Definujeme si typy pro data, která bude karta zobrazovat
type Challenge = {
  id: string;
  title: string;
  deadline: string | null; // <-- Přidáme deadline
  StartupProfile: {
    company_name: string;
    logo_url: string | null;
  } | null;
};

// Komponenta teď přijímá celý objekt výzvy
export default function ProfileChallengeCard({ challenge }: { challenge: Challenge }) {
  return (
    <div className="relative">
        <Link 
          href={`/challenges/${challenge.id}`} 
          className="flex items-center gap-4 p-4 rounded-2xl bg-white hover:bg-[var(--barva-svetle-pozadi)] hover:shadow-none transition-all duration-300"
        >
          {challenge.StartupProfile?.logo_url ? (
            <Image
              src={challenge.StartupProfile.logo_url}
              alt={`${challenge.StartupProfile.company_name} logo`}
              width={48}
              height={48}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center font-bold text-gray-500 flex-shrink-0">
              {challenge.StartupProfile?.company_name?.substring(0, 2)}
            </div>
          )}

          <div className="flex-grow">
            <p className="font-semibold text-gray-600 text-sm">{challenge.StartupProfile?.company_name}</p>
            <h4 className="font-bold text-[var(--barva-tmava)] -mt-1">{challenge.title}</h4>
          </div>
        </Link>
        {/* --- Přidání tagu s absolutní pozicí --- */}
        <div className="absolute top-1/2 -right-3 -translate-y-1/2">
            <DeadlineTag deadline={challenge.deadline} />
        </div>
    </div>
  );
}