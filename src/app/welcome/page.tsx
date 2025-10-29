"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Provider } from '@supabase/supabase-js';

const SocialButton = ({ provider, label, icon }: { provider: Provider, label: string, icon: ReactNode }) => {
  const handleLogin = async () => {
    
    // Cíl: Domovská stránka, kde AuthContext převezme řízení.
    const redirectPath = '/'; 

    const isLocalhost = 
        typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    const localBaseUrl = process.env.NEXT_PUBLIC_LOCAL_REDIRECT_BASE_URL;

    // Sestavíme URL
    const redirectToUrl = (isLocalhost && localBaseUrl) 
        ? `${localBaseUrl}${redirectPath}` 
        : `${window.location.origin}${redirectPath}`;

    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectToUrl,
      },
    });
  };

  return (
    <button onClick={handleLogin} className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200/50 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
      {icon}
      <span className=" text-white text-base">{label}</span>
    </button>
  );
};

export default function WelcomePage() {
  return (
    <div className="md:hidden flex flex-col h-screen bg-[var(--barva-tmava)] text-white p-6">
      
      {/* Tato část zůstává stejná */}
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        <div className="logo-reveal-container mb-8">
          <Image
            src="/logosmall.svg"
            alt="StudentHub logo"
            width={80}
            height={50}
            priority
          />
        </div>
        <Image
            src="/logotextwhite.svg"
            alt="StudentHub logo"
            width={230}
            height={50}
            className="mb-4 animate-fade-in-up"
            style={{ animationDelay: '800ms' }}
        />
        <p className="text-lg text-gray-300 max-w-xs animate-fade-in-up" style={{ animationDelay: '900ms' }}>
            Propojujeme talentované studenty s inovativními startupy.
        </p>
      </div>

      {/* ZMĚNA ZDE: Nahrazujeme matoucí tlačítka za jasný rozcestník */}
      <div className="w-full space-y-4 animate-fade-in-up" style={{ animationDelay: '1100ms' }}>
        
        <Link href="/register" className="block w-full text-center py-3.5 px-4 rounded-xl bg-[var(--barva-primarni)] text-white font-semibold hover:opacity-90 transition-opacity">
          Vytvořit nový účet
        </Link>
        
        <Link href="/login" className="block w-full text-center py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors">
          Už mám účet (Přihlásit se)
        </Link>
        
      </div>
    </div>
  );
}