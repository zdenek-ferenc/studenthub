"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useDebounce } from '../hooks/useDebounce';

type Category = { id: string; name: string; };
type Skill = { id: string; name: string; };
type Language = { id: string; name: string; };
type ChallengeStatus = { status: 'open' | 'closed' | 'draft' | 'archived'; };

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
    level_progress: number | null;
    StudentSkill: { Skill: Skill }[];
    StudentLanguage: { Language: Language }[];
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

type RawStudentData = Omit<Student, 'StudentSkill' | 'StudentLanguage'> & {
    StudentSkill: { Skill: Skill[] }[];
    StudentLanguage: { Language: Language[] }[];
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
        if (currentPage === 0) setStartups([]);
        setLoadingStartups(true);
        const from = currentPage * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        let query = supabase.from('StartupProfile').select(`*, StartupCategory(Category(id, name)), Challenge(status)`);

        if (startupCategories.length > 0) {
            const { data: rpcData } = await supabase.rpc('get_startups_with_categories', { category_ids: startupCategories, search_term: debouncedStartupSearch });
            const startupIds = rpcData?.map((s: { user_id: string }) => s.user_id) || [];
            if (startupIds.length === 0) {
                setStartups([]);
                setHasMoreStartups(false);
                setLoadingStartups(false);
                return;
            }
            query = query.in('user_id', startupIds);
        } else if (debouncedStartupSearch) { 
            query = query.or(`company_name.ilike.%${debouncedStartupSearch}%,description.ilike.%${debouncedStartupSearch}%`);
        }

        if (startupSortBy === 'newest') query = query.order('created_at', { ascending: false });
        else query = query.order('company_name', { ascending: true });

        const { data } = await query.range(from, to);
        if (data) {
            setStartups(prev => (currentPage === 0 ? data as Startup[] : [...prev, ...data as Startup[]]));
            setHasMoreStartups(data.length === ITEMS_PER_PAGE);
        }
        setLoadingStartups(false);
    }, [debouncedStartupSearch, startupCategories, startupSortBy]); 

    const refetchStudents = useCallback(async (currentPage = 0) => {
        if (currentPage === 0) setStudents([]);
        setLoadingStudents(true);
        const from = currentPage * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        
        let query = supabase.from('StudentProfile').select(`*, StudentSkill(Skill(id, name)), StudentLanguage(Language(id, name))`);
        if (studentSkills.length > 0) {
            const { data: rpcData } = await supabase.rpc('get_students_with_skills', { skill_ids: studentSkills, search_term: debouncedStudentSearch });
            const studentIds = rpcData?.map((s: { user_id: string }) => s.user_id) || [];
             if (studentIds.length === 0) {
                setStudents([]);
                setHasMoreStudents(false);
                setLoadingStudents(false);
                return;
            }
            query = query.in('user_id', studentIds);
        } else if (debouncedStudentSearch) { 
            query = query.or(`first_name.ilike.%${debouncedStudentSearch}%,last_name.ilike.%${debouncedStudentSearch}%,bio.ilike.%${debouncedStudentSearch}%`);
        }

        if (studentSortBy === 'newest') query = query.order('created_at', { ascending: false });
        else if (studentSortBy === 'level') query = query.order('level_progress', { ascending: false, nullsFirst: false });
        else query = query.order('last_name', { ascending: true });
        
        const { data } = await query.range(from, to);
        if (data) {
            const cleanedData = (data as RawStudentData[]).map(student => ({
                ...student,
                StudentSkill: (student.StudentSkill || []).flatMap(ss => ss.Skill).map(skill => ({ Skill: skill })),
                StudentLanguage: (student.StudentLanguage || []).flatMap(sl => sl.Language).map(lang => ({ Language: lang })),
            }));
            setStudents(prev => (currentPage === 0 ? cleanedData : [...prev, ...cleanedData]));
            setHasMoreStudents(data.length === ITEMS_PER_PAGE);
        }
        setLoadingStudents(false);
    }, [debouncedStudentSearch, studentSkills, studentSortBy]); 
    
    useEffect(() => {
        setStartupPage(0);
        refetchStartups(0);
    }, [debouncedStartupSearch, startupCategories, startupSortBy, refetchStartups]); 

    useEffect(() => {
        setStudentPage(0);
        refetchStudents(0);
    }, [debouncedStudentSearch, studentSkills, studentSortBy, refetchStudents]); 

    useEffect(() => {
        const fetchFiltersData = async () => {
            if (allCategories.length > 0 && allSkills.length > 0) {
                setLoadingFilters(false);
                return;
            }
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
    }, [allCategories.length, allSkills.length]);

    const loadMoreStartups = useCallback(() => {
        const nextPage = startupPage + 1;
        setStartupPage(nextPage);
        refetchStartups(nextPage);
    }, [startupPage, refetchStartups]);
    
    const loadMoreStudents = useCallback(() => {
        const nextPage = studentPage + 1;
        setStudentPage(nextPage);
        refetchStudents(nextPage);
    }, [studentPage, refetchStudents]);

    const value = useMemo(() => ({
        startups, students, allCategories, allSkills,
        loadingStartups, loadingStudents, loadingFilters,
        hasMoreStartups, hasMoreStudents,
        refetchStartups: () => refetchStartups(0),
        refetchStudents: () => refetchStudents(0),
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
    }), [startups, students, allCategories, allSkills, loadingStartups, loadingStudents, loadingFilters, hasMoreStartups, hasMoreStudents, startupSearch, startupCategories, startupSortBy, studentSearch, studentSkills, studentSortBy, loadMoreStartups, loadMoreStudents, refetchStartups, refetchStudents]);

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within a DataProvider');
    return context;
}