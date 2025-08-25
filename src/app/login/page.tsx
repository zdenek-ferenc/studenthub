"use client";
import { supabase } from '../../lib/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();

  // Sledujeme, jestli se uživatel úspěšně přihlásil
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') {
      // Pokud ano, přesměrujeme ho na hlavní stránku (nebo později na dashboard)
      router.push('/');
    }
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <h2 className="text-3xl font-bold mb-4 text-center">Přihlášení</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google', 'apple', 'facebook']}
          view="sign_in" // Zobrazí VÝHRADNĚ přihlašovací formulář
          showLinks={false}
          theme="light"
        />
        <p className="text-center text-sm text-gray-600 mt-4">
          Ještě nemáš účet?{' '}
          <Link href="/register/student" className="font-semibold text-[var(--barva-primarni)] hover:underline">
            Zaregistruj se
          </Link>
        </p>
      </div>
    </div>
  );
}
