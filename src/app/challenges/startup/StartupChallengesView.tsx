"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext'; // Uprav cestu
import { supabase } from '../../../lib/supabaseClient'; // Uprav cestu
import Image from 'next/image';
import ChallengeCard from './components/ChallengeCard'; // Importujeme naši novou, detailní kartu

// Definujeme si komplexní typ pro všechna data, která potřebujeme
type Challenge = {
id: string;
title: string;
status: 'draft' | 'open' | 'closed' | 'archived';
short_description: string | null;
budget_in_cents: number | null;
deadline: string | null;
created_at: string;
max_applicants: number | null;
ChallengeSkill: { Skill: { id: string, name: string } }[];
Submission: { id: string }[];
};

export default function StartupChallengesView() {
const { user } = useAuth();
const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
const [loading, setLoading] = useState(true);
const [activeFilter, setActiveFilter] = useState<'active' | 'completed'>('active');

useEffect(() => {
    if (!user) return;

    const fetchChallenges = async () => {
      // Načteme všechny potřebné sloupce pro novou kartu
    const { data, error } = await supabase
        .from('Challenge')
        .select(`
        id, 
        title, 
        status,
        short_description,
        budget_in_cents,
        deadline,
        created_at,
        max_applicants,
        ChallengeSkill (
            Skill ( id, name )
        ),
        Submission ( id )
        `)
        .eq('startup_id', user.id);

    if (error) {
        console.error("Chyba při načítání výzev:", error);
    } else {
        // OPRAVA: Používáme 'as unknown as' pro spolehlivé přetypování
        setAllChallenges(data as unknown as Challenge[] || []);
    }
    setLoading(false);
    };

    fetchChallenges();
}, [user]);

const activeChallenges = allChallenges.filter(c => c.status === 'open' || c.status === 'draft');
const completedChallenges = allChallenges.filter(c => c.status === 'closed' || c.status === 'archived');

const displayedChallenges = activeFilter === 'active' ? activeChallenges : completedChallenges;

if (loading) {
return <p className="text-center py-20">Načítám vaše výzvy...</p>;
}

return (
    <div className="container mx-auto py-12">
    {allChallenges.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-2xl shadow-md">
            <Image
                src="/frownbig.svg"
                alt="Smutný smajlík"
                width={50}
                height={50}
                className="w-xs mx-auto my-4 rounded-lg"
            />
        <div className='flex flex-col gap-4 my-8'>
            <h2 className="text-3xl text-[var(--barva-primarni)]">Zatím jste nepřidali žádnou výzvu</h2>
            <p className="text-gray-500 mt-2 mb-6">Vytvořte svou první výzvu a objevte talentované studenty.</p>
        </div>
    <Link href="/challenges/create" className="mt-6 px-6 py-3 rounded-full bg-[var(--barva-primarni)] text-xl text-white font-semibold">
        Vytvořit výzvu
    </Link>
        </div>
    ) : (
    <div>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-[var(--barva-tmava)]">Přehled vašich výzev</h1>
            
            <div className="bg-white p-2 rounded-full flex gap-3 items-center">
                <button 
                    onClick={() => setActiveFilter('active')}
                    className={`cursor-pointer flex justify-center items-center leading-none px-5 py-2 rounded-full text-sm font-semibold transition-colors ${activeFilter === 'active' ? 'bg-[var(--barva-svetle-pozadi)] border-1 border-[var(--barva-primarni)] text-[var(--barva-primarni)] shadow' : 'hover:bg-[var(--barva-svetle-pozadi)] text-[var(--barva-tmava)]'}`}>
                    Aktivní
                </button>
                <button 
                    onClick={() => setActiveFilter('completed')}
                    className={`cursor-pointer flex justify-center items-center leading-none px-5 py-2 rounded-full text-sm font-semibold transition-colors ${activeFilter === 'completed' ? 'bg-[var(--barva-svetle-pozadi)] border-1 border-[var(--barva-primarni)] text-[var(--barva-primarni)] shadow' : 'hover:bg-[var(--barva-svetle-pozadi)] text-[var(--barva-tmava)]'}`}
                >
                    Dokončené
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedChallenges.map(challenge => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
        </div>

        {displayedChallenges.length === 0 && (
            <div className="text-center bg-white p-12 rounded-2xl shadow-md">
                <h2 className="text-xl font-bold text-[var(--barva-tmava)]">Žádné {activeFilter === 'active' ? 'aktivní' : 'dokončené'} výzvy</h2>
                <p className="text-gray-500 mt-2">V této kategorii se nenachází žádná výzva.</p>
            </div>
        )}
        </div>
    )}
    <div className='flex justify-center'>
        <Link 
            href="/challenges/create" 
            className="mt-6 px-6 py-3 rounded-full text-xl bg-[var(--barva-primarni)] text-white font-semibold cursor-pointer inline-block text-center hover:bg-[#0069ccde] transition-all duration-300 ease-in-out">
        Vytvořit novou výzvu
        </Link>
    </div>
    </div>
);
}
