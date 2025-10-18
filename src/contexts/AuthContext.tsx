"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  email: string;
  role: 'student' | 'startup' | 'admin';
  registration_step?: number; 
};

export type Toast = {
  id: number;
  message: string;
  type: 'success' | 'error';
};

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
  const [loading, setLoading] = useState(true); // Začínáme s načítáním
  const [toasts, setToasts] = useState<Toast[]>([]);

  const router = useRouter();
  const pathname = usePathname();

  const fetchAndSetProfile = useCallback(async (currentUser: User) => {
    const { data: userProfile, error } = await supabase
        .from('User')
        .select('*, StudentProfile(*), StartupProfile(*)')
        .eq('id', currentUser.id)
        .single();
    if (error && error.code !== 'PGRST116') {
        console.error("AuthContext chyba při načítání profilu:", error);
        return null;
    }

    if (userProfile) {
        let registration_step;
        if (userProfile.role === 'student') {
            const studentData = Array.isArray(userProfile.StudentProfile) ? userProfile.StudentProfile[0] : userProfile.StudentProfile;
            registration_step = studentData?.registration_step;
        } else if (userProfile.role === 'startup') {
            const startupData = Array.isArray(userProfile.StartupProfile) ? userProfile.StartupProfile[0] : userProfile.StartupProfile;
            registration_step = startupData?.registration_step;
        }
        
        const finalProfile = { ...userProfile, registration_step } as Profile;
        setProfile(finalProfile);
        return finalProfile;
    }
    return null;
  }, []);


  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchAndSetProfile(currentUser);
      }
      
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
            fetchAndSetProfile(currentUser);
        } else {
            setProfile(null);
        }
    });

    return () => {
        subscription.unsubscribe();
    };
}, [fetchAndSetProfile]);


  const refetchProfile = useCallback(async () => {
    if (user) {
        await fetchAndSetProfile(user);
    }
  }, [user, fetchAndSetProfile]);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const newToast = { id: Date.now(), message, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== newToast.id));
    }, 4000);
  }, []);

  const hideToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

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