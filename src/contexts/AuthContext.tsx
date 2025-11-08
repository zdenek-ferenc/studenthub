"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Student, Startup } from './DataContext';

export type Profile = {
  id: string;
  email: string;
  role: 'student' | 'startup' | 'admin';
  registration_step?: number; 
  company_name: string | null; 
  first_name: string | null;
  last_name: string | null;
  StudentProfile?: Student | Student[] | null;
  StartupProfile?: Startup | Startup[] | null;
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

const fetchAndSetProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return null;
      }
    const { data: userProfile } = await supabase.from('User').select('*, StudentProfile(*), StartupProfile(*)').eq('id', currentUser.id).single();
    if (userProfile) {
        let registration_step;
        let company_name = null;
        let first_name = null;
        let last_name = null;

        if (userProfile.role === 'student') {
          const studentData = Array.isArray(userProfile.StudentProfile) ? userProfile.StudentProfile[0] : userProfile.StudentProfile;
          registration_step = studentData?.registration_step;
            first_name = studentData?.first_name; 
            last_name = studentData?.last_name;   
        } else if (userProfile.role === 'startup') {
          const startupData = Array.isArray(userProfile.StartupProfile) ? userProfile.StartupProfile[0] : userProfile.StartupProfile;
          registration_step = startupData?.registration_step;
          company_name = startupData?.company_name; 
        }
        const finalProfile = { 
            ...userProfile, 
            registration_step, 
            company_name, 
            first_name, 
            last_name 
        } as Profile;
        setProfile(finalProfile);
        return finalProfile;
    }
    setProfile(null);
    return null;
  }, []);

useEffect(() => {
    const initializeAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
            const fetchedProfile = await fetchAndSetProfile(currentUser);
            if (fetchedProfile) {
                const isRegistrationIncomplete = fetchedProfile.registration_step && fetchedProfile.registration_step < 6;
                const onRegistrationPage = pathname.startsWith('/register/');
                const justFinishedRegistration = typeof window !== 'undefined' ? sessionStorage.getItem('justFinishedRegistration') : null;

                if (justFinishedRegistration && pathname !== `/register/${fetchedProfile.role}`) {
                    if (typeof window !== 'undefined') {
                        sessionStorage.removeItem('justFinishedRegistration');
                    }
                    console.log("AuthContext: Detekováno dokončení registrace, přeskočena kontrola přesměrování.");
                } else if (isRegistrationIncomplete && !onRegistrationPage) {
                    console.log(`AuthContext: Nedokončená registrace (krok ${fetchedProfile.registration_step}), přesměrovávám na /register/${fetchedProfile.role}`);
                    router.push(`/register/${fetchedProfile.role}`);
                } else if (!isRegistrationIncomplete && onRegistrationPage) {
                    console.log("AuthContext: Registrace dokončena, ale stále na registrační stránce. Přesměrovávám pryč.");
                    router.push(fetchedProfile.role === 'student' ? '/dashboard' : '/challenges');
                }
            }
        }
        setLoading(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        const currentUser = session?.user ?? null;
        if (currentUser?.id !== user?.id && typeof window !== 'undefined') {
            sessionStorage.removeItem('justFinishedRegistration');
        }
        setUser(currentUser);
        fetchAndSetProfile(currentUser);
    });


    return () => {
        subscription.unsubscribe();
    };
}, [fetchAndSetProfile, pathname, router, user?.id]);


  const refetchProfile = useCallback(async () => {
    if (user) {
        await fetchAndSetProfile(user);
    }
  }, [user, fetchAndSetProfile]);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
  const newToast = { id: Date.now() + Math.random(), message, type };
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