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
import { ReactNode } from 'react';

const sora = Sora({
  subsets: ["latin"],
  variable: '--font-sora',
});

// Komponenta, která "obalí" zbytek aplikace a řeší načítání
function AppShell({ children }: { children: ReactNode }) {
  const { loading: authLoading } = useAuth();

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Vždy renderujeme obsah, ale kondicionálně ho rozmažeme */}
      <div className={`flex-1 flex flex-col ${authLoading ? 'loading-blur' : ''}`}>
        <Header />
        <MainContent>
          {children}
        </MainContent>
        <Footer />
      </div>

      {/* Overlay se spinnerem se zobrazí jen při načítání */}
      {authLoading && (
        <div className="loading-overlay">
        </div>
      )}
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: ReactNode; // Zde byla oprava z React.React-Node na ReactNode
}) {
  return (
    <html lang="cs">
      <body className={sora.variable}>
        <AuthProvider>
          <DashboardProvider>
            <ChallengesProvider>
              <DataProvider>
                {/* Obalíme children do AppShell */}
                <AppShell>
                  {children}
                </AppShell>
                <ToastContainer />
              </DataProvider>
            </ChallengesProvider>
          </DashboardProvider>
        </AuthProvider>
      </body>
    </html>
  );
}