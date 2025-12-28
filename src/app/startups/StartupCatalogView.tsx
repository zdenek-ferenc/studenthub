"use client";

import { useState } from 'react';
import StartupCard from '../../components/StartupCard';
import StartupFilterSidebar from '../../components/StartupFilterSidebar';
import { useAuth } from '../../contexts/AuthContext';
import withAuth from '../../components/withAuth';
import { useData } from '../../contexts/DataContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { ShieldCheck, Building2, ArrowLeft } from 'lucide-react';

function StartupCatalogView() {
    const { profile, loading: authLoading } = useAuth();
    const { startups, allCategories, startupFilters, loadingStartups, loadMoreStartups, hasMoreStartups, loadingFilters } = useData();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    if (authLoading) {
        return <LoadingSpinner />;
    }

        if (profile?.role === 'startup') {
    return (
        <div className="min-h-[60vh] md:py-32 w-full flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative animate-soft-fade-up">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--barva-primarni)] to-[var(--barva-primarni2)]"></div>
            
            <div className="p-8 md:p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-[var(--barva-primarni2)]/30 rounded-full flex items-center justify-center mb-6 text-[var(--barva-primarni)]">
                <ShieldCheck size={40} strokeWidth={1.5} />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-[var(--barva-tmava)] mb-4">
                Tato sekce je pro talenty
            </h2>

            <p className="text-gray-500 mb-8 leading-relaxed">
                Nacházíš se v katalogu startupů, kde studenti hledají příležitosti. 
                <br className="hidden md:block" />
                Jako firma se v seznamu hledat nemusíš – raději se ujisti, že tvůj profil vypadá neodolatelně!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
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
                <Building2 size={18} />
                Upravit firemní profil
                </Link>
            </div>
            </div>
        </div>
        </div>
    );
    }

    return (
        <div className="min-h-screen flex flex-col max-w-5/6 mx-auto py-4 sm:py-8 md:py-24 xl:py-28 3xl:py-32 items-start gap-1 lg:gap-3">
            <div className='w-full mb-3 3xl:mb-4 flex justify-between items-center'>
                <h1 className="text-xl 3xl:text-2xl font-semibold text-[var(--barva-tmava)]">Objev inovativní startupy</h1>
                <div className="lg:hidden flex justify-between items-center">
                    <button 
                        onClick={() => setIsFilterOpen(true)}
                        className="p-3 rounded-full bg-white shadow-md border text-[var(--barva-primarni)]"
                    >
                        <SlidersHorizontal size={20} />
                    </button>
                </div>
            </div>

            {loadingFilters ? (
                <div className="w-full p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500">Načítám filtry...</p>
                </div>
            ) : (
                <StartupFilterSidebar
                    allCategories={allCategories}
                    selectedCategoryIds={startupFilters.selectedCategoryIds}
                    setSelectedCategoryIds={startupFilters.setSelectedCategoryIds}
                    searchQuery={startupFilters.searchQuery}
                    setSearchQuery={startupFilters.setSearchQuery}
                    sortBy={startupFilters.sortBy}
                    setSortBy={startupFilters.setSortBy}
                    isMobileOpen={isFilterOpen} 
                    setMobileOpen={setIsFilterOpen} 
                />
            )}
            
            <main className="flex-1 w-full mt-4">
                {loadingStartups && startups.length === 0 ? (
                    <div className="">
                    </div>
                ) : (
                    <>
                        {startups.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
                                {startups.map(startup => (
                                    <StartupCard key={startup.user_id} startup={startup} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-12 rounded-2xl w-full">
                                <h2 className="text-xl font-bold text-[var(--barva-tmava)]">Žádné startupy nenalezeny</h2>
                                <p className="text-gray-500 mt-2">Zkuste upravit filtry pro lepší výsledky.</p>
                            </div>
                        )}
                        <div className="text-center mt-12">
                            {hasMoreStartups && (
                                <button onClick={loadMoreStartups} disabled={loadingStartups} className="px-8 py-3 rounded-full bg-[var(--barva-primarni)] text-white font-semibold shadow-md hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {loadingStartups ? 'Načítám...' : 'Načíst další'}
                                </button>
                            )}
                            {!hasMoreStartups && startups.length > 0 && <p className="text-gray-500"></p>}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default withAuth(StartupCatalogView);