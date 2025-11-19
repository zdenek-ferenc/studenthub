"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../contexts/DashboardContext';
import { usePathname } from 'next/navigation';
import { Briefcase, User, Feather, Search, Image as ImageIcon } from 'lucide-react';

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
    
    useEffect(() => {
        if (authLoading || !profile) {
            setTasks([]);
            return;
        }

        let newTasks: OnboardingTask[] = [];

        if (profile.role === 'student' && profile.StudentProfile) {
            const student = profile.StudentProfile;
            
            const hasAvatar = !!student.profile_picture_url;
            const hasBio = !!student.bio && student.bio.trim().length > 0;
            
            const hasSkills = student.StudentSkill && student.StudentSkill.length > 0;
            const hasAppliedToChallenge = !dashboardLoading && submissions.length > 0;

            newTasks = [
                { id: 'avatar', title: 'Přidej si fotku', description: 'Dej svému profilu tvář.', href: '/profile/edit', icon: User, isCompleted: hasAvatar },
                { id: 'bio', title: 'Napiš si bio', description: 'Řekni startupům, kdo jsi.', href: '/profile/edit', icon: Feather, isCompleted: hasBio },
                { id: 'skills', title: 'Doplň dovednosti', description: 'Ukaž, co v tobě je.', href: '/profile/edit?tab=skills', icon: Briefcase, isCompleted: hasSkills },
                { id: 'find_challenge', title: 'Najdi si výzvu', description: 'Začni budovat své portfolio.', href: '/challenges', icon: Search, isCompleted: hasAppliedToChallenge }
            ];

        } else if (profile.role === 'startup' && profile.StartupProfile) {
            const startup = profile.StartupProfile;

            const hasLogo = !!startup.logo_url; 
            const hasDescription = !!startup.description && startup.description.trim().length > 0;
            const hasCreatedChallenge = startup.Challenge && startup.Challenge.length > 0;

            newTasks = [
                { id: 'logo', title: 'Nahrajte logo', description: 'Logo je klíčové pro vaši vizibilitu.', href: '/profile/edit', icon: ImageIcon, isCompleted: hasLogo },
                { id: 'bio_startup', title: 'Popište firmu', description: 'Představte se talentům.', href: '/profile/edit', icon: Feather, isCompleted: hasDescription },
                { id: 'create_challenge', title: 'Vytvořte výzvu', description: 'Oslovte první talenty.', href: '/challenges/create', icon: Briefcase, isCompleted: hasCreatedChallenge }
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

    const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 100;

    const isHiddenOnPage = useMemo(() => {
        return pathname.startsWith('/register') || pathname === '/login' || pathname === '/welcome';
    }, [pathname]);

    const isRegistrationComplete = profile?.registration_step && profile.registration_step >= 6;

    const isComplete = activeTask === undefined && tasks.length > 0;

    const finalIsVisible = !authLoading && !!profile && isRegistrationComplete && !isHiddenOnPage && !isComplete;

    return {
        tasks,
        activeTask,
        progressPercent,
        completedCount,
        totalTasks: tasks.length,
        isVisible: finalIsVisible,
    };
}