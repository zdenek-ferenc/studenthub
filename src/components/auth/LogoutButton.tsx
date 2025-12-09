"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; 
import { LogOut, Loader2 } from 'lucide-react';

export default function LogoutButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const handleLogout = async () => {
        try {
            setIsLoading(true);
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            router.refresh(); 
            router.push('/'); 
            
        } catch (error) {
            console.error('Chyba při odhlašování:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="border-t border-gray-100 w-full pb-10">
            <button
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full group flex items-center justify-center gap-2 px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 active:scale-[0.98] transition-all rounded-xl font-medium"
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                )}
                <span>Odhlásit se</span>
            </button>
        </div>
    );
}