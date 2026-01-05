"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import withAuth from '../../components/withAuth';
import { useAuth } from '../../contexts/AuthContext';

import { ToggleLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

const ModernDashboardView = dynamic(() => import('./update/ModernDashboardView'));
const LegacyDashboardView = dynamic(() => import('./LegacyDashboardView'));

function DashboardClientView() {
    const { profile } = useAuth();
    const router = useRouter();
    
    const [isModern, setIsModern] = useState<boolean | null>(null);

    useEffect(() => {
        const savedPref = localStorage.getItem('dashboard_v2_enabled');
        
        if (profile?.role === 'startup') {
            router.push('/challenges');
            return;
        }

        if (savedPref === 'true') {
            setIsModern(true);
        } else {
            setIsModern(false);
        }
        
    }, [profile, router]);

    const toggleDesign = () => {
        if (isModern === null) return;
        const newVal = !isModern;
        setIsModern(newVal);
        localStorage.setItem('dashboard_v2_enabled', String(newVal));
    };

    if (profile?.role === 'startup') return null; 
    if (profile?.role !== 'student') return null; 
    if (isModern === null) {
        return <div className="min-h-screen w-full bg-[#EFF8FF]" />;
    }

    return (
        <>
            <div className="w-full">
                {isModern ? (
                    <div className="animate-fade-in duration-500 bg-[#EFF8FF] min-h-screen">
                        <div className="hidden md:block fixed bottom-6 left-6 z-40 animate-fade-in-up">
                            <button 
                                onClick={toggleDesign}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0B1623]/80 backdrop-blur-md border border-white/10 text-xs font-medium text-gray-400 hover:text-white hover:border-white/30 transition-all shadow-xl group"
                            >
                                <ToggleLeft size={16} className="text-blue-500 group-hover:text-blue-400"/>
                                <span className="hidden sm:inline">Zpět na starý design</span>
                            </button>
                        </div>

                        <ModernDashboardView />

                        <div className="md:hidden py-8 flex justify-center bg-[#001224] -mt-1">
                            <button 
                                onClick={toggleDesign}
                                className="flex items-center border rounded-full border-gray-500 gap-2 px-5 py-3 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                            >
                                <ToggleLeft size={18} />
                                Zpět na starý design
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="legacy-enter-animation min-h-screen bg-[#001224]">
                        <LegacyDashboardView onSwitch={toggleDesign} />
                    </div>
                )}
            </div>
        </>
    );
}

export default withAuth(DashboardClientView);