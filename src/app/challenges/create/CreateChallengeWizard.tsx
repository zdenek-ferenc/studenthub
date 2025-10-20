"use client";

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';

import Step1_Basics from './steps/Step1_Basics';
import Step2_Details from './steps/Step2_Details';
import Step3_Settings from './steps/Step3_Settings';
import Step4_Summary from './steps/Step4_Summary';
import { CheckCircle, Check } from 'lucide-react';

export type ChallengeFormData = {
    id?: string;
    title: string;
    short_description: string;
    description: string;
    goals: string;
    expected_outputs: { value: string }[];
    has_financial_reward: boolean;
    reward_first_place?: number;
    reward_second_place?: number;
    reward_third_place?: number;
    reward_description?: string;
    skills: string[];
    attachments_urls: string[];
    deadline: string;
    max_applicants: number;
    type: 'public' | 'anonymous';
    status: 'draft' | 'open';
    number_of_winners?: number; 
};

const STEPS = [
    { id: 1, name: 'Základy' },
    { id: 2, name: 'Detailní zadání' },
    { id: 3, name: 'Nastavení a odměny' },
    { id: 4, name: 'Souhrn a zveřejnění' },
];

export default function CreateChallengeWizard() {
    const { user, showToast } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [step, setStep] = useState(1);
    const [challengeId, setChallengeId] = useState<string | null>(searchParams.get('draft_id'));
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [isLoading, setIsLoading] = useState(true);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    const methods = useForm<ChallengeFormData>({
        defaultValues: {
            title: '',
            short_description: '',
            description: '',
            goals: '',
            expected_outputs: [{ value: '' }],
            has_financial_reward: true,
            skills: [],
            attachments_urls: [],
            max_applicants: 10,
            type: 'public',
            status: 'draft',
            number_of_winners: 1, 
        }
    });

    useEffect(() => {
        const fetchDraft = async () => {
            if (challengeId) {
                const { data, error } = await supabase
                    .from('Challenge')
                    .select('*, ChallengeSkill(skill_id)')
                    .eq('id', challengeId)
                    .single();
                
                if (data) {
                    const fetchedData = {
                        ...data,
                        expected_outputs: data.expected_outputs 
                            ? data.expected_outputs.split('\n').map((item: string) => ({ value: item }))
                            : [{ value: '' }],
                        skills: data.ChallengeSkill.map((s: { skill_id: string }) => s.skill_id)
                    };
                    methods.reset(fetchedData);
                    
                    const newCompleted = new Set<number>();
                    if (data.title && data.short_description) newCompleted.add(1);
                    if (data.description && data.goals && data.expected_outputs) newCompleted.add(2);
                    if (data.deadline) newCompleted.add(3);
                    setCompletedSteps(newCompleted);

                } else {
                    console.error("Koncept nenalezen:", error);
                    router.push('/challenges/create');
                }
            }
            setIsLoading(false);
        };
        fetchDraft();
    }, [challengeId, methods, router]);

    const handleSaveAndContinue = async () => {
        if (!user) {
            showToast("Pro uložení se musíte přihlásit.", "error");
            return;
        }

        const isValid = await methods.trigger();
        if (!isValid) {
            return;
        }

        setSaveStatus('saving');
        const formData = methods.getValues();

        let numberOfWinners = 1;
        if (formData.has_financial_reward) {
            numberOfWinners = [formData.reward_first_place, formData.reward_second_place, formData.reward_third_place].filter(Boolean).length;
        } else {
            numberOfWinners = formData.number_of_winners || 1;
        }
        if (numberOfWinners === 0) numberOfWinners = 1; 
        
        const challengeDataToSave = {
            title: formData.title,
            short_description: formData.short_description,
            description: formData.description,
            goals: formData.goals,
            expected_outputs: formData.expected_outputs.map(item => item.value).filter(Boolean).join('\n'),
            has_financial_reward: formData.has_financial_reward,
            reward_first_place: formData.reward_first_place,
            reward_second_place: formData.reward_second_place,
            reward_third_place: formData.reward_third_place,
            reward_description: formData.reward_description,
            attachments_urls: formData.attachments_urls,
            deadline: formData.deadline,
            max_applicants: formData.max_applicants,
            type: formData.type,
            status: formData.status,
            number_of_winners: numberOfWinners,
        };
        let currentChallengeId = challengeId;

        if (currentChallengeId) {
            const { error } = await supabase.from('Challenge').update(challengeDataToSave).eq('id', currentChallengeId);
            if (error) {
                console.error("Chyba při ukládání konceptu:", error);
                showToast("Uložení konceptu se nezdařilo.", "error");
                setSaveStatus('idle');
                return;
            }
        } else {
            const { data: newChallenge, error } = await supabase
                .from('Challenge')
                .insert({ ...challengeDataToSave, startup_id: user.id })
                .select('id')
                .single();
            if (error) {
                console.error("Chyba při vytváření konceptu:", error);
                showToast("Vytvoření konceptu se nezdařilo.", "error");
                setSaveStatus('idle'); 
                return;
            }
            if(newChallenge) {
                currentChallengeId = newChallenge.id;
                setChallengeId(newChallenge.id);
                router.replace(`/challenges/create?draft_id=${newChallenge.id}`, { scroll: false });
            }
        }

        if (currentChallengeId && formData.skills) {
            await supabase.from('ChallengeSkill').delete().eq('challenge_id', currentChallengeId);
            if (formData.skills.length > 0) {
                const skillsToInsert = formData.skills.map((skillId: string) => ({ challenge_id: currentChallengeId, skill_id: skillId }));
                const { error: skillsError } = await supabase.from('ChallengeSkill').insert(skillsToInsert);
                if (skillsError) {
                    console.error("Chyba při ukládání dovedností:", skillsError);
                }
            }
        }
        setCompletedSteps(prev => new Set(prev).add(step));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
        if (step < 4) {
            setStep(s => s + 1);
        }
    };

    const handlePublish = async () => {
        const isValid = await methods.trigger();
        if (!isValid) {
            showToast('Před zveřejněním prosím doplňte všechny povinné údaje.', 'error');
            const errors = methods.formState.errors;
            if (errors.title || errors.short_description) {
                setStep(1);
            } else if (errors.description || errors.goals || errors.expected_outputs) {
                setStep(2);
            } else if (errors.deadline || errors.skills || errors.reward_first_place) {
                setStep(3);
            }
            return;
        }
        await handleSaveAndContinue(); 
        if (!challengeId) {
            showToast('Před zveřejněním se výzvu nepodařilo uložit.', 'error');
            return;
        }

        const { error } = await supabase.from('Challenge').update({ status: 'open' }).eq('id', challengeId);
        if (error) {
            showToast(`Chyba při zveřejňování: ${error.message}`, 'error');
        } else {
            showToast('Výzva byla úspěšně zveřejněna!', 'success');
            router.push('/challenges');
        }
    };

    const renderStepContent = () => {
        if (isLoading) return <p>Načítám koncept...</p>;
        switch (step) {
            case 1: return <Step1_Basics />;
            case 2: return <Step2_Details />;
            case 3: return <Step3_Settings />;
            case 4: return <Step4_Summary setStep={setStep} />;
            default: return null;
        }
    };
    
    return (
        <FormProvider {...methods}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
                <aside className="md:col-span-1">
                    <nav className="space-y-2 sticky top-28">
                        {STEPS.map((s) => {
                            const isCompleted = completedSteps.has(s.id);
                            const isActive = step === s.id;
                            const isClickable = isCompleted || completedSteps.has(s.id - 1) || s.id === 1;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => {
                                        if (isClickable) setStep(s.id)
                                    }}
                                    disabled={!isClickable}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-lg font-semibold flex items-center gap-3
                                        ${isActive ? 'bg-[var(--barva-primarni)] text-white shadow-md' : 'text-[var(--barva-tmava)] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                                >
                                    <span className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${isActive || isCompleted ? 'bg-white text-[var(--barva-primarni)]' : 'bg-gray-200 text-gray-500'}`}>
                                        {isCompleted && !isActive ? <Check size={18} /> : s.id}
                                    </span>
                                    {s.name}
                                </button>
                            )
                        })}
                        <div className="hidden md:block md:pt-4 text-center text-sm text-gray-500 h-6">
                            {saveStatus === 'saving' && 'Ukládám...'}
                            {saveStatus === 'saved' && <span className="flex md:items-center md:justify-center gap-1 text-green-600"><CheckCircle size={16}/> Koncept uložen</span>}
                        </div>
                    </nav>
                </aside>
                <main className="md:col-span-3">
                    <form onSubmit={(e) => e.preventDefault()} className="bg-white p-4 md:p-8 rounded-2xl shadow-sm">
                        {renderStepContent()}
                        <div className="mt-8 pt-6 border-t flex justify-between items-center">
                            <button 
                                type="button" 
                                onClick={() => setStep(s => s - 1)} 
                                disabled={step === 1}
                                className="px-6 py-2 rounded-full font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                            >
                                Zpět
                            </button>
                            {step < 4 ? (
                                <button type="button" onClick={handleSaveAndContinue} className="px-6 py-2 rounded-full font-semibold text-white bg-[var(--barva-primarni)] hover:bg-[var(--barva-primarni)]/90 transition-all ease-in-out duration-200 cursor-pointer">
                                    Uložit a pokračovat
                                </button>
                            ) : (
                                <button type="button" onClick={handlePublish} className="px-8 py-3 rounded-full font-bold text-white bg-[var(--barva-primarni)] hover:bg-[var(--barva-primarni)]/90 transition-all ease-in-out duration-200 cursor-pointer text-lg">
                                    Zveřejnit výzvu
                                </button>
                            )}
                        </div>
                    </form>
                </main>
            </div>
        </FormProvider>
    );
}