"use client";

import { useState, useEffect } from 'react';
import StudentCard from '../../components/StudentCard';
import FilterSidebar from '../../components/FilterSidebar';
import { useAuth } from '../../contexts/AuthContext';
import withAuth from '../../components/withAuth';
import { useData } from '../../contexts/DataContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { SlidersHorizontal } from 'lucide-react';


function StudentCatalogPage() {
    const { profile, loading: authLoading } = useAuth();
    const { students, allSkills, studentFilters, loadingStudents, loadMoreStudents, hasMoreStudents, loadingFilters, refetchStudents } = useData();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        if (profile?.role === 'startup') {
            refetchStudents();
        }
    }, [profile?.role, refetchStudents]);

    if (authLoading) {
        return <LoadingSpinner />;
    }

    if (profile?.role !== 'startup') {
        return <p className="text-center py-20 text-3xl text-[var(--barva-primarni)]">K zobrazení této stránky nemáte oprávnění.</p>;
    }

    return (
        <div className="flex flex-col max-w-5/6 mx-auto px-4 md:py-22 lg:py-28 3xl:py-32 lg:flex-row items-start gap-8">
            {loadingFilters ? (
                <aside className="hidden lg:block w-full lg:w-80 p-6 bg-white rounded-2xl shadow-xs border border-gray-100 h-fit top-28 flex-shrink-0">
                    <p className="text-gray-500">Načítám filtry...</p>
                </aside>
            ) : (
                <FilterSidebar
                    allSkills={allSkills}
                    selectedSkillIds={studentFilters.selectedSkillIds}
                    setSelectedSkillIds={studentFilters.setSelectedSkillIds}
                    searchQuery={studentFilters.searchQuery}
                    setSearchQuery={studentFilters.setSearchQuery}
                    sortBy={studentFilters.sortBy}
                    setSortBy={studentFilters.setSortBy}
                    isMobileOpen={isFilterOpen}
                    setMobileOpen={setIsFilterOpen}
                />
            )}
            <main className="flex-1 w-full ">
                <div className="sticky md:relative top-0 z-30 pt-2 pb-2 lg:hidden flex justify-end">
                        <button 
                            onClick={() => setIsFilterOpen(true)}
                            className="p-3 rounded-full bg-[var(--barva-tmava)] cursor-pointer shadow-md border text-white"
                        >
                        <SlidersHorizontal size={20} />
                        </button>
                </div>
                {loadingStudents && students.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    </div>
                ) : (
                    <>
                        {students.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-5 2xl:gap-6">
                                {students.map(student => <StudentCard key={student.user_id} student={student} />)}
                            </div>
                        ) : (
                            <div className="text-center p-12 rounded-2xl w-full">
                                <h2 className="text-xl font-bold text-[var(--barva-tmava)]">Žádní studenti nenalezeni</h2>
                                <p className="text-gray-500 mt-2">Zkuste upravit filtry pro lepší výsledky.</p>
                            </div>
                        )}
                        <div className="text-center mt-12">
                            {hasMoreStudents && (
                                <button onClick={loadMoreStudents} disabled={loadingStudents} className="px-8 py-3 rounded-full bg-[var(--barva-primarni)] cursor-pointer text-white font-semibold shadow-md hover:bg-[var(--barva-primarni)]/90 transition-all ease-in-out duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {loadingStudents ? 'Načítám...' : 'Načíst další'}
                                </button>
                            )}
                            {!hasMoreStudents && students.length > 0 && <p className="text-gray-500">To je vše! Všichni studenti byli zobrazeni.</p>}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default withAuth(StudentCatalogPage);