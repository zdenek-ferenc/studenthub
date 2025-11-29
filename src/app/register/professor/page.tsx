"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

type CredentialsData = {
    email: string;
    password: string;
};

export default function ProfessorRegistrationPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();
    const { showToast } = useAuth();
    
    const { register, handleSubmit, formState: { errors } } = useForm<CredentialsData>();

    const onSubmit = async (data: CredentialsData) => {
        setIsLoading(true);
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        role: 'professor',
                    }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("Registrace se nezdařila (žádný uživatel).");
            setIsSuccess(true);
            
            
        } catch (error: unknown) {
            console.error("Registration error:", error);
            const errorMessage = error instanceof Error ? error.message : "Registrace se nezdařila.";
            showToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-white sm:bg-[var(--barva-svetle-pozadi)] flex flex-col items-center sm:justify-center p-6 sm:p-4">
                <div className="w-full max-w-md bg-white p-8 rounded-3xl sm:shadow-xl text-center">
                    <div className="flex justify-center mb-6">
                        <CheckCircle size={64} className="text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-[var(--barva-primarni)] mb-4">Registrace úspěšná!</h2>
                    <p className="text-gray-600 mb-8">
                        Odeslali jsme vám potvrzovací e-mail. Prosím zkontrolujte svou schránku a potvrďte svou registraci.
                    </p>
                    <Link 
                        href="/"
                        className="inline-block w-full py-3 rounded-full font-semibold text-white bg-[var(--barva-primarni)] hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Zpět na domovskou stránku
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white sm:bg-[var(--barva-svetle-pozadi)] flex flex-col">
                    
            <div className="flex-grow flex flex-col items-center sm:justify-center p-4 pb-20">
                <div className="w-full max-w-md sm:bg-white px-8 py-6 rounded-3xl sm:shadow-xl">
                    <div className="p-4 self-start">
                <Link href="/register" className="inline-flex text-sm items-center text-gray-500 hover:text-[var(--barva-primarni)] transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Zpět na výběr
                </Link>
            </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-center text-[var(--barva-primarni)] mb-2">Registrace Vyučujícího</h2>
                    <p className="text-center text-gray-500 mb-8">Vytvořte si účet pro správu výzev.</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input 
                                type="email" 
                                {...register('email', { 
                                    required: 'Email je povinný',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Neplatný email"
                                    }
                                })} 
                                className="input" 
                                placeholder="jan.novak@univerzita.cz"
                            />
                            {errors.email && <p className="error text-sm text-red-400 pt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Heslo</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    {...register('password', { 
                                        required: 'Heslo je povinné',
                                        minLength: { value: 6, message: "Heslo musí mít alespoň 6 znaků" }
                                    })} 
                                    className="input pr-10" 
                                    placeholder="••••••••"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && <p className="error text-sm text-red-400 pt-1">{errors.password.message}</p>}
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-3 mt-4 rounded-full font-semibold cursor-pointer text-white bg-[var(--barva-primarni)] hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Vytvářím účet...' : 'Vytvořit účet'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
