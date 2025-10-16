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
      <span className="font-semibold text-white text-base">{label}</span>
    </button>
  );
};

export default function WelcomePage() {
  return (
    <div className="md:hidden flex flex-col h-screen bg-[var(--barva-tmava)] text-white p-6">
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

      <div className="w-full space-y-4 animate-fade-in-up" style={{ animationDelay: '1100ms' }}>
        <SocialButton 
            provider="google" 
            label="Pokračovat s Googlem" 
            icon={<svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.151,44,30.63,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>} 
        />
        <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200/30"></div>
            <span className="flex-shrink mx-4 text-gray-300 text-sm">nebo</span>
            <div className="flex-grow border-t border-gray-200/30"></div>
        </div>
        <Link href="/register" className="block w-full text-center py-3.5 px-4 rounded-xl bg-[var(--barva-primarni)] text-white font-semibold hover:opacity-90 transition-opacity">
          Registrovat se
        </Link>
        <p className="text-center text-sm text-gray-300 pt-2">
          Máš už účet?{' '}
          <Link href="/login" className="font-bold hover:underline">
            Přihlas se
          </Link>
        </p>
      </div>
    </div>
  );
}