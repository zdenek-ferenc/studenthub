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
import { ChevronLeft, ChevronRight } from 'lucide-react'; 

type Category = { id: string; name: string; };

const IS_DEVELOPMENT_MODE = false; 
const DEV_START_STEP = 2; 

type StartupRegistrationData = {
  company_name: string;
  ico: string;
  website: string;
  phone_number: string;
  contact_email: string;
  address: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_position: string;
  categories: string[]; 
  logo_url: string | null;
  gdpr_consent: boolean; 
};

type FormDataStep = Partial<Omit<StartupRegistrationData, 'categories' | 'logo_url'>> & {
    categories?: string[];
    logo_url?: string | null;
};

const FORM_STEPS = [2, 3, 4, 5];

const StepNavigation = ({ currentStep, setStep, isLoading }: { currentStep: number, setStep: (step: number) => void, isLoading: boolean }) => {
    
    const stepIndex = FORM_STEPS.indexOf(currentStep);
    const isCompleted = (stepNumber: number) => stepNumber < currentStep;
    
    const handleJump = (stepNumber: number) => {
        if (!isLoading && stepNumber < currentStep) {
            setStep(stepNumber);
        }
    };
    
    const handleGoToPrev = () => {
        if (stepIndex > 0) setStep(FORM_STEPS[stepIndex - 1]);
    };

    return (
        <div className="flex justify-center items-center gap-12 mt-8">
            <button
                onClick={handleGoToPrev}
                disabled={stepIndex === 0 || isLoading}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${stepIndex > 0 ? 'cursor-pointer bg-[var(--barva-primarni)] text-white hover:opacity-80' : 'bg-gray-300 text-gray-500 cursor-auto'}`}
            >
                <ChevronLeft size={24} />
            </button>

            <div className="flex gap-4">
                {FORM_STEPS.map(stepNumber => (
                    <button
                        key={stepNumber}
                        onClick={() => handleJump(stepNumber)}
                        disabled={stepNumber >= currentStep || isLoading}
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${
                            stepNumber === currentStep ? 'bg-[var(--barva-primarni)] scale-125' : 
                            isCompleted(stepNumber) ? 'bg-[var(--barva-primarni)]/50 hover:bg-[var(--barva-primarni)]/70 cursor-pointer hover:scale-105 transition-all duration-200 ease-in-out' : 
                            'bg-gray-300 cursor-not-allowed'
                        }`}
                    >
                        <span className="sr-only">Krok {stepNumber - 1}</span>
                    </button>
                ))}
            </div>

            <button
                disabled={true} 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-gray-300 text-gray-500 cursor-auto`}
            >
                <ChevronRight size={24} />
            </button>
        </div>
    );
};


const SocialButton = ({ provider, label, icon }: { provider: Provider, label: string, icon: ReactNode }) => {
  const handleLogin = async () => {
    const redirectPath = '/register/startup';
    
    const isLocalhost = 
        typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    const localBaseUrl = process.env.NEXT_PUBLIC_LOCAL_REDIRECT_BASE_URL;
    
    const redirectToUrl = (isLocalhost && localBaseUrl) 
        ? `${localBaseUrl}${redirectPath}` 
        : `${window.location.origin}${redirectPath}`;

    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectToUrl,
      },
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
  const [user, setUser] = useState<User | null>(IS_DEVELOPMENT_MODE ? ({id: 'dev-user-startup'} as User) : null);
  const [step, setStep] = useState(IS_DEVELOPMENT_MODE ? DEV_START_STEP : 1);
  const [loading, setLoading] = useState(!IS_DEVELOPMENT_MODE);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showEmailRegister, setShowEmailRegister] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [initialDataLoading, setInitialDataLoading] = useState(true);
  const [formDataCache, setFormDataCache] = useState<StartupRegistrationData>({
      company_name: '', ico: '', website: '', phone_number: '', contact_email: '', address: '',
      contact_first_name: '', contact_last_name: '', contact_position: '',
      categories: [], logo_url: null, gdpr_consent: false,
  });

  const loadInitialProfileData = useCallback(async (userId: string) => {
    const [profileRes, categoriesRes] = await Promise.all([
        supabase.from('StartupProfile').select('*').eq('user_id', userId).single(),
        supabase.from('StartupCategory').select('category_id').eq('startup_id', userId),
    ]);

    if (profileRes.data) {
        setFormDataCache(prev => ({
            ...prev,
            ...profileRes.data,
            categories: categoriesRes.data?.map(c => c.category_id) || [],
        }));
    }
  }, []);

  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        const { data, error } = await supabase.from('Category').select('id, name').order('name', { ascending: true });
        if (error) throw error;
        setAllCategories(data || []);
      } catch (error) {
        console.error("Chyba při načítání kategorií:", error);
      } finally {
        setInitialDataLoading(false);
      }
    };
    fetchStaticData();
  }, []);

  const handleUserSignedIn = useCallback(async (session: Session) => {
    const userId = session.user.id;
    const userEmail = session.user.email;

    const { data: existingUser, error: existingUserError } = await supabase
        .from('User')
        .select('id, role')
        .eq('id', userId)
        .single();

    if (existingUserError && existingUserError.code !== 'PGRST116') {
        console.error("Chyba při ověřování existence uživatele:", existingUserError);
        setError("Došlo k chybě při zpracování vašeho účtu.");
        return;
    }

    if (existingUser) {
        if (existingUser.role !== 'startup') {
            setError(`Účet s e-mailem ${userEmail} je již registrován s jinou rolí.`);
            await supabase.auth.signOut();
            return;
        }

        const { data: profile } = await supabase
            .from('StartupProfile')
            .select('registration_step')
            .eq('user_id', userId)
            .single();
        
        const currentStep = profile?.registration_step || 1;
        if(currentStep > 5) {
            router.push('/challenges'); 
        } else {
            setStep(currentStep);
        }
        await loadInitialProfileData(userId); 

    } else {
        const { data: newUser, error: userError } = await supabase.from('User').insert({
            id: userId,
            email: userEmail,
            role: 'startup'
        }).select().single();

        if (userError || !newUser) {
            console.error("Chyba při vytváření záznamu v tabulce User:", userError);
            setError(`Nepodařilo se vytvořit uživatelský účet: ${userError?.message || 'Neznámá chyba'}`);
            return;
        }
        
        const { error: profileError } = await supabase.from('StartupProfile').insert({
            user_id: userId,
            contact_email: userEmail,
            registration_step: 2
        });

        if (profileError) {
            console.error("Chyba při vytváření startup profilu:", profileError);
            setError(`Nepodařilo se vytvořit profil: ${profileError.message}`);
            await supabase.from('User').delete().eq('id', userId);
            return;
        }
        setStep(2);

        setFormDataCache(prev => ({
        ...prev,
        contact_email: userEmail ?? ''
        }));    }
  }, [router, loadInitialProfileData]);


  useEffect(() => {
    if (IS_DEVELOPMENT_MODE) {
        setLoading(false);
        return;
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user ?? null);
        setSession(session);
        handleUserSignedIn(session);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (_event === 'SIGNED_IN' && session) {
        setUser(session.user ?? null);
        setSession(session);
        await handleUserSignedIn(session);
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setStep(1);
      }
    });

    return () => subscription.unsubscribe();
  }, [handleUserSignedIn]);

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: existingUser, error: checkError } = await supabase
      .from('User')
      .select('email')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
        setError("Došlo k chybě při ověřování e-mailu.");
        setLoading(false);
        return;
    }
      
    if (existingUser) {
      setError("Uživatel s tímto e-mailem již existuje.");
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${window.location.origin}/register/startup`
        }
    });

    if (signUpError) {
        setError("Registrace se nezdařila. Zkuste to prosím znovu.");
    } else {
        setIsModalOpen(true);
    }
    setLoading(false);
  };
  
  const handleNextStep = async (formData: FormDataStep) => {
    if (!user) return;
    setLoading(true);
    
    const newCache: StartupRegistrationData = { ...formDataCache, ...formData };
    setFormDataCache(newCache);
    
    let error;
    const nextStep = step + 1;

    if (step === 2) {
      const dataToSave = {
          company_name: newCache.company_name, ico: newCache.ico, website: newCache.website, 
          phone_number: newCache.phone_number, contact_email: newCache.contact_email, address: newCache.address,
      };
      ({ error } = await supabase.from('StartupProfile').update(dataToSave).eq('user_id', user.id));
    } else if (step === 3) {
      const dataToSave = {
          contact_first_name: newCache.contact_first_name, contact_last_name: newCache.contact_last_name, 
          contact_position: newCache.contact_position,
      };
      ({ error } = await supabase.from('StartupProfile').update(dataToSave).eq('user_id', user.id));
    } else if (step === 4) { 
        await supabase.from('StartupCategory').delete().eq('startup_id', user.id);
        const toInsert = newCache.categories.map((catId: string) => ({ startup_id: user.id, category_id: catId }));
        if (toInsert.length > 0) ({ error } = await supabase.from('StartupCategory').insert(toInsert));
    } else if (step === 5) { 
        const dataToSave = { logo_url: newCache.logo_url };
        ({ error } = await supabase.from('StartupProfile').update(dataToSave).eq('user_id', user.id));
    }

    if (error) {
      alert('Něco se pokazilo: ' + error.message);
      setLoading(false);
      return;
    }

    const { error: stepError } = await supabase.from('StartupProfile').update({ registration_step: nextStep }).eq('user_id', user.id);

    if (stepError) {
        alert('Chyba při ukládání postupu: ' + stepError.message);
    } else if (nextStep > 5) {
        router.push('/challenges'); 
    } else {
        setStep(nextStep);
    }

    setLoading(false);
  };

  const renderStep = () => {
    
    if (!user) return <p>Chyba: Uživatel nebyl nalezen.</p>;
    switch (step) {
      case 2: return <Step1_CompanyInfo onNext={handleNextStep} initialData={formDataCache} />;
      case 3: return <Step2_ContactPerson onNext={handleNextStep} initialData={formDataCache} />;
      case 4: return <Step3_Categories onNext={handleNextStep} allCategories={allCategories} isLoading={initialDataLoading} initialSelectedIds={formDataCache.categories} />;
      case 5: return <Step4_LogoUpload onNext={handleNextStep} userId={user.id} />;
      default: return null;
    }
  };


  if (loading && !IS_DEVELOPMENT_MODE) return <LoadingSpinner/>;

  return (
    <div className="w-full min-h-screen flex py-5 md:py-12 items-start justify-center bg-[var(--barva-svetle-pozadi)] p-4">
      {IS_DEVELOPMENT_MODE || session ? (
        <div className="w-full">
          {renderStep()}
          
          {step >= 2 && step <= 5 && (
            <StepNavigation 
                currentStep={step} 
                setStep={setStep} 
                isLoading={loading}
            />
          )}
        </div>
      ) : (
        <div className="w-full max-w-4xl grid lg:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden">
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
                  Přihlašte se
                </Link>
              </p>
            </div>
          </div>

          <div className="hidden lg:block bg-[var(--barva-primarni)]">
              <Image 
                  src="/login2.png" 
                  alt="Inovace a byznys"
                  width={1200}
                  height={1500}
                  className="w-full h-full object-cover"
              />
          </div>
        </div>
      )}
      
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
            setIsModalOpen(false);
            setShowEmailRegister(false);
        }}
        title="E-mail odeslán"
        message="Potvrzovací e-mail byl odeslán na vaši adresu. Zkontrolujte si prosím schránku a dokončete registraci."
      />

    </div>
  );
}