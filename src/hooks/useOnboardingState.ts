"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../contexts/DashboardContext';
import { usePathname } from 'next/navigation';
import { Briefcase, User, Feather, Rocket, Globe, FileText, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export type OnboardingTask = {
    id: string;
    title: string;
    description: string;
    href: string;
    icon: React.ElementType;
    isCompleted: boolean;
};

export function useOnboardingState() {
    const { profile, user, refetchProfile, loading: authLoading } = useAuth();
    const { submissions, loading: dashboardLoading } = useDashboard(); 
    const pathname = usePathname();

    const [tasks, setTasks] = useState<OnboardingTask[]>([]);
    const [showCelebration, setShowCelebration] = useState(false);
    
    const markAsCompleted = async () => {
        if (!user || !profile) return;
        
        try {
            const table = profile.role === 'student' ? 'StudentProfile' : 'StartupProfile';
            const { error } = await supabase
                .from(table)
                .update({ onboarding_completed: true })
                .eq('user_id', user.id);

            if (error) throw error;

            await refetchProfile();
        } catch (error) {
            console.error("Chyba při ukládání onboarding statusu:", error);
        }
    };

    useEffect(() => {
        if (authLoading || !profile) {
            setTasks([]);
            return;
        }

        let newTasks: OnboardingTask[] = [];

        if (profile.role === 'student' && profile.StudentProfile) {
            const student = profile.StudentProfile;
            
            const hasBio = !!student.bio && student.bio.trim().length > 0;
            const hasSkills = student.StudentSkill && student.StudentSkill.length > 0;
            const hasAvatar = !!student.profile_picture_url;
            const hasAppliedToChallenge = !dashboardLoading && submissions.length > 0;

            newTasks = [
                { 
                    id: 'bio', 
                    title: 'Napiš krátké bio', 
                    description: 'Představ se startupům.', 
                    href: '/profile/edit?tab=personal', 
                    icon: Feather, 
                    isCompleted: hasBio 
                },
                { 
                    id: 'skills', 
                    title: 'Doplň dovednosti', 
                    description: 'Vyber, co umíš.', 
                    href: '/profile/edit?tab=skills', 
                    icon: Briefcase, 
                    isCompleted: hasSkills 
                },
                { 
                    id: 'avatar', 
                    title: 'Nahraj profilovku', 
                    description: 'Dej svému profilu tvář.', 
                    href: '/profile/edit?tab=personal', 
                    icon: User, 
                    isCompleted: hasAvatar 
                },
                { 
                    id: 'challenge', 
                    title: 'Přihlaš se do výzvy', 
                    description: 'Zkus své první zadání.', 
                    href: '/challenges', 
                    icon: Rocket, 
                    isCompleted: hasAppliedToChallenge 
                }
            ];
        } 
        else if (profile.role === 'startup' && profile.StartupProfile) {
            const startup = profile.StartupProfile;

            const hasLogo = !!startup.logo_url;
            const hasDescription = !!startup.description && startup.description.length > 50;
            const hasWebsite = !!startup.website; // Předpokládá existenci pole website
            const hasChallenge = startup.Challenge && startup.Challenge.length > 0;

            newTasks = [
                { 
                    id: 'logo', 
                    title: 'Nahraj logo firmy', 
                    description: 'Budujte svůj brand.', 
                    href: '/profile/edit', 
                    icon: ImageIcon, 
                    isCompleted: hasLogo 
                },
                { 
                    id: 'about', 
                    title: 'Představte firmu', 
                    description: 'Napište něco o sobě (> 50 znaků).', 
                    href: '/profile/edit', 
                    icon: FileText, 
                    isCompleted: hasDescription 
                },
                { 
                    id: 'web', 
                    title: 'Doplňte web', 
                    description: 'Odkaz na vaši prezentaci.', 
                    href: '/profile/edit', 
                    icon: Globe, 
                    isCompleted: hasWebsite 
                },
                { 
                    id: 'challenge', 
                    title: 'Vytvořte první výzvu', 
                    description: 'Zadejte úkol pro talenty.', 
                    href: '/challenges/create', 
                    icon: Rocket, 
                    isCompleted: hasChallenge 
                }
            ];
        }

        setTasks(newTasks);

    }, [profile, authLoading, dashboardLoading, submissions]);

    const activeTask = useMemo(() => {
        return tasks.find(task => !task.isCompleted);
    }, [tasks]);

    const completedCount = useMemo(() => {
        return tasks.filter(task => task.isCompleted).length;
    }, [tasks]);

    const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
        const isDbCompleted = 
        (profile?.role === 'student' && profile?.StudentProfile?.onboarding_completed) ||
        (profile?.role === 'startup' && profile?.StartupProfile?.onboarding_completed) ||
        false;

    useEffect(() => {
        if (tasks.length > 0 && progressPercent === 100 && !isDbCompleted && !showCelebration) {
            setShowCelebration(true);
        }
    }, [progressPercent, tasks.length, isDbCompleted, showCelebration]);

    const isHiddenOnPage = useMemo(() => {
        if (!pathname) return false;
        return pathname.startsWith('/register') || pathname === '/login' || pathname === '/welcome' || pathname === '/';
    }, [pathname]);

    const isVisible = 
        !isHiddenOnPage &&
        !isDbCompleted && 
        !authLoading && 
        !dashboardLoading && 
        !!profile && 
        (profile.role === 'student' || profile.role === 'startup');

    const guideTexts = useMemo(() => {
        if (profile?.role === 'startup') {
            return {
                title: 'Rozjezd firmy',
                subtitle: 'Připravte profil pro talenty.',
                successTitle: 'Profil je připraven!',
                successMessage: 'Skvělá práce. Teď už jen čekejte na první řešení od studentů.'
            };
        }
        return {
            title: 'Startovní čára',
            subtitle: 'Nastartuj svou kariéru naplno.',
            successTitle: 'Skvělá práce!',
            successMessage: 'Tvůj profil je kompletní. Jsi připraven zazářit před startupy.'
        };
    }, [profile?.role]);

    return {
        tasks,
        activeTask,
        progressPercent,
        completedCount,
        totalTasks: tasks.length,
        isVisible,
        showCelebration,
        markAsCompleted,
        guideTexts 
    };
}