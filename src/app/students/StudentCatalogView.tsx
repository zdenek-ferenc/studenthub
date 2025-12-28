"use client";

import { useState, useEffect } from 'react';
import StudentCard from '../../components/StudentCard';
import FilterSidebar from '../../components/FilterSidebar';
import { useAuth } from '../../contexts/AuthContext';
import withAuth from '../../components/withAuth';
import { useData } from '../../contexts/DataContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { ShieldCheck, UserCog, ArrowLeft } from 'lucide-react';


function StudentCatalogView() {
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
            return (
                <div className="min-h-[60vh] md:py-32 w-full flex items-center justify-center p-4">
                <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--barva-primarni)] to-[var(--barva-primarni2)]"></div>
                    
                    <div className="p-8 md:p-12 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-[var(--barva-primarni2)]/30 rounded-full flex items-center justify-center mb-6 text-[var(--barva-primarni)] animate-soft-fade-up">
                        <ShieldCheck size={40} strokeWidth={1.5} />
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-[var(--barva-tmava)] mb-4 animate-soft-fade-up delay-100">
                        Tato sekce je pro firmy
                    </h2>

                    <p className="text-gray-500 mb-8 leading-relaxed animate-soft-fade-up delay-200">
                        Dostal ses do katalogu talentů, který slouží startupům k vyhledávání šikovných lidí, jako jsi ty. 
                        <br className="hidden md:block" />
                        Jako student sem přístup nepotřebuješ – důležité je, aby tvůj profil zářil pro ně!
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center animate-soft-fade-up delay-300">
                        <Link 
                        href="/dashboard"
                        className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
                        >
                        <ArrowLeft size={18} />
                        Zpět na přehled
                        </Link>

                        <Link 
                        href="/profile/edit"
                        className="px-6 py-3 rounded-xl bg-[var(--barva-primarni)] text-white font-medium hover:bg-[var(--barva-tmava)] hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                        <UserCog size={18} />
                        Vylepšit můj profil
                        </Link>
                    </div>
                    </div>
                </div>
                </div>
            );
            }

    return (
        <div className="min-h-screen flex flex-col max-w-5/6 mx-auto py-2 sm:py-8 md:py-24 xl:py-28 3xl:py-32 items-start gap-1 lg:gap-3">
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
                <div className="md:relative top-0 z-30 pt-2 pb-2 lg:hidden flex justify-end">
                        <button 
                            onClick={() => setIsFilterOpen(true)}
                            className="p-3 rounded-full bg-white cursor-pointer shadow-md border text-[var(--barva-primarni)] hover:bg-gray-100 transition-all flex items-center justify-center"
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
                        <div className="text-center my-8">
                            {hasMoreStudents && (
                                <button onClick={loadMoreStudents} disabled={loadingStudents} className="px-5 py-2 rounded-full bg-[var(--barva-primarni)] cursor-pointer text-white font-semibold shadow-md hover:bg-[var(--barva-primarni)]/90 transition-all ease-in-out duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed">
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

export default withAuth(StudentCatalogView);