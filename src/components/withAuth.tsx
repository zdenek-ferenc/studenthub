"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

// Toto je "Higher-Order Component" - funkce, která vezme komponentu
// a vrátí novou, vylepšenou komponentu.
export default function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  
  const AuthComponent = (props: P) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Čekáme, dokud se nedokončí načítání informací o přihlášení
      if (!loading) {
        // Pokud načítání skončilo a UŽIVATEL NENÍ přihlášený...
        if (!user) {
          // ...okamžitě ho přesměrujeme na přihlašovací stránku.
          router.push('/login');
        }
      }
    }, [user, loading, router]);

    // Pokud se ještě načítá nebo pokud uživatel není přihlášený (a čekáme na přesměrování),
    // zobrazíme jednoduchou zprávu.
    if (loading || !user) {
      return <p className="text-center py-20">Načítání...</p>;
    }

    // Pokud je vše v pořádku (načteno a uživatel je přihlášený),
    // zobrazíme původní stránku, kterou jsme chtěli ochránit.
    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
}
