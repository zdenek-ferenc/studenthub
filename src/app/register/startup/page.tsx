"use client";

import { useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../../lib/supabaseClient';
import { Session, User, Provider } from '@supabase/supabase-js';

import Step1_CompanyInfo from './steps/Step1_CompanyInfo';
import Step2_ContactPerson from './steps/Step2_ContactPerson';
import Step3_Categories from './steps/Step3_Categories';
import Step4_LogoUpload from './steps/Step4_LogoUpload';
import ConfirmationModal from '../../../components/ConfirmationModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

type Category = { id: string; name: string; };

const IS_DEVELOPMENT_MODE = false;
const DEV_START_STEP = 2;
const TOTAL_STEPS = 4;

type StartupRegistrationData = {
    company_name: string; ico: string; website: string; phone_number: string; contact_email: string; address: string;
    contact_first_name: string; contact_last_name: string; contact_position: string;
    categories: string[]; logo_url: string | null; gdpr_consent: boolean;
};

type FormDataStep = Partial<Omit<StartupRegistrationData, 'categories' | 'logo_url'>> & {
    categories?: string[]; logo_url?: string | null;
};

const RegistrationHeader = ({ currentStep, onBack, isLoading }: { currentStep: number, onBack: () => void, isLoading: boolean }) => {
    const stepIndex = currentStep - 1;
    const progressPercentage = (stepIndex / TOTAL_STEPS) * 100;

    return (
        <div className="w-full max-w-lg mx-auto mb-4">
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={onBack}
                    disabled={currentStep <= 2 || isLoading}
                    className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ArrowLeft size={16} />
                    Zpět
                </button>
                <span className="text-sm font-bold text-[var(--barva-primarni)]">
                    Krok {currentStep - 1} / {TOTAL_STEPS}
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                    className="bg-[var(--barva-primarni)] h-1.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>
        </div>
    );
};

const SocialButton = ({ provider, label, icon }: { provider: Provider, label: string, icon: ReactNode }) => {
    const handleLogin = async () => {
        const redirectPath = '/register/startup';
        const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const localBaseUrl = process.env.NEXT_PUBLIC_LOCAL_REDIRECT_BASE_URL;
        const redirectToUrl = (isLocalhost && localBaseUrl) ? `${localBaseUrl}${redirectPath}` : `${window.location.origin}${redirectPath}`;

        await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: redirectToUrl },
        });
    };

    return (
        <button onClick={handleLogin} className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            {icon}
            <span className="font-semibold text-gray-600 text-sm">{label}</span>
        </button>
    );
};

export default function StartupRegistrationPage() {
    const [session, setSession] = useState<Session | null>(IS_DEVELOPMENT_MODE ? ({} as Session) : null);
    const [user, setUser] = useState<User | null>(IS_DEVELOPMENT_MODE ? ({ id: 'dev-user-startup' } as User) : null);
    const [step, setStep] = useState(IS_DEVELOPMENT_MODE ? DEV_START_STEP : 1);
    const [loading, setLoading] = useState(!IS_DEVELOPMENT_MODE);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showEmailRegister, setShowEmailRegister] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [staticDataLoaded, setStaticDataLoaded] = useState(false);
    const [formDataCache, setFormDataCache] = useState<StartupRegistrationData>({
        company_name: '', ico: '', website: '', phone_number: '', contact_email: '', address: '',
        contact_first_name: '', contact_last_name: '', contact_position: '',
        categories: [], logo_url: null, gdpr_consent: false,
    });

    const loadInitialProfileData = useCallback(async (userId: string) => {
        const { data } = await supabase.from('StartupProfile').select('*, StartupCategory(category_id)').eq('user_id', userId).single();
        if (data) {
            setStep(data.registration_step || 2);
            setFormDataCache(prev => ({
                ...prev,
                ...data,
                categories: data.StartupCategory?.map((c: { category_id: string }) => c.category_id) || [],
            }));
        }
    }, []);

    const handleUserSignedIn = useCallback(async (session: Session) => {
        const userId = session.user.id;
        const { data: existingUser } = await supabase.from('User').select('id, role').eq('id', userId).single();

        if (existingUser && existingUser.role !== 'startup') {
            setError(`Účet je již registrován s jinou rolí.`);
            await supabase.auth.signOut();
            return;
        }

        if (existingUser) {
            const { data: profile } = await supabase.from('StartupProfile').select('registration_step').eq('user_id', userId).single();
            if ((profile?.registration_step || 1) > 5) {
                router.push('/challenges');
            } else {
                await loadInitialProfileData(userId);
            }
        } else {
            await supabase.from('User').insert({ id: userId, email: session.user.email, role: 'startup' });
            await supabase.from('StartupProfile').insert({ user_id: userId, registration_step: 2, contact_email: session.user.email });
            setStep(2);
        }
    }, [router, loadInitialProfileData]);

    const saveStepData = useCallback(async (currentStep: number, data: StartupRegistrationData) => {
        if (!user) return;
        setIsSaving(true);

        try {
            if (currentStep === 2) {
                const { company_name, ico, website, phone_number, contact_email, address } = data;
                const { error } = await supabase.from('StartupProfile').update({ company_name, ico, website, phone_number, contact_email, address }).eq('user_id', user.id);
                if (error) throw error;
            }
            if (currentStep === 3) {
                const { contact_first_name, contact_last_name, contact_position } = data;
                const { error } = await supabase.from('StartupProfile').update({ contact_first_name, contact_last_name, contact_position }).eq('user_id', user.id);
                if (error) throw error;
            }
            if (currentStep === 4) {
                await supabase.from('StartupCategory').delete().eq('startup_id', user.id);
                const toInsert = data.categories.map(id => ({ startup_id: user.id, category_id: id }));
                if (toInsert.length > 0) {
                    const { error } = await supabase.from('StartupCategory').insert(toInsert);
                    if (error) throw error;
                }
            }
            if (currentStep === 5) {
                const { error } = await supabase.from('StartupProfile').update({ logo_url: data.logo_url }).eq('user_id', user.id);
                if (error) throw error;
            }
            
            const nextStepInDB = Math.min(currentStep + 1, 6);
            const { error: stepError } = await supabase.from('StartupProfile').update({ registration_step: nextStepInDB }).eq('user_id', user.id);
            if (stepError) throw stepError;

        } catch (error: unknown) {
            console.error("Chyba při ukládání na pozadí:", error);
        } finally {
            setIsSaving(false);
        }
    }, [user]);

    const handleNextStep = async (formData: FormDataStep) => {
        const newCache = { ...formDataCache, ...formData };
        setFormDataCache(newCache);
        
        const nextStep = step + 1;
        setStep(nextStep);

        saveStepData(step, newCache);

        if (nextStep > 5) {
            router.push('/challenges');
        }
    };

    useEffect(() => {
        const fetchStaticData = async () => {
            const { data } = await supabase.from('Category').select('id, name').order('name');
            setAllCategories(data || []);
            setStaticDataLoaded(true);
        };
        fetchStaticData();
    }, []);

    useEffect(() => {
        if (IS_DEVELOPMENT_MODE) { setLoading(false); return; };

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setUser(session.user); setSession(session); handleUserSignedIn(session);
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null); setSession(session);
            if (_event === 'SIGNED_IN' && session) await handleUserSignedIn(session);
            if (_event === 'SIGNED_OUT') setStep(1);
        });
        return () => subscription.unsubscribe();
    }, [handleUserSignedIn]);
    
    const handleEmailRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const { data: existingUser } = await supabase.from('User').select('email').eq('email', email).single();
        
        if (existingUser) {
        setError("Uživatel s tímto e-mailem již existuje.");
        setLoading(false);
        return;
        }
    
        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/register/startup` }
        });
    
        if (signUpError) {
            setError("Registrace se nezdařila. Zkuste to prosím znovu.");
        } else {
            setIsModalOpen(true);
        }
        setLoading(false);
    };

const renderStep = () => {
    if (!user && !IS_DEVELOPMENT_MODE) return <p>Chyba: Uživatel nebyl nalezen.</p>;
    if (!user) return null;

    switch (step) {
        case 2:
            return <Step1_CompanyInfo onNext={handleNextStep} initialData={formDataCache} />;
        case 3:
            return <Step2_ContactPerson onNext={handleNextStep} initialData={formDataCache} />;
        case 4:
            return <Step3_Categories onNext={handleNextStep} allCategories={allCategories} isLoading={!staticDataLoaded} initialSelectedIds={formDataCache.categories} />;
        case 5:
            return <Step4_LogoUpload onNext={handleNextStep} userId={user.id} />;
        default:
            return null;
    }
};

    
    if ((loading || !staticDataLoaded) && !IS_DEVELOPMENT_MODE) {
        return <div className="w-full min-h-screen flex items-center justify-center bg-[var(--barva-svetle-pozadi)]"><LoadingSpinner /></div>;
    }

    return (
        <div className="w-full min-h-screen flex items-start justify-center bg-[var(--barva-svetle-pozadi)] px-4 py-10 md:py-32">
            {IS_DEVELOPMENT_MODE || session ? (
                <div className="w-full">
                    {step >= 2 && step <= 5 && (
                        <RegistrationHeader
                            currentStep={step}
                            onBack={() => setStep(s => s - 1)}
                            isLoading={isSaving}
                        />
                    )}
                    {renderStep()}
                </div>
            ) : (
                <div className="w-full max-w-4xl grid lg:grid-cols-2 bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="p-8 sm:p-12 flex flex-col justify-center">
                        <div>
                            <div className="text-center">
                                <h1 className="text-3xl font-bold text-[var(--barva-tmava)]">Zaregistrujte svou firmu</h1>
                                <p className="text-gray-500 mt-2 text-sm">Najděte ty nejlepší talenty pro vaše projekty.</p>
                            </div>
                            <div className="mt-8 space-y-4">
                                {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</p>}
                                {!showEmailRegister ? (
                                    <>
                                        <SocialButton provider="google" label="Pokračovat s Googlem" icon={<svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.151,44,30.63,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>} />
                                        <button onClick={() => setShowEmailRegister(true)} className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                            <span className="font-semibold text-gray-600 text-sm">Pokračovat s Emailem</span>
                                        </button>
                                    </>
                                ) : (
                                    <form onSubmit={handleEmailRegister} className="space-y-4">
                                        <input type="email" placeholder="Firemní email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input w-full" />
                                        <input type="password" placeholder="Heslo (min. 6 znaků)" value={password} onChange={(e) => setPassword(e.target.value)} required className="input w-full" />
                                        <div className='flex justify-center'>
                                            <button type="submit" disabled={loading} className="mt-3 px-6 py-2 rounded-full bg-[var(--barva-primarni)] text-white font-semibold cursor-pointer">
                                                {loading ? 'Registruji...' : 'Vytvořit účet'}
                                            </button>
                                        </div>
                                        <button type="button" onClick={() => setShowEmailRegister(false)} className="w-full text-sm text-gray-500 hover:underline">Zpět na ostatní možnosti</button>
                                    </form>
                                )}
                            </div>
                            <p className="text-center text-sm text-gray-600 mt-8">
                                Už máte účet?{' '}
                                <Link href="/login" className="font-semibold text-[var(--barva-primarni)] hover:underline">
                                    Přihlaste se
                                </Link>
                            </p>
                        </div>
                    </div>
                    <div className="hidden lg:block bg-[var(--barva-primarni)]">
                        <Image src="/login2.png" alt="Inovace a byznys" width={1200} height={1500} className="w-full h-full object-cover" />
                    </div>
                </div>
            )}
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={() => { setIsModalOpen(false); setShowEmailRegister(false); }}
                title="E-mail odeslán"
                message="Potvrzovací e-mail byl odeslán na vaši adresu. Zkontrolujte si prosím schránku a dokončete registraci."
            />
        </div>
    );
}