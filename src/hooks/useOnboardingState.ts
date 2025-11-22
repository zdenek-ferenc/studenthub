"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../contexts/DashboardContext';
import { usePathname } from 'next/navigation';
import { Briefcase, User, Feather, Rocket } from 'lucide-react';

export type OnboardingTask = {
    id: string;
    title: string;
    description: string;
    href: string;
    icon: React.ElementType;
    isCompleted: boolean;
};

export function useOnboardingState() {
    const { profile, loading: authLoading } = useAuth();
    const { submissions, loading: dashboardLoading } = useDashboard(); 
    const pathname = usePathname();

    const [tasks, setTasks] = useState<OnboardingTask[]>([]);
    const [isPermanentlyCompleted, setIsPermanentlyCompleted] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [isStorageLoaded, setIsStorageLoaded] = useState(false);
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedStatus = localStorage.getItem('risehigh_onboarding_completed');
            if (savedStatus === 'true') {
                setIsPermanentlyCompleted(true);
            }
            setIsStorageLoaded(true);
        }
    }, []);

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

        setTasks(newTasks);

    }, [profile, authLoading, dashboardLoading, submissions]);

    const activeTask = useMemo(() => {
        return tasks.find(task => !task.isCompleted);
    }, [tasks]);

    const completedCount = useMemo(() => {
        return tasks.filter(task => task.isCompleted).length;
    }, [tasks]);

    const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

    useEffect(() => {
        if (tasks.length > 0 && progressPercent === 100 && !isPermanentlyCompleted && !showCelebration) {
            
            setShowCelebration(true);
            
            if (typeof window !== 'undefined') {
                localStorage.setItem('risehigh_onboarding_completed', 'true');
            }

            const timer = setTimeout(() => {
                setIsPermanentlyCompleted(true);
                setShowCelebration(false);
            }, 4000); 

            return () => clearTimeout(timer); 
        }
    }, [progressPercent, tasks.length, isPermanentlyCompleted, showCelebration]);

    const isHiddenOnPage = useMemo(() => {
        if (!pathname) return false;
        return pathname.startsWith('/register') || pathname === '/login' || pathname === '/welcome' || pathname === '/';
    }, [pathname]);

    // 4. Finální logika viditelnosti
    const isVisible = 
        isStorageLoaded &&
        !isHiddenOnPage &&
        (!isPermanentlyCompleted || showCelebration) && 
        !authLoading && 
        !dashboardLoading && 
        !!profile && 
        profile.role === 'student';

    return {
        tasks,
        activeTask,
        progressPercent,
        completedCount,
        totalTasks: tasks.length,
        isVisible,
        showCelebration, 
    };
}