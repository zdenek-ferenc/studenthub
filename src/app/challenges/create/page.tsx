    "use client";

    import { useAuth } from '@/contexts/AuthContext';
    import CreateChallengeView from './CreateChallengeView'; 
    import LoadingSpinner from '@/components/LoadingSpinner';
    import Link from 'next/link';
    import { ShieldCheck, LayoutDashboard, Telescope } from 'lucide-react';

    export default function CreateChallengePage() {
    const { profile, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (profile?.role === 'student') {
        return (
        <div className="min-h-[90vh]w-full flex items-center justify-center px-4 py-32">
            <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative animate-soft-fade-up">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--barva-primarni)] to-[var(--barva-primarni2)]"></div>
            <div className="p-8 md:p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-[var(--barva-primarni2)]/30 rounded-full flex items-center justify-center mb-6 text-[var(--barva-primarni)]">
                <ShieldCheck size={40} strokeWidth={1.5} />
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-[var(--barva-tmava)] mb-4">
                Tvorba výzev je pro firmy
                </h2>

                <p className="text-gray-500 mb-8 leading-relaxed">
                Tato sekce slouží firmám k zadávání nových projektů. 
                <br className="hidden md:block" />
                Tvým úkolem je na výzvy reagovat, řešit je a sbírat zkušenosti!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Link 
                    href="/dashboard"
                    className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
                >
                    <LayoutDashboard size={18} />
                    Zpět na dashboard
                </Link>

                <Link 
                    href="/challenges"
                    className="px-6 py-3 rounded-xl bg-[var(--barva-primarni)] text-white font-medium hover:bg-[var(--barva-tmava)] hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                    <Telescope size={18} />
                    Najít výzvu
                </Link>
                </div>
            </div>
            </div>
        </div>
        );
    }

    return (
        <div className="pt-24 pb-12 min-h-screen">
        <CreateChallengeView />
        </div>
    );
    }