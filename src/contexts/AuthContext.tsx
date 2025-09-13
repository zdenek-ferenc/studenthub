"use client";

// Přidali jsme 'useEffect' a 'useCallback'
import { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

// Typ pro profil zůstává stejný
export type Profile = {
  id: string;
  email: string;
  role: 'student' | 'startup' | 'admin';
};

// Vylepšená definice pro Toast
export type Toast = {
  id: number;
  message: string;
  type: 'success' | 'error';
};

// Aktualizovaný typ pro kontext
type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refetchProfile: () => void;
  toasts: Toast[];
  showToast: (message: string, type: 'success' | 'error') => void;
  hideToast: (id: number) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

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
    getSessionAndProfile();

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

  const refetchProfile = useCallback(() => {
    getSessionAndProfile();
  }, [getSessionAndProfile]);

  // --- OPRAVA ZDE: Zabalení funkcí do useCallback ---
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const newToast = {
      id: Date.now(),
      message,
      type,
    };
    setToasts((prevToasts) => [...prevToasts, newToast]);

    setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== newToast.id));
    }, 4000);
  }, []); // Prázdné pole závislostí znamená, že se funkce vytvoří jen jednou

  const hideToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []); // Prázdné pole závislostí znamená, že se funkce vytvoří jen jednou

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    refetchProfile,
    toasts,
    showToast,
    hideToast
  }), [user, profile, loading, toasts, refetchProfile, showToast, hideToast]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}