"use client";

import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { AcademicRequest } from '../../../types/academic';
import CourseCard from '../../../components/academic/CourseCard';
import { Plus, BookOpen, Users, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function ProfessorDashboard() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const [requests, setRequests] = useState<AcademicRequest[]>([]);
    const [stats, setStats] = useState({
        totalSubjects: 0,
        totalStudents: 0,
        pendingOffers: 0
    });
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }
        if (!loading && user && profile?.role !== 'professor') {
            if (profile?.role === 'student') router.push('/dashboard');
            else if (profile?.role === 'startup') router.push('/challenges');
            return;
        }

        if (user) {
            fetchDashboardData(user.id);
        }
    }, [user, profile, loading, router]);

    const fetchDashboardData = async (userId: string) => {
        try {
            setIsLoadingData(true);
            const { data, error } = await supabase
                .from('AcademicRequest')
                .select('*')
                .eq('professor_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const fetchedRequests = data as AcademicRequest[] || [];
            setRequests(fetchedRequests);

            const totalStudents = fetchedRequests.reduce((sum, req) => sum + (req.student_count || 0), 0);
            
            setStats({
                totalSubjects: fetchedRequests.length,
                totalStudents: totalStudents,
                pendingOffers: 0
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    if (loading || (isLoadingData && !requests.length)) {
        return (
            <div className="min-h-screen bg-[var(--barva-svetle-pozadi)] flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--barva-primarni)]"></div>
            </div>
        );
    }

    if (!user || profile?.role !== 'professor') return null;

    return (
        <div className="min-h-screen bg-[var(--barva-svetle-pozadi)] py-4 md:py-32">
            <div className="px-4 sm:px-0 sm:max-w-5/6 mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-6">
                    <div>
                        <p className="text-[var(--barva-tmava)] hidden md:inline-block text-xl">
                            {profile.ProfessorProfile?.university_name} • {profile.ProfessorProfile?.faculty_name}
                        </p>
                    </div>
                    <Link 
                        href="/dashboard/professor/create"
                        className="px-4 sm:px-6 py-3 sm:py-3 bg-[var(--barva-primarni)] text-sm md:text-base text-white rounded-full font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
                    >
                        <Plus size={20} />
                        Nová Poptávka
                    </Link>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6">
                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border-2 border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className="text-xs md:text-sm text-gray-500 font-medium"> <span className='hidden lg:inline-block'>Aktivní</span> Předměty</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalSubjects}</p>
                        </div>
                    </div>

                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border-2 border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-xs md:text-sm text-gray-500 font-medium"><span className='hidden lg:inline-block'>Zapsaní</span> Studenti</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                        </div>
                    </div>

                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border-2 border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <p className="text-xs md:text-sm text-gray-500 font-medium">Nabídky <span className='hidden lg:inline-block'>od Startupů</span></p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pendingOffers}</p>
                        </div>
                    </div>
                </div>
                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-[var(--barva-tmava)] mb-6">Moje Předměty</h2>
                    
                    {requests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {requests.map((req) => (
                                <CourseCard key={req.id} request={req} />
                            ))}
                            <Link 
                                href="/dashboard/professor/create"
                                className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 text-gray-400 hover:border-[var(--barva-primarni)] hover:text-[var(--barva-primarni)] hover:bg-[var(--barva-primarni)]/5 transition-all group min-h-[280px]"
                            >
                                <div className="p-4 bg-gray-50 rounded-full group-hover:bg-white transition-colors mb-4">
                                    <Plus size={32} />
                                </div>
                                <span className="font-semibold">Vytvořit další předmět</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                <BookOpen size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Zatím nemáte žádné předměty</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-8">
                                Vytvořte svůj první předmět a začněte propojovat studenty s reálnými projekty.
                            </p>
                            <Link 
                                href="/dashboard/professor/create"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--barva-primarni)] text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:bg-opacity-90 transition-all"
                            >
                                <Plus size={20} />
                                Vytvořit první poptávku
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
