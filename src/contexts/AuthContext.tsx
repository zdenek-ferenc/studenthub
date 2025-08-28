"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  email: string;
  role: 'student' | 'startup' | 'admin';
};

// OPRAVA: Přidali jsme 'refetchProfile' do typu
type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refetchProfile: () => void; // Funkce pro manuální obnovení dat
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Vytvořili jsme si znovupoužitelnou funkci pro načítání
  const getSessionAndProfile = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);

    if (session?.user) {
      const { data: userProfile } = await supabase
        .from('User')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setProfile(userProfile);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    getSessionAndProfile(); // Zavoláme při prvním načtení

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase.from('User').select('*').eq('id', session.user.id).single().then(({ data }) => setProfile(data));
      } else {
        setProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [getSessionAndProfile]);

  // OPRAVA: Vytvořili jsme funkci 'refetchProfile', která jednoduše znovu zavolá načítací logiku
  const refetchProfile = useCallback(() => {
    getSessionAndProfile();
  }, [getSessionAndProfile]);

  // OPRAVA: Přidali jsme 'refetchProfile' do hodnoty, kterou poskytujeme
  const value = { user, profile, loading, refetchProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
