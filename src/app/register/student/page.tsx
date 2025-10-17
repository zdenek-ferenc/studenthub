"use client";

import { useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../../lib/supabaseClient';
import { Session, User, Provider } from '@supabase/supabase-js';

import Step1_PersonalInfo from './steps/Step1_PersonalInfo';
import Step2_EducationInfo from './steps/Step2_EducationInfo';
import Step3_Skills from './steps/Step3_Skills';
import Step4_Languages from './steps/Step4_Languages';
import ConfirmationModal from '@/components/ConfirmationModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

type Skill = { id: string; name: string; };
type Language = { id: string; name: string; };

const IS_DEVELOPMENT_MODE = false;
const DEV_START_STEP = 2;
const TOTAL_STEPS = 4; 

type StudentRegistrationData = {
    first_name: string; last_name: string; username: string; phone_number: string;
    university: string; field_of_study: string; specialization: string; year_of_study: number;
    skills: string[]; languages: string[]; gdpr_consent: boolean;
};

type FormDataStep = Partial<Omit<StudentRegistrationData, 'skills' | 'languages'>> & {
    skills?: string[]; languages?: string[];
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
    const redirectPath = '/register/student';
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

export default function StudentRegistrationPage() {
    const [session, setSession] = useState<Session | null>(IS_DEVELOPMENT_MODE ? ({} as Session) : null);
    const [user, setUser] = useState<User | null>(IS_DEVELOPMENT_MODE ? ({ id: 'dev-user-student' } as User) : null);
    const [step, setStep] = useState(IS_DEVELOPMENT_MODE ? DEV_START_STEP : 1);
    const [loading, setLoading] = useState(!IS_DEVELOPMENT_MODE);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showEmailRegister, setShowEmailRegister] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [allLanguages, setAllLanguages] = useState<Language[]>([]);
    const [staticDataLoaded, setStaticDataLoaded] = useState(false);
    const [formDataCache, setFormDataCache] = useState<StudentRegistrationData>({
        first_name: '', last_name: '', username: '', phone_number: '',
        university: '', field_of_study: '', specialization: '', year_of_study: 0,
        skills: [], languages: [], gdpr_consent: false,
    });

    const loadInitialProfileData = useCallback(async (userId: string) => {
        const { data } = await supabase.from('StudentProfile').select('*, StudentSkill(skill_id), StudentLanguage(language_id)').eq('user_id', userId).single();
        if (data) {
            setStep(data.registration_step || 2);
            setFormDataCache(prev => ({
                ...prev,
                ...data,
                skills: data.StudentSkill?.map((s: {skill_id: string}) => s.skill_id) || [],
                languages: data.StudentLanguage?.map((l: {language_id: string}) => l.language_id) || [],
            }));
        }
    }, []);

    const handleUserSignedIn = useCallback(async (session: Session) => {
        const userId = session.user.id;
        const { data: existingUser } = await supabase.from('User').select('id, role').eq('id', userId).single();

        if (existingUser && existingUser.role !== 'student') {
            setError(`Účet je již registrován s jinou rolí.`);
            await supabase.auth.signOut();
            return;
        }

        if (existingUser) {
            const { data: profile } = await supabase.from('StudentProfile').select('registration_step').eq('user_id', userId).single();
            if ((profile?.registration_step || 1) > 5) {
                router.push('/dashboard');
            } else {
                await loadInitialProfileData(userId);
            }
        } else {
            await supabase.from('User').insert({ id: userId, email: session.user.email, role: 'student' });
            await supabase.from('StudentProfile').insert({ user_id: userId, registration_step: 2, level: 1, xp: 0 });
            setStep(2);
        }
    }, [router, loadInitialProfileData]);

    const saveStepData = useCallback(async (currentStep: number, data: StudentRegistrationData) => {
        if (!user) return;
        setIsSaving(true);

        try {
            if (currentStep === 2) {
                const { first_name, last_name, username, phone_number } = data;
                const { error } = await supabase.from('StudentProfile').update({ first_name, last_name, username, phone_number }).eq('user_id', user.id);
                if (error) throw error;
            }
            if (currentStep === 3) {
                const { university, field_of_study, specialization, year_of_study } = data;
                const { error } = await supabase.from('StudentProfile').update({ university, field_of_study, specialization, year_of_study }).eq('user_id', user.id);
                if (error) throw error;
            }
            if (currentStep === 4) {
                await supabase.from('StudentSkill').delete().eq('student_id', user.id);
                const toInsert = data.skills.map(id => ({ student_id: user.id, skill_id: id, level: 1, xp: 0 }));
                if (toInsert.length > 0) await supabase.from('StudentSkill').insert(toInsert);
            }
            if (currentStep === 5) {
                await supabase.from('StudentLanguage').delete().eq('student_id', user.id);
                const toInsert = data.languages.map(id => ({ student_id: user.id, language_id: id }));
                if (toInsert.length > 0) await supabase.from('StudentLanguage').insert(toInsert);
            }
            const nextStepInDB = Math.min(currentStep + 1, 6); 
            await supabase.from('StudentProfile').update({ registration_step: nextStepInDB }).eq('user_id', user.id);

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
            router.push('/dashboard');
        }
    };

    useEffect(() => {
        const fetchStaticData = async () => {
            const [skillsRes, languagesRes] = await Promise.all([
                supabase.from('Skill').select('id, name').order('name'),
                supabase.from('Language').select('id, name').order('name')
            ]);
            setAllSkills(skillsRes.data || []);
            setAllLanguages(languagesRes.data || []);
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
            options: {
                emailRedirectTo: `${window.location.origin}/register/student`
            }
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
        switch (step) {
            case 2: return <Step1_PersonalInfo onNext={handleNextStep} initialData={formDataCache} />;
            case 3: return <Step2_EducationInfo onNext={handleNextStep} initialData={formDataCache} />;
            case 4: return <Step3_Skills onNext={handleNextStep} allSkills={allSkills} isLoading={!staticDataLoaded} initialSelectedIds={formDataCache.skills} />;
            case 5: return <Step4_Languages onNext={handleNextStep} allLanguages={allLanguages} isLoading={!staticDataLoaded} initialSelectedIds={formDataCache.languages} />;
            default: return null;
        }
    };
    
    if ((loading || !staticDataLoaded) && !IS_DEVELOPMENT_MODE) {
        return <div className="w-full min-h-screen flex items-center justify-center bg-[var(--barva-svetle-pozadi)]"><LoadingSpinner /></div>;
    }

    return (
        <div className="w-full min-h-screen flex items-start justify-center bg-[var(--barva-svetle-pozadi)] px-4">
            {IS_DEVELOPMENT_MODE || session ? (
                <div className="w-full py-6 md:py-12">
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
                <div className="w-full max-w-4xl grid lg:grid-cols-2 bg-white rounded-2xl shadow-md overflow-hidden my-6 md:my-32">
                    <div className="p-8 flex flex-col justify-center gap-12">
                        <div>
                            <div className="text-center">
                                <h1 className="text-3xl font-bold text-[var(--barva-tmava)]">Zaregistruj se</h1>
                                <p className="text-gray-500 mt-2 text-sm">Začni budovat svou budoucnost už dnes!</p>
                            </div>
                            <div className="mt-8 space-y-4">
                                {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</p>}
                                {!showEmailRegister ? (
                                    <>
                                        <SocialButton provider="google" label="Pokračovat s Googlem" icon={<svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.151,44,30.63,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>} />
                                        <button onClick={() => setShowEmailRegister(true)} className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                            <span className="font-semibold text-gray-600 text-sm">Pokračovat s Emailem</span>
                                        </button>
                                    </>
                                ) : (
                                    <form onSubmit={handleEmailRegister} className="space-y-4">
                                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input w-full" />
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
                                Už máš účet?{' '}
                                <Link href="/login" className="font-semibold text-[var(--barva-primarni)] hover:underline">
                                    Přihlas se zde
                                </Link>
                            </p>
                        </div>
                    </div>
                    <div className="hidden lg:block bg-[var(--barva-primarni)]">
                        <Image src="/login.png" alt="Student a inovace" width={1600} height={2000} className="w-full h-full object-cover" />
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