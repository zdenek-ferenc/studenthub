"use client";

import { useState } from 'react';
import Image from 'next/image';

// Definujeme si typy pro data, která bude komponenta zobrazovat
type Skill = { id: string; name: string; };
type Challenge = {
title: string;
description: string;
goals: string;
expected_outputs: string;
budget_in_cents: number | null;
max_applicants: number | null;
Submission: { id: string }[];
ChallengeSkill: { Skill: Skill }[];
};

export default function ChallengeDetailBox({ challenge }: { challenge: Challenge }) {
const [isDetailsVisible, setIsDetailsVisible] = useState(false);
const applicantCount = challenge.Submission.length;

return (
    <div className="bg-white p-4 rounded-2xl shadow-lg">
    <div className="text-center">
        <Image 
        src="/logo.svg" // Placeholder pro logo startupu, později můžeme brát z challenge.StartupProfile.logo_url
        alt="logo firmy" 
        width={64} 
        height={64} 
        className="mx-auto rounded-lg mb-4"
        />
        <h1 className="text-3xl font-bold text-[var(--barva-tmava)]">{challenge.title}</h1>
    </div>

    <div className="mt-6">
        <p className="text-center text-lg font-semibold text-[var(--barva-tmava)] mb-4">Dovednosti</p>
        <div className="flex flex-wrap justify-center gap-2">
        {challenge.ChallengeSkill.map(({ Skill }) => (
            <span key={Skill.id} className="px-3 py-1 bg-[var(--barva-primarni2)] border rounded-3xl border-[var(--barva-primarni)] text-[var(--barva-primarni)]">
            {Skill.name}
            </span>
        ))}
        </div>
    </div>

    <div className="flex justify-center items-center gap-40 text-center mt-6">
        <div className='flex flex-col gap-2'>
        <p className="text-md font-semibold text-[var(--barva-tmava)]">Počet přihlášených</p>
        <p className="font-bold text-xl text-[var(--barva-tmava)]">
            {applicantCount} / {challenge.max_applicants || '∞'}
        </p>
        </div>
        <div className='flex flex-col gap-2'>
        <p className="text-md font-semibold text-[var(--barva-tmava)]">Odměna</p>
        <p className="font-bold text-xl text-[var(--barva-tmava)]">
            {challenge.budget_in_cents ? `${challenge.budget_in_cents} Kč` : 'Nefinanční'}
        </p>
        </div>
    </div>

      {/* Skládací sekce se zadáním */}
    <div className="mt-8 border-t border-gray-200">
        <button 
        onClick={() => setIsDetailsVisible(!isDetailsVisible)} 
        className="font-semibold text-xl cursor-pointer text-[var(--barva-tmava)] w-full text-left flex justify-between items-center py-4 px-2"
        >
        Původní zadání
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isDetailsVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
        </button>
        {isDetailsVisible && (
        <div className="prose max-w-none pb-4 text-[var(--barva-tmava)]">
            <p>{challenge.description}</p>
            <h4 className='font-semibold text-md mt-2 py-2'>Cíle</h4>
            <p className='py-2'>{challenge.goals}</p>
            <h4 className='font-semibold text-md mt-2 py-2'>Očekávané výstupy</h4>
            <p className='py-2'>{challenge.expected_outputs}</p>
        </div>
        )}
    </div>
    </div>
);
}
