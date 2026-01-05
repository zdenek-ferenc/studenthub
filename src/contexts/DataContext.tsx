"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { useDebounce } from '../hooks/useDebounce';

type Category = { id: string; name: string; };
type Skill = { id: string; name: string; };
type Language = { id: string; name: string; };

type ChallengeStatus = { 
    status: 'open' | 'closed' | 'draft' | 'archived'; 
    deadline: string; 
};

export type Startup = {
    user_id: string;
    company_name: string;
    description: string | null;
    logo_url: string | null;
    website: string | null;
    created_at: string;
    StartupCategory: { Category: Category }[];
    Challenge: ChallengeStatus[];
};

export type Student = {
    user_id: string;
    first_name: string;
    last_name: string;
    username: string;
    profile_picture_url: string | null;
    university: string | null;
    bio: string | null;
    created_at: string;
    level: number | null;
    xp: number | null;
    StudentSkill: { Skill: Skill }[];
    StudentLanguage: { Language: Language }[];
    Submission: { id: string; is_winner: boolean }[];
};

type StartupFiltersType = {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategoryIds: string[];
    setSelectedCategoryIds: (ids: string[]) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
};

type StudentFiltersType = {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedSkillIds: string[];
    setSelectedSkillIds: (ids: string[]) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
};

type RawStudentSkillFromDB = { Skill: Skill | Skill[] | null };
type RawStudentLanguageFromDB = { Language: Language | Language[] | null };

// 1. ZMĚNA: Raw typ odpovídá databázi (status místo is_winner)
type RawSubmissionFromDB = { id: string; status: string };

type RawStudentProfileFromDB = Omit<Student, 'StudentSkill' | 'StudentLanguage' | 'level_progress' | 'Submission'> & {
    StudentSkill: RawStudentSkillFromDB[] | null;
    StudentLanguage: RawStudentLanguageFromDB[] | null;
    Submission: RawSubmissionFromDB[] | null;
};

type DataContextType = {
    startups: Startup[];
    students: Student[];
    allCategories: Category[];
    allSkills: Skill[];
    startupFilters: StartupFiltersType;
    studentFilters: StudentFiltersType;
    loadingFilters: boolean;
    loadingStartups: boolean;
    loadingStudents: boolean;
    hasMoreStartups: boolean;
    hasMoreStudents: boolean;
    refetchStartups: () => void;
    refetchStudents: () => void;
    loadMoreStartups: () => void;
    loadMoreStudents: () => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);
const ITEMS_PER_PAGE = 12;

export function DataProvider({ children }: { children: ReactNode }) {
    const { loading: authLoading } = useAuth();
    const [startups, setStartups] = useState<Startup[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [loadingFilters, setLoadingFilters] = useState(true);
    const [loadingStartups, setLoadingStartups] = useState(false);
    const [startupPage, setStartupPage] = useState(0);
    const [hasMoreStartups, setHasMoreStartups] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [studentPage, setStudentPage] = useState(0);
    const [hasMoreStudents, setHasMoreStudents] = useState(true);
    const [startupSearch, setStartupSearch] = useState('');
    const [startupCategories, setStartupCategories] = useState<string[]>([]);
    const [startupSortBy, setStartupSortBy] = useState('match');
    const [studentSearch, setStudentSearch] = useState('');
    const [studentSkills, setStudentSkills] = useState<string[]>([]);
    const [studentSortBy, setStudentSortBy] = useState('match');

    const debouncedStartupSearch = useDebounce(startupSearch, 500);
    const debouncedStudentSearch = useDebounce(studentSearch, 500);


    const refetchStartups = useCallback(async (currentPage = 0) => {
        if (authLoading) { setLoadingStartups(false); return; }
        if (currentPage === 0) setStartups([]);
        setLoadingStartups(true);
        const from = currentPage * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        let query = supabase.from('StartupProfile').select(`*, StartupCategory(Category(id, name)), Challenge(status, deadline)`);

        try {
            if (startupCategories.length > 0) {
                const { data: rpcData, error: rpcError } = await supabase.rpc('get_startups_with_categories', { category_ids: startupCategories, search_term: debouncedStartupSearch });
                if (rpcError) throw rpcError;
                const startupIds = rpcData?.map((s: { user_id: string }) => s.user_id) || [];
                if (startupIds.length === 0) { setStartups([]); setHasMoreStartups(false); setLoadingStartups(false); return; }
                query = query.in('user_id', startupIds);
            } else if (debouncedStartupSearch) {
                query = query.or(`company_name.ilike.%${debouncedStartupSearch}%,description.ilike.%${debouncedStartupSearch}%`);
            }

            if (startupSortBy === 'newest') query = query.order('created_at', { ascending: false });
            else query = query.order('company_name', { ascending: true });

            const { data, error } = await query.range(from, to);
            if (error) throw error;

            if (data) {
                setStartups(prev => (currentPage === 0 ? data as Startup[] : [...prev, ...data as Startup[]]));
                setHasMoreStartups(data.length === ITEMS_PER_PAGE);
            } else {
                if (currentPage === 0) setStartups([]); setHasMoreStartups(false);
            }
        } catch (error) {
            console.error("Chyba při načítání startupů:", error instanceof Error ? error.message : JSON.stringify(error));
            if (currentPage === 0) setStartups([]); setHasMoreStartups(false);
        } finally {
            setLoadingStartups(false);
        }
    }, [authLoading, debouncedStartupSearch, startupCategories, startupSortBy]);


    const refetchStudents = useCallback(async (currentPage = 0) => {
        if (authLoading) { setLoadingStudents(false); return; }
        if (currentPage === 0) setStudents([]);
        setLoadingStudents(true);
        const from = currentPage * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        // 2. ZMĚNA: Select status místo is_winner
        let query = supabase.from('StudentProfile')
            .select(`
                user_id, first_name, last_name, username, profile_picture_url, university, bio, created_at, level, xp,
                StudentSkill ( Skill ( id, name ) ),
                StudentLanguage ( Language ( id, name ) ),
                Submission ( id, status )
            `)
            .not('first_name', 'is', null)
            .neq('first_name', '')
            .not('last_name', 'is', null)
            .neq('last_name', '');

        try {
            if (studentSkills.length > 0) {
                const { data: rpcData, error: rpcError } = await supabase.rpc('get_students_with_all_skills', { 
                    p_skill_ids: studentSkills, 
                    p_search_term: debouncedStudentSearch 
                });
                if (rpcError) throw rpcError;
                const studentIds = rpcData?.map((s: { user_id: string }) => s.user_id) || [];
                if (studentIds.length === 0) { setStudents([]); setHasMoreStudents(false); setLoadingStudents(false); return; }
                query = query.in('user_id', studentIds);
            } else if (debouncedStudentSearch) {
                query = query.or(`first_name.ilike.%${debouncedStudentSearch}%,last_name.ilike.%${debouncedStudentSearch}%,bio.ilike.%${debouncedStudentSearch}%`);
            }

            if (studentSortBy === 'newest') query = query.order('created_at', { ascending: false });
            else if (studentSortBy === 'level') query = query.order('level', { ascending: false, nullsFirst: false })
                                                    .order('xp', { ascending: false, nullsFirst: false });
            else query = query.order('last_name', { ascending: true });

            const { data, error } = await query.range(from, to);
            if (error) throw error;

            if (data) {
                // Tady používáme double cast, abychom umlčeli ten TypeScript error, 
                // protože my víme, že Submission v DB má 'status', i když TS si myslí svoje
                const rawDataFromDB = data as unknown as RawStudentProfileFromDB[];
                
                const cleanedData: Student[] = rawDataFromDB.map((student): Student => {

                    const skills: { Skill: Skill }[] = (student.StudentSkill ?? [])
                        .map(ss => {
                            const skillData = ss ? (Array.isArray(ss.Skill) ? ss.Skill[0] : ss.Skill) : null;
                            if (skillData && typeof skillData === 'object' && 'id' in skillData && 'name' in skillData) {
                                return { Skill: skillData as Skill };
                            }
                            return null;
                        })
                        .filter((item): item is { Skill: Skill } => item !== null);

                    const languages: { Language: Language }[] = (student.StudentLanguage ?? [])
                        .map(sl => {
                            const langData = sl ? (Array.isArray(sl.Language) ? sl.Language[0] : sl.Language) : null;
                            if (langData && typeof langData === 'object' && 'id' in langData && 'name' in langData) {
                                return { Language: langData as Language };
                            }
                            return null;
                        })
                        .filter((item): item is { Language: Language } => item !== null);

                    // 3. ZMĚNA: Mapování statusu na is_winner a filtrace "applied"
                    const processedSubmissions = (student.Submission ?? [])
                        .filter(sub => sub.status !== 'applied') // Odfiltrujeme ty, co se jen přihlásili
                        .map(sub => ({
                            id: sub.id,
                            is_winner: sub.status === 'winner' // Pokud je status 'winner', je vítěz
                        }));

                    return {
                        user_id: student.user_id,
                        first_name: student.first_name,
                        last_name: student.last_name,
                        username: student.username,
                        profile_picture_url: student.profile_picture_url,
                        university: student.university,
                        bio: student.bio,
                        created_at: student.created_at,
                        level: student.level ?? null,
                        xp: student.xp ?? null,
                        StudentSkill: skills,
                        StudentLanguage: languages,
                        Submission: processedSubmissions
                    };
                });

                setStudents(prev => (currentPage === 0 ? cleanedData : [...prev, ...cleanedData]));
                setHasMoreStudents(data.length === ITEMS_PER_PAGE);
            } else {
                if (currentPage === 0) setStudents([]); setHasMoreStudents(false);
            }
        } catch(error) {
            console.error("Chyba při načítání studentů:", error instanceof Error ? error.message : JSON.stringify(error));
            if (currentPage === 0) setStudents([]); setHasMoreStudents(false);
        } finally {
            setLoadingStudents(false);
        }
    }, [authLoading, debouncedStudentSearch, studentSkills, studentSortBy]);

    useEffect(() => {
        if (!authLoading) {
            setStartupPage(0);
            refetchStartups(0);
        }
    }, [authLoading, debouncedStartupSearch, startupCategories, startupSortBy, refetchStartups]);

    useEffect(() => {
        if (!authLoading) {
            setStudentPage(0);
            refetchStudents(0);
        }
    }, [authLoading, debouncedStudentSearch, studentSkills, studentSortBy, refetchStudents]);

    useEffect(() => {
        const fetchFiltersData = async () => {
            if (allCategories.length > 0 && allSkills.length > 0) {
                setLoadingFilters(false); return;
            }
            if (authLoading) return;
            setLoadingFilters(true);
            try {
                const [categoriesRes, skillsRes] = await Promise.all([
                    supabase.from('Category').select('id, name'),
                    supabase.from('Skill').select('id, name')
                ]);
                if (categoriesRes.data) setAllCategories(categoriesRes.data);
                if (skillsRes.data) setAllSkills(skillsRes.data);
            } catch (error) {
                console.error("Chyba při načítání dat pro filtry:", error);
            } finally {
                setLoadingFilters(false);
            }
        };
        fetchFiltersData();
    }, [authLoading, allCategories.length, allSkills.length]);

    const loadMoreStartups = useCallback(() => {
        if (loadingStartups || authLoading) return;
        const nextPage = startupPage + 1;
        setStartupPage(nextPage);
        refetchStartups(nextPage);
    }, [startupPage, refetchStartups, loadingStartups, authLoading]);

    const loadMoreStudents = useCallback(() => {
        if (loadingStudents || authLoading) return;
        const nextPage = studentPage + 1;
        setStudentPage(nextPage);
        refetchStudents(nextPage);
    }, [studentPage, refetchStudents, loadingStudents, authLoading]);

    const value = useMemo(() => ({
        startups, students, allCategories, allSkills,
        loadingStartups, loadingStudents, loadingFilters,
        hasMoreStartups, hasMoreStudents,
        refetchStartups: refetchStartups,
        refetchStudents: refetchStudents,
        loadMoreStartups, loadMoreStudents,
        startupFilters: {
            searchQuery: startupSearch, setSearchQuery: setStartupSearch,
            selectedCategoryIds: startupCategories, setSelectedCategoryIds: setStartupCategories,
            sortBy: startupSortBy, setSortBy: setStartupSortBy,
        },
        studentFilters: {
            searchQuery: studentSearch, setSearchQuery: setStudentSearch,
            selectedSkillIds: studentSkills, setSelectedSkillIds: setStudentSkills,
            sortBy: studentSortBy, setSortBy: setStudentSortBy,
        }
    }), [
        startups, students, allCategories, allSkills,
        loadingStartups, loadingStudents, loadingFilters,
        hasMoreStartups, hasMoreStudents,
        startupSearch, startupCategories, startupSortBy,
        studentSearch, studentSkills, studentSortBy,
        loadMoreStartups, loadMoreStudents,
        refetchStartups, refetchStudents
    ]);


    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within a DataProvider');
    return context;
}