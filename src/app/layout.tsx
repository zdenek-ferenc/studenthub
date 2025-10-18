"use client";

import { AuthProvider } from '../contexts/AuthContext';
import { ChallengesProvider } from '../contexts/ChallengesContext';
import { DataProvider } from '../contexts/DataContext';
import { DashboardProvider } from '../contexts/DashboardContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MainContent from '../components/MainContent';
import './globals.css';
import { Sora } from "next/font/google";
import ToastContainer from '../components/ToastContainer';

const sora = Sora({
  subsets: ["latin"],
  variable: '--font-sora',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className={sora.variable}>
        <AuthProvider>
          <DashboardProvider>
            <ChallengesProvider>
              <DataProvider>
                <Header />
                <MainContent>
                  {children}
                </MainContent>
                <Footer />
                <ToastContainer />
              </DataProvider>
            </ChallengesProvider>
          </DashboardProvider>
        </AuthProvider>
      </body>
    </html>
  );
}