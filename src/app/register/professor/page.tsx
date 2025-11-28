"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import Step1_Personal from './Step1_Personal';
import Step2_University from './Step2_University';
import Step3_Credentials from './Step3_Credentials';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type PersonalData = {
    title_before: string;
    first_name: string;
    last_name: string;
    title_after: string;
};

type UniversityData = {
    university_name: string;
    faculty_name: string;
    bio: string;
};

type CredentialsData = {
    email: string;
    password: string;
    confirm_password: string;
};

type ProfessorRegistrationData = PersonalData & UniversityData & CredentialsData;

const initialData: ProfessorRegistrationData = {
    title_before: '',
    first_name: '',
    last_name: '',
    title_after: '',
    university_name: '',
    faculty_name: '',
    bio: '',
    email: '',
    password: '',
    confirm_password: ''
};

export default function ProfessorRegistrationPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<ProfessorRegistrationData>(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { showToast } = useAuth();

    const handleNext = (data: Partial<ProfessorRegistrationData>) => {
        setFormData(prev => ({ ...prev, ...data }));
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleFinalSubmit = async (credentials: CredentialsData) => {
        setIsLoading(true);
        const finalData = { ...formData, ...credentials };

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: finalData.email,
                password: finalData.password,
                options: {
                    data: {
                        role: 'professor',
                        first_name: finalData.first_name,
                        last_name: finalData.last_name,
                        title_before: finalData.title_before,
                        title_after: finalData.title_after,
                        full_name: `${finalData.title_before ? finalData.title_before + ' ' : ''}${finalData.first_name} ${finalData.last_name}${finalData.title_after ? ' ' + finalData.title_after : ''}`.trim()
                    }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("Registrace se nezdařila (žádný uživatel).");

            const userId = authData.user.id;
            const { error: profileError } = await supabase
                .from('ProfessorProfile')
                .insert({
                    user_id: userId,
                    university_name: finalData.university_name,
                    faculty_name: finalData.faculty_name,
                    title_before: finalData.title_before || null,
                    title_after: finalData.title_after || null,
                    bio: finalData.bio
                });
             const { error: userTableError } = await supabase
                .from('User')
                .insert({ 
                    id: userId, 
                    email: finalData.email, 
                    role: 'professor'
                });
            
            if (profileError) {
                 console.error("Profile Error:", profileError);
                 throw new Error("Chyba při vytváření profilu.");
            }

             if (userTableError) {
                 console.error("User Table Error:", userTableError);
            }

            showToast("Registrace úspěšná!", 'success');
            router.push('/dashboard'); 

        } catch (error: unknown) {
            console.error("Registration error:", error);
            const errorMessage = error instanceof Error ? error.message : "Registrace se nezdařila.";
            showToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--barva-svetle-pozadi)] flex flex-col">
            <div className="p-4 md:p-8">
                <Link href="/register" className="inline-flex items-center text-gray-500 hover:text-[var(--barva-primarni)] transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    Zpět na výběr
                </Link>
            </div>
            
            <div className="flex-grow flex items-center justify-center p-4 pb-12">
                <div className="w-full max-w-lg">
                    {/* Progress Bar */}
                    <div className="mb-4 flex items-center justify-between gap-3 relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--barva-primarni)] -z-10 rounded-full transition-all duration-300`} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
                        
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`w-full rounded-full flex items-center justify-center font-semibold text-sm transition-colors duration-300 ${step >= s ? 'bg-[var(--barva-primarni)] text-white' : 'bg-gray-200/70 text-gray-500'}`}>
                                {s}
                            </div>
                        ))}
                    </div>

                    {step === 1 && (
                        <Step1_Personal 
                            onNext={handleNext} 
                            initialData={formData} 
                        />
                    )}
                    {step === 2 && (
                        <Step2_University 
                            onNext={handleNext} 
                            initialData={formData} 
                            onBack={handleBack}
                        />
                    )}
                    {step === 3 && (
                        <Step3_Credentials 
                            onSubmit={handleFinalSubmit} 
                            onBack={handleBack}
                            isLoading={isLoading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
