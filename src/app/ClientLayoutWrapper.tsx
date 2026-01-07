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
    
    const challengesContext = useChallenges();
    const challengesLoading = challengesContext?.loading || false;

    let isLoading = authLoading;

    if (pathname?.startsWith('/challenges')) {
        isLoading = isLoading || challengesLoading;
    }

    return (
        <div className="flex flex-col min-h-screen relative">
            {isLoading && <FullPageLoader />}
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

export default function ClientLayoutWrapper({ children }: { children: ReactNode }) {
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