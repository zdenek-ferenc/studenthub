"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import Step1_Personal from '../../register/professor/Step1_Personal';
import Step2_University from '../../register/professor/Step2_University';

// Reuse types from steps or define locally if needed
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

type ProfessorOnboardingData = PersonalData & UniversityData;

const initialData: ProfessorOnboardingData = {
    title_before: '',
    first_name: '',
    last_name: '',
    title_after: '',
    university_name: '',
    faculty_name: '',
    bio: ''
};

export default function ProfessorOnboardingPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<ProfessorOnboardingData>(initialData);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { user, profile, showToast, refetchProfile } = useAuth();

    useEffect(() => {
        const loadProfile = async () => {
            if (!user) {
                // Wait for auth check or redirect if not logged in (handled by protected route usually, but safe check here)
                return;
            }

            // If profile is already loaded in context, we can use it to pre-fill
            if (profile?.ProfessorProfile) {
                 setFormData(prev => ({
                    ...prev,
                    university_name: profile.ProfessorProfile?.university_name || '',
                    faculty_name: profile.ProfessorProfile?.faculty_name || '',
                    title_before: profile.ProfessorProfile?.title_before || '',
                    title_after: profile.ProfessorProfile?.title_after || '',
                    bio: profile.ProfessorProfile?.bio || '',
                    // Names might be in profile root or not, depending on how we saved them.
                    // For now, let's assume we might need to fetch them or they are in the form.
                    // If we stored them in metadata during signup, we can fetch them from user metadata if needed,
                    // but Step1 asks for them again to be sure/editable.
                    first_name: profile.first_name || '',
                    last_name: profile.last_name || ''
                 }));
            }
            setIsLoading(false);
        };
        loadProfile();
    }, [user, profile]);


    const handleNext = (data: Partial<ProfessorOnboardingData>) => {
        setFormData(prev => ({ ...prev, ...data }));
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleFinalSubmit = async (data: Partial<ProfessorOnboardingData>) => {
        if (!user) return;
        const finalData = { ...formData, ...data };

        try {
            // Update ProfessorProfile
            const { error: profileError } = await supabase
                .from('ProfessorProfile')
                .upsert({
                    user_id: user.id,
                    university_name: finalData.university_name,
                    faculty_name: finalData.faculty_name,
                    title_before: finalData.title_before || null,
                    title_after: finalData.title_after || null,
                    bio: finalData.bio
                });

            if (profileError) throw profileError;

            if (profileError) throw profileError;

            // User table update removed as it is redundant/handled elsewhere or causes RLS issues.
            // If we need to sync names to User table, we should ensure RLS allows it or do it via Edge Function/Trigger.
            // For now, removing to fix the error as requested.
            
            // Also update auth metadata to be sure
             await supabase.auth.updateUser({
                data: {
                    first_name: finalData.first_name,
                    last_name: finalData.last_name,
                    title_before: finalData.title_before,
                    title_after: finalData.title_after,
                    full_name: `${finalData.title_before ? finalData.title_before + ' ' : ''}${finalData.first_name} ${finalData.last_name}${finalData.title_after ? ' ' + finalData.title_after : ''}`.trim()
                }
            });

            await refetchProfile();
            showToast("Profil úspěšně uložen!", 'success');
            router.push('/dashboard');

        } catch (error: unknown) {
            console.error("Onboarding error:", error);
            const errorMessage = error instanceof Error ? error.message : "Uložení se nezdařilo.";
            showToast(errorMessage, 'error');
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Načítání...</div>;
    }

    return (
        <div className="min-h-screen bg-[var(--barva-svetle-pozadi)] flex flex-col">
            <div className="flex-grow flex items-center justify-center p-4 pb-12">
                <div className="w-full max-w-lg">
                    {/* Progress Bar */}
                    <div className="mb-4 flex items-center justify-between gap-3 relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--barva-primarni)] -z-10 rounded-full transition-all duration-300`} style={{ width: `${((step - 1) / 1) * 100}%` }}></div>
                        
                        {[1, 2].map((s) => (
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
                            onNext={(data) => handleFinalSubmit(data)} 
                            initialData={formData} 
                            onBack={handleBack}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
