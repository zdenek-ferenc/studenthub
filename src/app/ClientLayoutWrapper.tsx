"use client";

import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ChallengesProvider } from '../contexts/ChallengesContext';
import { DataProvider } from '../contexts/DataContext';
import { DashboardProvider } from '../contexts/DashboardContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MainContent from '../components/MainContent';
import './globals.css';

import ToastContainer from '../components/ToastContainer';
import LoadingSpinner from '../components/LoadingSpinner';
import { ReactNode } from 'react';

import BottomNavBar from '../components/BottomNavBar';
import OnboardingGuide from '../components/OnboardingGuide';

import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

function AppContent({ children }: { children: ReactNode }) {
    const { loading: authLoading } = useAuth();

    if (authLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <>
            <Header />
            <MainContent>
                {children}
            </MainContent>
            <Footer />
            <BottomNavBar />
            <OnboardingGuide />
        </>
    );
}

export default function ClientLayoutWrapper({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <DashboardProvider>
                <ChallengesProvider>
                    <DataProvider>
                        <AppContent>{children}</AppContent>
                        <Analytics />
                        <SpeedInsights />
                        <ToastContainer />
                    </DataProvider>
                </ChallengesProvider>
            </DashboardProvider>
        </AuthProvider>
    );
}