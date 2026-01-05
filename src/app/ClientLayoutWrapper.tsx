"use client";

import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ChallengesProvider, useChallenges } from '../contexts/ChallengesContext';
import { DataProvider } from '../contexts/DataContext';
import { DashboardProvider } from '../contexts/DashboardContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MainContent from '../components/MainContent';
import './globals.css';

import ToastContainer from '../components/ToastContainer';
import FullPageLoader from '../components/ui/FullPageLoader';
import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';

import BottomNavBar from '../components/BottomNavBar';
import OnboardingGuide from '../components/OnboardingGuide';
import CookieConsentWidget from '../components/CookieConsentWidget'; 

import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

function AppContent({ children }: { children: ReactNode }) {
    const { loading: authLoading } = useAuth();
    const pathname = usePathname();
    
    // Načtení kontextu výzev (může být undefined, pokud jsme mimo provider, ale tady jsme uvnitř)
    const challengesContext = useChallenges();
    const challengesLoading = challengesContext?.loading || false;

    // --- CENTRÁLNÍ LOGIKA ---
    let isLoading = authLoading;

    // Pokud jsme v sekci challenges, čekáme i na data výzev
    if (pathname?.startsWith('/challenges')) {
        isLoading = isLoading || challengesLoading;
    }
    
    // Pokud jsme na dashboardu, můžeme chtít taky počkat (volitelné, pokud tam máš dashboardContext)
    // if (pathname?.startsWith('/dashboard')) { ... }

    return (
        // Tento DIV je tu VŽDY. Server i klient se na něm shodnou -> Žádný Hydration Error.
        <div className="flex flex-col min-h-screen relative">
            
            {/* Loader je jen vrstva navíc (Overlay). 
                Díky 'fixed inset-0 z-[9999]' překryje celou aplikaci. */}
            {isLoading && <FullPageLoader />}

            {/* Obsah aplikace je zde vždy přítomen, ale skrytý (opacity-0/invisible), dokud se načítá.
                Důležité: Neodstraňujeme ho z DOMu (žádné {isLoading ? null : ...}), 
                jen ho schováme. Tím pádem se data mohou načíst na pozadí. */}
            <div 
                className={`flex-1 flex flex-col transition-opacity duration-500 ${isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
                <Header />
                <div className="flex-1 flex flex-col">
                    <MainContent>
                        {children}
                    </MainContent>
                </div>
                <Footer />
                <BottomNavBar />
                <OnboardingGuide />
            </div>
        </div>
    );
}

// ... Export default function ClientLayoutWrapper ... (zbytek souboru beze změny)
export default function ClientLayoutWrapper({ children }: { children: ReactNode }) {
    // ... tvůj původní kód providerů ...
    const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

    return (
        <AuthProvider>
            <DashboardProvider>
                <ChallengesProvider>
                    <DataProvider>
                        <AppContent>{children}</AppContent>
                        <CookieConsentWidget onDecision={setAnalyticsEnabled} />
                            {analyticsEnabled && (
                                <>
                                    <Analytics />
                                    <SpeedInsights />
                                </>
                            )}
                        <ToastContainer />
                    </DataProvider>
                </ChallengesProvider>
            </DashboardProvider>
        </AuthProvider>
    );
}