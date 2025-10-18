"use client";

import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ChallengesProvider } from '../contexts/ChallengesContext';
import { DataProvider } from '../contexts/DataContext';
import { DashboardProvider } from '../contexts/DashboardContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MainContent from '../components/MainContent';
import './globals.css';
import { Sora } from "next/font/google";
import ToastContainer from '../components/ToastContainer';
import LoadingSpinner from '../components/LoadingSpinner';
import { ReactNode } from 'react';
import BottomNavBar from '@/components/BottomNavBar';

const sora = Sora({
  subsets: ["latin"],
  variable: '--font-sora',
});

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
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="cs">
      <body className={sora.variable}>
        <AuthProvider>
          <DashboardProvider>
            <ChallengesProvider>
              <DataProvider>
                <AppContent>{children}</AppContent>
                <ToastContainer />
              </DataProvider>
            </ChallengesProvider>
          </DashboardProvider>
        </AuthProvider>
      </body>
    </html>
  );
}