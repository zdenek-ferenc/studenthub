"use client";

import { supabase } from '../lib/supabaseClient'; 
import { Auth } from '@supabase/auth-ui-react';

type CustomAuthProps = {
  view: 'sign_in' | 'sign_up';
};

export default function CustomAuth({ view }: CustomAuthProps) {
  
  const localization = {
    variables: {
      sign_up: {
        email_label: 'E-mailová adresa',
        password_label: 'Vytvořte si heslo',
        button_label: 'Vytvořit účet',
        social_provider_text: 'Pokračovat s',
      },
      sign_in: {
        email_label: 'E-mailová adresa',
        password_label: 'Vaše heslo',
        button_label: 'Přihlásit se',
        social_provider_text: 'Přihlásit se s',
      },
      forgotten_password: {
        link_text: 'Zapomněli jste heslo?',
      },
    },
  };

  
  const customTheme = {
    default: {
      colors: {
        brand: 'var(--barva-primarni)',
        brandAccent: 'var(--barva-tmava)',
        brandButtonText: 'white',
        defaultButtonBackgroundHover: '#0056b3',
      },
      fonts: {
        bodyFontFamily: 'var(--font-sora)',
        buttonFontFamily: 'var(--font-sora)',
        labelFontFamily: 'var(--font-sora)',
      },
      radii: {
        borderRadius: '12px',
        buttonBorderRadius: '12px',
      }
    },
  };

  return (
    <Auth
      supabaseClient={supabase}
      
      appearance={{
        theme: customTheme, 
        className: {
          
          container: 'space-y-4',
          button: 'px-8 py-3 rounded-xl bg-[var(--barva-primarni)] text-2xl text-black font-semibold shadow-sm hover:opacity-90 transition-all duration-300 ease-in-out w-full',
          input: 'w-full bg-white rounded-lg p-3 my-2 text-base text-[var(--barva-tmava)] placeholder-gray-400 transition-colors focus:border-[var(--barva-primarni)] focus:ring-2 focus:ring-[var(--barva-primarni2)] focus:outline-none',
          label: 'text-md font-semibold text-[var(--barva-tmava)]',
          anchor: 'text-sm text-[var(--barva-primarni)] hover:underline',
          divider: 'bg-gray-300',
          message: 'text-sm text-red-500',
        },
      }}
      localization={localization}
      providers={['google', 'apple', 'facebook']}
      view={view}
      showLinks={false}
      theme="default" 
      redirectTo={typeof window !== 'undefined' ? window.location.href : ''}
    />
  );
}
