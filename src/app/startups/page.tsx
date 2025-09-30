"use client";

import { useState } from 'react'; // <-- PŘIDAT IMPORT
import StartupCard from '../../components/StartupCard';
import StartupFilterSidebar from '../../components/StartupFilterSidebar';
import { useAuth } from '../../contexts/AuthContext';
import withAuth from '../../components/withAuth';
import { useData } from '../../contexts/DataContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { SlidersHorizontal } from 'lucide-react'; // <-- PŘIDAT IMPORT


function StartupCatalogPage() {
    const { profile, loading: authLoading } = useAuth();
    const { startups, allCategories, startupFilters, loadingStartups, loadMoreStartups, hasMoreStartups } = useData();
    const [isFilterOpen, setIsFilterOpen] = useState(false); // <-- PŘIDAT STAV

    if (authLoading) {
        return <LoadingSpinner />;
    }

    if (profile?.role !== 'student') {
        return <p className="text-center py-20 text-3xl text-[var(--barva-primarni)]">K zobrazení této stránky nemáte oprávnění.</p>;
    }

    return (
        <div className="container mx-auto flex flex-col lg:flex-row items-start gap-8 px-4 md:py-6">
            <StartupFilterSidebar
                allCategories={allCategories}
                selectedCategoryIds={startupFilters.selectedCategoryIds}
                setSelectedCategoryIds={startupFilters.setSelectedCategoryIds}
                searchQuery={startupFilters.searchQuery}
                setSearchQuery={startupFilters.setSearchQuery}
                sortBy={startupFilters.sortBy}
                setSortBy={startupFilters.setSortBy}
                isMobileOpen={isFilterOpen} // <-- PŘEDAT PROPS
                setMobileOpen={setIsFilterOpen} // <-- PŘEDAT PROPS
            />
            <main className="flex-1 w-full">
                {/* --- PŘIDANÁ SEKCE S TLAČÍTKEM --- */}
                <div className="mb-6 lg:hidden flex justify-end">
                    <button 
                        onClick={() => setIsFilterOpen(true)}
                        className="p-3 rounded-full bg-white shadow-md border text-[var(--barva-primarni)]"
                    >
                        <SlidersHorizontal size={20} />
                    </button>
                </div>

                {loadingStartups && startups.length === 0 ? (
                    <div className="">
                    </div>
                ) : (
                    <>
                        {startups.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

export default withAuth(StartupCatalogPage);