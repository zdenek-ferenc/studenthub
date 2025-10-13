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
  StudentProfile?: { registration_step: number }[]; 
  StartupProfile?: { registration_step: number }[]; 
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
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const router = useRouter();
  const pathname = usePathname();

  const getSessionAndProfile = useCallback(async () => {
    
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user ?? null;
    setUser(currentUser);

    if (currentUser) {
      const { data: userProfile } = await supabase
        .from('User')
        .select(`
          *,
          StudentProfile(registration_step),
          StartupProfile(registration_step)
        `)
        .eq('id', currentUser.id)
        .single();

      if (userProfile) {
          const registration_step = userProfile.role === 'student'
              ? userProfile.StudentProfile?.[0]?.registration_step
              : userProfile.StartupProfile?.[0]?.registration_step;
          
          const finalProfile = { ...userProfile, registration_step } as Profile;
          setProfile(finalProfile);
          
          const isRegistrationIncomplete = registration_step && registration_step < 6;
          const isOnRegistrationPage = pathname.startsWith('/register');
          
          if (isRegistrationIncomplete && !isOnRegistrationPage) {
              if (finalProfile.role === 'student') {
                  router.push('/register/student');
              } else if (finalProfile.role === 'startup') {
                  router.push('/register/startup');
              }
          }
      }
    }
    setLoading(false);
  }, [router, pathname]);

  useEffect(() => {
    
    getSessionAndProfile();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
        
        getSessionAndProfile();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [getSessionAndProfile]);
  const refetchProfile = useCallback(() => {
    getSessionAndProfile();
  }, [getSessionAndProfile]);

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
  }, []); 

  const hideToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
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