"use client";

import { useState } from 'react';
import Image from 'next/image';

// OPRAVA: Aktualizovali jsme typ, aby obsahoval všechny potřebné informace
type Skill = { id: string; name: string; };
type StartupProfile = { company_name: string; logo_url: string | null; };
type Challenge = {
  title: string;
  description: string;
  goals: string;
  expected_outputs: string;
  reward_first_place: number | null;
  reward_second_place: number | null;
  reward_third_place: number | null;
  max_applicants: number | null;
  Submission: { id: string }[];
  ChallengeSkill: { Skill: Skill }[];
  StartupProfile: StartupProfile | null; // Přidali jsme profil startupu
};

// OPRAVA: Nová, elegantnější komponenta pro zobrazení odměn
const RewardsDisplay = ({ challenge }: { challenge: Challenge }) => {
  const rewards = [
    { place: '1. místo', amount: challenge.reward_first_place },
    { place: '2. místo', amount: challenge.reward_second_place },
    { place: '3. místo', amount: challenge.reward_third_place },
  ].filter(r => r.amount); // Zobrazíme jen ceny, které reálně existují

  if (rewards.length === 0) {
    return <p className="font-semibold text-gray-800">Nefinanční</p>;
  }

  // Pokud je jen jedna odměna, zobrazíme ji jednoduše a výrazně
  if (rewards.length === 1) {
      return <p className="font-bold text-md text-[var(--barva-tmava)]">{rewards[0].amount} Kč</p>
  }
  
  // Pokud je více odměn, zobrazíme je strukturovaně
  return (
    <div className="flex items-baseline gap-4">
      {rewards.map(({ place, amount }) => (
        <div key={place} className="text-center">
           <span className="text-md font-semibold text-[var(--barva-podtext)] block">{place}</span>
           <span className="font-bold text-lg text-[var(--barva-tmava)]">{amount} Kč</span>
        </div>
      ))}
    </div>
  );
};

export default function ChallengeDetailBox({ challenge }: { challenge: Challenge }) {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  return (
    // Hlavní kontejner s modrým rámečkem
    <div className="p-1.5 rounded-3xl shadow-xs bg-white">
      <div className="bg-white px-10 pt-10 rounded-2xl">
        <div className="text-center">
          {challenge.StartupProfile?.logo_url ? (
            <Image 
              src={challenge.StartupProfile.logo_url}
              alt="logo firmy" 
              width={64} 
              height={64} 
              className="mx-auto rounded-lg mb-2"
            />
          ) : (
            <div className="w-16 h-16 mx-auto rounded-lg bg-gray-200 mb-2"></div>
          )}
          <p className="font-semibold text-gray-700">{challenge.StartupProfile?.company_name}</p>
          <h1 className="text-3xl font-bold text-[var(--barva-tmava)] -mt-1">{challenge.title}</h1>
        </div>

        <div className="mt-6 flex flex-col justify-center items-center">
          <p className="text-center text-lg font-semibold text-[var(--barva-tmava)] mb-3">Dovednosti</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-2/3">
            {challenge.ChallengeSkill.map(({ Skill }) => (
              <span key={Skill.id} className="px-4 py-2 rounded-full bg-[var(--barva-svetle-pozadi)] border border-[var(--barva-primarni)] text-md text-[var(--barva-primarni)] font-semibold">
                {Skill.name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-center items-baseline gap-8 text-center mt-8">
          <div className='flex items-center flex-col gap-2'>
            <p className="text-lg font-semibold text-[var(--barva-tmava)]">Odměna:</p>
            <RewardsDisplay challenge={challenge} />
          </div>
        </div>

        {/* Skládací sekce se zadáním */}
        <div className="mt-8 border-t border-gray-200">
        <button 
        onClick={() => setIsDetailsVisible(!isDetailsVisible)} 
        className="font-semibold text-xl cursor-pointer text-[var(--barva-tmava)] w-full text-left flex justify-between items-center py-4"
        >
        Původní zadání
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform ${isDetailsVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
        </button>
        {isDetailsVisible && (
        <div className="prose max-w-none pb-4 text-[var(--barva-tmava)]">
            <p className='text-lg'>{challenge.description}</p>
            <h4 className='font-semibold text-xl py-4'>Cíle</h4>
            <p className='text-lg'>{challenge.goals}</p>
            <h4 className='font-semibold text-xl py-4'>Očekávané výstupy</h4>
            <p className='text-lg pb-5'>{challenge.expected_outputs}</p>
        </div>
        )}
    </div>
      </div>
    </div>
  );
}
