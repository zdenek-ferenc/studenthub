"use client";

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { generateJoinCode } from '../../../../lib/utils/code-generator';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ProjectTypeKey, PROJECT_TYPES_CONFIG } from '../../../../types/academic';
import Step1_SubjectInfo from './steps/Step1_SubjectInfo';
import Step2_ProjectDefinition from './steps/Step2_ProjectDefinition';
import Step3_Timeline from './steps/Step3_Timeline';
import WizardNavigation from '../../../../components/WizardNavigation';

export type CreateRequestFormData = {
    subject_name: string;
    semester: string;
    student_count: number;
    description: string;
    join_code: string;
    selected_project_type: ProjectTypeKey;
    deliverables: { value: string }[];
    requirements: { value: string }[];
    deadline_application: string;
    deadline_delivery: string;
};

export default function CreateRequestPage() {
    const { user, showToast } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const methods = useForm<CreateRequestFormData>({
        defaultValues: {
            join_code: generateJoinCode(),
            semester: 'ZS 2025',
            student_count: 30,
            selected_project_type: 'marketing_strategy',
            deliverables: PROJECT_TYPES_CONFIG['marketing_strategy'].defaultDeliverables.map(d => ({ value: d })),
            // ZDE JE ZMĚNA - Logičtější defaulty
            requirements: [
                { value: 'Přístup k interním datům (např. GA4, CRM)' },
                { value: 'Dostupnost pro 3 online konzultace během semestru' }
            ]
        }
    });

    const onSubmit = async (data: CreateRequestFormData) => {
        if (!user) return;
        setIsLoading(true);

        const projectDefinition = [{
            type: data.selected_project_type,
            title: PROJECT_TYPES_CONFIG[data.selected_project_type].title,
            deliverables: data.deliverables.map(d => d.value).filter(Boolean)
        }];

        const timeline = {
            deadline_application: data.deadline_application,
            deadline_delivery: data.deadline_delivery
        };

        const requirementsArray = data.requirements.map(r => r.value).filter(Boolean);

        try {
            const { error } = await supabase
                .from('AcademicRequest')
                .insert({
                    professor_id: user.id,
                    subject_name: data.subject_name,
                    semester: data.semester,
                    student_count: data.student_count,
                    description: data.description,
                    join_code: data.join_code.toUpperCase(),
                    status: 'open',
                    project_types: projectDefinition,
                    timeline: timeline,
                    requirements: requirementsArray,
                    is_public: true
                });

            if (error) throw error;

            showToast('Předmět byl úspěšně vypsán a je otevřen pro startupy!', 'success');
            router.push('/dashboard/professor');

        } catch (error) {
            console.error('Error:', error);
            showToast('Nepodařilo se vytvořit předmět.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = async () => {
        const valid = await methods.trigger(); 
        // V reálu bychom validovali jen fieldy pro daný krok, ale pro jednoduchost stačí takto
        if (valid) setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => setCurrentStep(prev => prev - 1);

    return (
        <div className="min-h-screen bg-[var(--barva-svetle-pozadi)] md:py-32">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-end justify-between mb-4">
                    <Link href="/dashboard/professor" className="inline-flex text-sm items-center text-gray-500 hover:text-[var(--barva-primarni)] transition-colors">
                        <ArrowLeft size={18} className="mr-2" />
                        Zrušit a zpět
                    </Link>
                    <div className="flex items-end justify-between">
                        <div>
                        </div>
                        {/* Progress bar */}
                        <div className="flex gap-2">
                            {[1, 2, 3].map(step => (
                                <div key={step} className={`h-2 w-12 rounded-full transition-all ${step <= currentStep ? 'bg-[var(--barva-primarni)]' : 'bg-gray-200'}`} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(onSubmit)}>
                            <div className="p-8 md:p-6">
                                {currentStep === 1 && <Step1_SubjectInfo />}
                                {currentStep === 2 && <Step2_ProjectDefinition />}
                                {currentStep === 3 && <Step3_Timeline />}
                            </div>

                            <WizardNavigation 
                                currentStep={currentStep} 
                                totalSteps={3} 
                                onNext={nextStep} 
                                onPrev={prevStep}
                                isSubmitting={isLoading}
                            />
                        </form>
                    </FormProvider>
                </div>
            </div>
        </div>
    );
}