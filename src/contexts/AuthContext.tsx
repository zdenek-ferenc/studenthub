"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

// --- TYPY ---

type SimpleStudentSkill = {
    skill_id: string;
};

type SimpleStudentProfile = {
    registration_step?: number;
    first_name: string | null;
    last_name: string | null;
    bio: string | null;
    profile_picture_url: string | null;
    StudentSkill: SimpleStudentSkill[];
};

type SimpleStartupChallenge = {
    id: string;
};

type SimpleStartupProfile = {
    registration_step?: number;
    company_name: string | null;
    description: string | null;
    logo_url: string | null;
    Challenge: SimpleStartupChallenge[];
};

// PŘIDÁNO: Typ pro profil profesora
type SimpleProfessorProfile = {
    university_name: string;
    faculty_name: string;
    title_before: string | null;
    title_after: string | null;
    bio: string | null;
};

export type Profile = {
    id: string;
    email: string;
    // PŘIDÁNO: role 'professor'
    role: 'student' | 'startup' | 'admin' | 'professor';
    registration_step?: number;
    company_name: string | null;
    first_name: string | null;
    last_name: string | null;

    StudentProfile: SimpleStudentProfile | null;
    StartupProfile: SimpleStartupProfile | null;
    // PŘIDÁNO: pole pro profesora
    ProfessorProfile: SimpleProfessorProfile | null;
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
    refetchProfile: () => Promise<void>;
    toasts: Toast[];
    showToast: (message: string, type: 'success' | 'error') => void;
    hideToast: (id: number) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- PROVIDER ---

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<Toast[]>([]);

    const router = useRouter();
    const pathname = usePathname();

    const fetchAndSetProfile = useCallback(async (currentUser: User | null): Promise<Profile | null> => {
        if (!currentUser) {
            setProfile(null);
            return null;
        }
        
        // 1. Načtení základní role z tabulky User
        const { data: userProfile, error: userError } = await supabase
            .from('User')
            .select('id, email, role')
            .eq('id', currentUser.id)
            .single();

        if (userError || !userProfile) {
            console.error("AuthContext: Chyba při načítání User data:", userError);
            setProfile(null);
            return null;
        }

        // 2. Příprava objektu profilu
        const finalProfile: Profile = {
            id: userProfile.id,
            email: userProfile.email,
            role: userProfile.role as Profile['role'],
            registration_step: 0,
            company_name: null,
            first_name: null,
            last_name: null,
            StudentProfile: null,
            StartupProfile: null,
            ProfessorProfile: null,
        };

        // 3. Načítání detailů podle role
        if (userProfile.role === 'student') {
            const { data: studentData, error: studentError } = await supabase
                .from('StudentProfile')
                .select(`
                registration_step,
                first_name,
                last_name,
                bio,
                profile_picture_url,
                StudentSkill ( skill_id )
            `)
                .eq('user_id', currentUser.id)
                .single();

            if (studentError && studentError.code !== 'PGRST116') {
                console.error("AuthContext: Chyba při načítání StudentProfile:", studentError);
            } else if (studentData) {
                finalProfile.registration_step = studentData.registration_step;
                finalProfile.first_name = studentData.first_name;
                finalProfile.last_name = studentData.last_name;
                finalProfile.StudentProfile = studentData as SimpleStudentProfile;
            }

        } else if (userProfile.role === 'startup') {
            const { data: startupData, error: startupError } = await supabase
                .from('StartupProfile')
                .select(`
                registration_step,
                company_name,
                description,
                logo_url,
                Challenge ( id )
            `)
                .eq('user_id', currentUser.id)
                .single();

            if (startupError && startupError.code !== 'PGRST116') {
                console.error("AuthContext: Chyba při načítání StartupProfile:", startupError);
            } else if (startupData) {
                finalProfile.registration_step = startupData.registration_step;
                finalProfile.company_name = startupData.company_name;
                finalProfile.StartupProfile = startupData as SimpleStartupProfile;
            }
        
        // PŘIDÁNO: Logika pro profesora
        } else if (userProfile.role === 'professor') {
            const { data: professorData, error: professorError } = await supabase
                .from('ProfessorProfile')
                .select(`
                    university_name,
                    faculty_name,
                    title_before,
                    title_after,
                    bio
                `)
                .eq('user_id', currentUser.id)
                .single();

            if (professorError && professorError.code !== 'PGRST116') {
                console.error("AuthContext: Chyba při načítání ProfessorProfile:", professorError);
            } else if (professorData) {
                // Můžeme nastavit first_name/last_name pokud bychom je chtěli tahat z titulů, 
                // ale pro teď stačí naplnit ProfessorProfile
                finalProfile.ProfessorProfile = professorData;
            }
        }

        setProfile(finalProfile);
        return finalProfile;

    }, []);

    useEffect(() => {
        const initializeAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                const fetchedProfile = await fetchAndSetProfile(currentUser);
                
                // Přesměrování po loginu / reloadu
                if (fetchedProfile) {
                    const onRegistrationPage = pathname.startsWith('/register/');
                    
                    // Logika pro nedokončenou registraci (primárně pro studenty/startupy)
                    const isRegistrationIncomplete = fetchedProfile.registration_step && fetchedProfile.registration_step < 6;
                    
                    const justFinishedRegistration = typeof window !== 'undefined' ? sessionStorage.getItem('justFinishedRegistration') : null;

                    if (justFinishedRegistration && pathname !== `/register/${fetchedProfile.role}`) {
                        if (typeof window !== 'undefined') {
                            sessionStorage.removeItem('justFinishedRegistration');
                        }
                    } else if (isRegistrationIncomplete && !onRegistrationPage) {
                        router.push(`/register/${fetchedProfile.role}`);
                    } else if (fetchedProfile.role === 'professor') {
                         // Professor Onboarding Logic
                         const isProfessorOnboardingComplete = !!fetchedProfile.ProfessorProfile?.university_name;
                         const onProfessorOnboardingPage = pathname.startsWith('/onboarding/professor');

                         if (!isProfessorOnboardingComplete && !onProfessorOnboardingPage) {
                             router.push('/onboarding/professor');
                         } else if (isProfessorOnboardingComplete && (onRegistrationPage || onProfessorOnboardingPage)) {
                             router.push('/dashboard/professor');
                         }
                    } else if (!isRegistrationIncomplete && onRegistrationPage) {
                        // Pokud je registrace hotová a user je na /register page, pošleme ho pryč
                        if (fetchedProfile.role === 'student') router.push('/dashboard');
                        else if (fetchedProfile.role === 'startup') router.push('/challenges');
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