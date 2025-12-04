"use client";

import { useState } from 'react';
import StartupCard from '../../components/StartupCard';
import StartupFilterSidebar from '../../components/StartupFilterSidebar';
import { useAuth } from '../../contexts/AuthContext';
import withAuth from '../../components/withAuth';
import { useData } from '../../contexts/DataContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { SlidersHorizontal } from 'lucide-react';

function StartupCatalogView() {
    const { profile, loading: authLoading } = useAuth();
    const { startups, allCategories, startupFilters, loadingStartups, loadMoreStartups, hasMoreStartups, loadingFilters } = useData();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    if (authLoading) {
        return <LoadingSpinner />;
    }

    if (profile?.role !== 'student') {
        return <p className="text-center py-20 text-3xl text-[var(--barva-primarni)]">K zobrazení této stránky nemáte oprávnění.</p>;
    }

    return (
        <div className="min-h-screen flex flex-col max-w-5/6 mx-auto py-4 sm:py-8 md:py-24 xl:py-28 3xl:py-32 items-start gap-1 lg:gap-3">
            {loadingFilters ? (
                <aside className="hidden lg:block w-full lg:w-80 p-6 bg-white rounded-2xl shadow-xs border border-gray-100 h-fit top-28 flex-shrink-0">
                    <p className="text-gray-500">Načítám filtry...</p>
                </aside>
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
            <main className="flex-1 w-full">
                <div className='mb-3 3xl:mb-4 flex justify-between items-center'>
                    <div>
                    <h1 className="text-xl 3xl:text-2xl font-semibold text-[var(--barva-tmava)]">Objev inovativní startupy</h1>
                </div>
                <div className="lg:hidden flex justify-between items-center">
                    <button 
                        onClick={() => setIsFilterOpen(true)}
                        className="p-3 rounded-full bg-white shadow-md border text-[var(--barva-primarni)]"
                    >
                        <SlidersHorizontal size={20} />
                    </button>
                </div>
                </div>
                
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