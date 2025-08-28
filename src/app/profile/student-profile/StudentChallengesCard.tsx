"use client";

import Link from 'next/link';
import Image from 'next/image';

// Definujeme si typy pro data, která bude karta zobrazovat
type Challenge = {
  id: string;
  title: string;
  StartupProfile: {
    company_name: string;
    logo_url: string | null;
  } | null;
};

// Komponenta teď přijímá celý objekt výzvy
export default function ProfileChallengeCard({ challenge }: { challenge: Challenge }) {
  return (
    // Celá karta je teď klikatelný odkaz
    <Link 
      href={`/challenges/${challenge.id}`} 
      className="flex items-center gap-4 p-4 border-2 border-[var(--barva-svetle-pozadi)] bg-white rounded-2xl drop-shadow-[0_0px_10px_rgba(0,0,0,0.05)] hover:bg-[var(--barva-svetle-pozadi)] hover:shadow-none transition-all duration-300"
    >
      {/* Logo startupu */}
      {challenge.StartupProfile?.logo_url ? (
        <Image
          src={challenge.StartupProfile.logo_url}
          alt={`${challenge.StartupProfile.company_name} logo`}
          width={48}
          height={48}
          className="w-12 h-12 rounded-lg object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center font-bold text-gray-500">
          {challenge.StartupProfile?.company_name?.substring(0, 2)}
        </div>
      )}

      {/* Textová část */}
      <div>
        <p className="font-semibold text-gray-600 text-sm">{challenge.StartupProfile?.company_name}</p>
        <h4 className="font-bold text-[var(--barva-tmava)] -mt-1">{challenge.title}</h4>
      </div>
    </Link>
  );
}
