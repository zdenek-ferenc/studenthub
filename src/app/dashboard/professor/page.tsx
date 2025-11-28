"use client";

import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfessorDashboard() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
        if (!loading && user && profile?.role !== 'professor') {
            // Redirect unauthorized roles
            if (profile?.role === 'student') router.push('/dashboard');
            else if (profile?.role === 'startup') router.push('/challenges');
        }
    }, [user, profile, loading, router]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Načítání...</div>;
    }

    if (!user || profile?.role !== 'professor') {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-[var(--barva-svetle-pozadi)] p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold text-[var(--barva-primarni)] mb-2">
                        Vítejte, {profile.ProfessorProfile?.title_before} {profile.ProfessorProfile?.title_after ? `${profile.first_name} ${profile.last_name}, ${profile.ProfessorProfile?.title_after}` : `${profile.first_name} ${profile.last_name}`}
                    </h1>
                    <p className="text-gray-600 text-lg">
                        {profile.ProfessorProfile?.university_name}, {profile.ProfessorProfile?.faculty_name}
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Placeholder for future features */}
                    <div className="bg-white p-6 rounded-3xl shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Moje Předměty</h2>
                        <div className="h-40 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                            Zatím žádné předměty
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Aktivní Výzvy</h2>
                        <div className="h-40 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                            Zatím žádné výzvy
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
