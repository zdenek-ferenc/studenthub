"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';


type SkillFromDB = { id: string; name: string };
type StartupProfileFromDB = { company_name: string; logo_url: string | null };


type ChallengeSkillFromDB = {
    Skill: SkillFromDB | SkillFromDB[] | null;
};


type ChallengeFromDB = {
    id: string;
    title: string;
    status: 'open' | 'closed' | 'archived';
    expected_outputs: string;
    deadline: string | null;
    StartupProfile: StartupProfileFromDB | StartupProfileFromDB[] | null;
    ChallengeSkill: ChallengeSkillFromDB[] | null; 
};




type CleanChallengeSkill = {
    Skill: SkillFromDB | null;
};


type CleanChallenge = {
    id: string;
    title: string;
    status: 'open' | 'closed' | 'archived';
    expected_outputs: string;
    deadline: string | null;
    StartupProfile: StartupProfileFromDB | null;
    ChallengeSkill: CleanChallengeSkill[]; 
};


export type CleanSubmission = {
    id: string;
    completed_outputs: string[];
    status: string;
    rating: number | null;
    position: number | null;
    Challenge: CleanChallenge | null; 
};


export type SavedChallenge = {
    Challenge: CleanChallenge; 
    saved_at: string;
};


type SavedChallengeResponse = {
    saved_at: string;
    Challenge: ChallengeFromDB | ChallengeFromDB[] | null; 
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
    id: string; message: string; link_url: string; created_at: string; type: 'new_submission' | 'submission_reviewed' | 'submission_winner' | null; is_read: boolean;
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
    savedChallenges: SavedChallenge[];
    refetchDashboardData: () => void;
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
    const [savedChallenges, setSavedChallenges] = useState<SavedChallenge[]>([]);

    const fetchDashboardData = useCallback(async (userId: string | undefined) => {
        if (!userId) {
            setLoading(false); setHasFetched(false); setSubmissions([]); setProgress(null);
            setNotifications([]); setStats(null); setStudentProfile(null); setSavedChallenges([]);
            return;
        }
        
        if (notifications.length === 0 && submissions.length === 0) {
            setLoading(true);
        }

        const [
            submissionsRes, progressRes, notificationsRes, statsPerformanceRes,
            statsRewardsRes, profileRes, savedChallengesRes
        ] = await Promise.all([
            supabase.from('Submission').select(`id, completed_outputs, status, rating, position, Challenge:Challenge!Submission_challenge_id_fkey (id, title, status, expected_outputs, deadline, StartupProfile (company_name, logo_url), ChallengeSkill (Skill (id, name)))`).eq('student_id', userId),
            supabase.from('StudentProfile').select(`level, xp, StudentSkill (level, xp, Skill (id, name))`).eq('user_id', userId).single(),
            supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(4),
            supabase.from('Submission').select('rating, position, Challenge!inner(status)').eq('student_id', userId).eq('Challenge.status', 'closed'),
            supabase.rpc('get_student_rewards', { p_student_id: userId }),
            supabase.from('StudentProfile').select('username').eq('user_id', userId).single(),
            supabase
                .from('SavedChallenge')
                .select(`
                    saved_at:created_at,
                    Challenge (id, title, StartupProfile (company_name, logo_url), ChallengeSkill (Skill (id, name)))
                `)
                .eq('student_id', userId)
                .order('created_at', { ascending: false })
        ]);

        
        if (submissionsRes.data) {
            const cleanedSubmissions = submissionsRes.data.map(sub => {
                
                const challengeData = sub.Challenge ? (Array.isArray(sub.Challenge) ? sub.Challenge[0] : sub.Challenge) as ChallengeFromDB : null;
                if (!challengeData) return { ...sub, Challenge: null };

                const cleanedStartupProfile = challengeData.StartupProfile ? (Array.isArray(challengeData.StartupProfile) ? challengeData.StartupProfile[0] : challengeData.StartupProfile) : null;
                
                const cleanedChallengeSkills: CleanChallengeSkill[] = (challengeData.ChallengeSkill || []).map((cs: ChallengeSkillFromDB) => ({
                    Skill: cs.Skill ? (Array.isArray(cs.Skill) ? cs.Skill[0] : cs.Skill) : null,
                }));
                
                const cleanChallenge: CleanChallenge = {
                    ...challengeData,
                    StartupProfile: cleanedStartupProfile,
                    ChallengeSkill: cleanedChallengeSkills,
                };

                return { ...sub, Challenge: cleanChallenge };
            });
            
            const newSubmissions = cleanedSubmissions as CleanSubmission[];
            if (newSubmissions.length !== submissions.length || 
                (newSubmissions.length > 0 && newSubmissions[0].id !== submissions[0]?.id)) {
                setSubmissions(newSubmissions);
            }
        } else {
            if (submissions.length > 0) setSubmissions([]);
        }
        
        if (progressRes.data) {
            const rawProgress = progressRes.data;
            const cleanedSkills = (rawProgress.StudentSkill || []).map((ss: { Skill: SkillFromDB | SkillFromDB[] | null, level: number, xp: number }) => ({
                ...ss,
                Skill: ss.Skill ? (Array.isArray(ss.Skill) ? ss.Skill[0] : ss.Skill) : null,
            }));
            const newProgress = {
                level: rawProgress.level,
                xp: rawProgress.xp,
                StudentSkill: cleanedSkills
            } as ProfileProgress;

            if (JSON.stringify(newProgress) !== JSON.stringify(progress)) {
                setProgress(newProgress);
            }
        } else {
            if (progress !== null) setProgress(null);
        }

        const newNotifications = (notificationsRes.data as Notification[] || []);
        if (newNotifications.length !== notifications.length ||
            (newNotifications.length > 0 && newNotifications[0].id !== notifications[0]?.id)) {
            setNotifications(newNotifications);
        }
        
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
        const newStats = { ...performanceStats, ...rewardStats };
        if (JSON.stringify(newStats) !== JSON.stringify(stats)) {
            setStats(newStats);
        }

        const newStudentProfile = (profileRes.data as { username: string } | null);
        if (JSON.stringify(newStudentProfile) !== JSON.stringify(studentProfile)) {
            setStudentProfile(newStudentProfile);
        }

        if (savedChallengesRes.data) {
            const cleanedSavedChallenges = (savedChallengesRes.data as SavedChallengeResponse[])
                
                .filter(item => item.Challenge && !Array.isArray(item.Challenge))
                .map((item: SavedChallengeResponse) => {
                    
                    const challenge = item.Challenge as ChallengeFromDB;

                    const cleanedStartupProfile = challenge.StartupProfile
                        ? (Array.isArray(challenge.StartupProfile) ? challenge.StartupProfile[0] : challenge.StartupProfile)
                        : null;

                    
                    const cleanedChallengeSkills: CleanChallengeSkill[] = (challenge.ChallengeSkill || []).map((cs: ChallengeSkillFromDB) => ({
                        Skill: cs.Skill ? (Array.isArray(cs.Skill) ? cs.Skill[0] : cs.Skill) : null,
                    }));

                    
                    const cleanChallenge: CleanChallenge = {
                        ...challenge,
                        StartupProfile: cleanedStartupProfile,
                        ChallengeSkill: cleanedChallengeSkills,
                    };

                    
                    return {
                        saved_at: item.saved_at,
                        Challenge: cleanChallenge
                    };
                }); 

            if (JSON.stringify(cleanedSavedChallenges) !== JSON.stringify(savedChallenges)) {
                setSavedChallenges(cleanedSavedChallenges); 
            }
        } else {
            if (savedChallenges.length > 0) setSavedChallenges([]);
        }

        setLoading(false);
        setHasFetched(true);
    }, [submissions, progress, notifications, stats, studentProfile, savedChallenges]);

    const refetchDashboardData = useCallback(() => {
        if (user?.id) {
            setHasFetched(false);
            fetchDashboardData(user.id);
        }
    }, [user?.id, fetchDashboardData]);


    useEffect(() => {
        if (authLoading) return;
        if (user && profile?.role === 'student' && !hasFetched) {
            fetchDashboardData(user.id);
        } else if (!user && hasFetched) {
            fetchDashboardData(undefined);
        } else if (!user && !authLoading) {
            setLoading(false);
        }
    }, [user, profile, authLoading, hasFetched, fetchDashboardData]);

    const value = useMemo(() => ({
        loading, submissions, progress, notifications, stats, studentProfile, savedChallenges, refetchDashboardData
    }), [loading, submissions, progress, notifications, stats, studentProfile, savedChallenges, refetchDashboardData]);

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