"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

export type CleanSubmission = {
    id: string;
    completed_outputs: string[];
    status: string;
    rating: number | null;
    position: number | null;
    Challenge: {
        id: string;
        title: string;
        status: 'open' | 'closed' | 'archived';
        expected_outputs: string;
        deadline: string | null;
        StartupProfile: {
            company_name: string;
            logo_url: string | null;
        } | null;
        ChallengeSkill: { Skill: { name: string } | null }[];
    } | null;
};

export type ProfileProgress = {
    level: number;
    xp: number;
    StudentSkill: {
        level: number;
        xp: number;
        Skill: { id: string; name: string; } | null;
    }[];
};

export type Notification = {
    id: string; message: string; link_url: string; created_at: string; type: 'new_submission' | 'submission_reviewed' | 'submission_winner' | null;
};

export type StudentStats = {
    avgRating: number; completedCount: number; successRate: number; totalEarnings: number; totalWins: number;
};

type DashboardContextType = {
    loading: boolean;
    submissions: CleanSubmission[];
    progress: ProfileProgress | null;
    notifications: Notification[];
    stats: StudentStats | null;
    studentProfile: { username: string; } | null;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const { user, profile, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [hasFetched, setHasFetched] = useState(false);

    const [submissions, setSubmissions] = useState<CleanSubmission[]>([]);
    const [progress, setProgress] = useState<ProfileProgress | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [stats, setStats] = useState<StudentStats | null>(null);
    const [studentProfile, setStudentProfile] = useState<{ username: string } | null>(null);

    const fetchData = useCallback(async (userId: string) => {
        setLoading(true);

        const [
            submissionsRes,
            progressRes,
            notificationsRes,
            statsPerformanceRes,
            statsRewardsRes,
            profileRes
        ] = await Promise.all([
            supabase.from('Submission').select(`id, completed_outputs, status, rating, position, Challenge:Challenge!Submission_challenge_id_fkey (id, title, status, expected_outputs, deadline, StartupProfile (company_name, logo_url), ChallengeSkill (Skill (name)))`).eq('student_id', userId),
            supabase.from('StudentProfile').select(`level, xp, StudentSkill (level, xp, Skill (id, name))`).eq('user_id', userId).single(),
            supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(4),
            supabase.from('Submission').select('rating, position').eq('student_id', userId).in('status', ['reviewed', 'winner', 'rejected']),
            supabase.rpc('get_student_rewards', { p_student_id: userId }),
            supabase.from('StudentProfile').select('username').eq('user_id', userId).single(),
        ]);
        
        if (submissionsRes.data) {
            const cleanedSubmissions = submissionsRes.data.map(sub => {
                const challengeData = sub.Challenge ? (Array.isArray(sub.Challenge) ? sub.Challenge[0] : sub.Challenge) : null;
                if (!challengeData) return { ...sub, Challenge: null };

                const cleanedStartupProfile = challengeData.StartupProfile ? (Array.isArray(challengeData.StartupProfile) ? challengeData.StartupProfile[0] : challengeData.StartupProfile) : null;
                
                const cleanedChallengeSkills = (challengeData.ChallengeSkill || []).map(cs => ({
                    ...cs,
                    Skill: cs.Skill ? (Array.isArray(cs.Skill) ? cs.Skill[0] : cs.Skill) : null,
                }));

                return {
                    ...sub,
                    Challenge: {
                        ...challengeData,
                        StartupProfile: cleanedStartupProfile,
                        ChallengeSkill: cleanedChallengeSkills,
                    }
                };
            });
            setSubmissions(cleanedSubmissions as CleanSubmission[]);
        } else {
            setSubmissions([]);
        }

        if (progressRes.data) {
            const rawProgress = progressRes.data;
            const cleanedSkills = (rawProgress.StudentSkill || []).map(ss => ({
                ...ss,
                Skill: ss.Skill ? (Array.isArray(ss.Skill) ? ss.Skill[0] : ss.Skill) : null,
            }));
            setProgress({
                level: rawProgress.level,
                xp: rawProgress.xp,
                StudentSkill: cleanedSkills
            } as ProfileProgress);
        } else {
            setProgress(null);
        }
        
        setNotifications(notificationsRes.data as Notification[] || []);
        
        let performanceStats = { avgRating: 0, completedCount: 0, successRate: 0 };
        if (!statsPerformanceRes.error && statsPerformanceRes.data) {
            const ratedSubmissions = statsPerformanceRes.data.filter(s => s.rating !== null);
            const totalCompleted = statsPerformanceRes.data.length;
            const totalWinners = statsPerformanceRes.data.filter(s => s.position !== null && s.position <= 3).length;
            const avgRating = ratedSubmissions.length > 0 ? ratedSubmissions.reduce((acc, s) => acc + s.rating!, 0) / ratedSubmissions.length : 0;
            const successRate = totalCompleted > 0 ? (totalWinners / totalCompleted) * 100 : 0;
            performanceStats = { avgRating: parseFloat(avgRating.toFixed(1)), completedCount: totalCompleted, successRate: Math.round(successRate) };
        }
        let rewardStats = { totalEarnings: 0, totalWins: 0 };
        if (!statsRewardsRes.error && statsRewardsRes.data && statsRewardsRes.data.length > 0) {
            const result = statsRewardsRes.data[0];
            rewardStats = { totalEarnings: result.total_earnings || 0, totalWins: result.total_wins || 0 };
        }
        setStats({ ...performanceStats, ...rewardStats });

        setStudentProfile(profileRes.data as { username: string } | null);

        setLoading(false);
        setHasFetched(true);
    }, []);

    useEffect(() => {
    console.log(`DashboardContext: Kontroluji stav. Auth načítá: ${authLoading}`);
    if (authLoading) {
        console.log('DashboardContext: Čekám na dokončení AuthContextu.');
        return;
    }

    if (user && profile?.role === 'student' && !hasFetched) {
        console.log('DashboardContext: Začínám načítat data pro dashboard.');
        fetchData(user.id);
    } else if (!user) {
        console.log('DashboardContext: Uživatel není přihlášen, resetuji stav.');
        setHasFetched(false);
        setSubmissions([]);
        setProgress(null);
        setNotifications([]);
        setStats(null);
        setStudentProfile(null);
        setLoading(false);
    } else {
        console.log('DashboardContext: Není třeba nic dělat (uživatel není student nebo data už jsou načtena). Nastavuji loading na FALSE.');
        setLoading(false);
    }
}, [user, profile, authLoading, hasFetched, fetchData]);

    const value = { loading, submissions, progress, notifications, stats, studentProfile };

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}