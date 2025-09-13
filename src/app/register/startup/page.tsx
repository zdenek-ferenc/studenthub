"use client";

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../../lib/supabaseClient';
import { Session, User, Provider } from '@supabase/supabase-js';

// Importujeme komponenty pro kroky startupu
import Step1_CompanyInfo from './steps/Step1_CompanyInfo';
import Step2_ContactPerson from './steps/Step2_ContactPerson';
import Step3_Categories from './steps/Step3_Categories';
import Step4_LogoUpload from './steps/Step4_LogoUpload';
import ConfirmationModal from '../../../components/ConfirmationModal'; // Import modálního okna

// --- VÝVOJÁŘSKÝ PŘEPÍNAČ ---
const IS_DEVELOPMENT_MODE = false; 
const DEV_START_STEP = 2; 

// Typ pro všechna možná data z formulářů startupu
type FormData = {
  company_name?: string;
  ico?: string;
  website?: string;
  phone_number?: string;
  contact_email?: string;
  address?: string;
  contact_first_name?: string;
  contact_last_name?: string;
  contact_position?: string;
  categories?: string[];
  logo_url?: string;
};

// Komponenta pro tlačítko se sociální sítí
const SocialButton = ({ provider, label, icon }: { provider: Provider, label: string, icon: ReactNode }) => {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/register/startup`,
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
  const [isModalOpen, setIsModalOpen] = useState(false); // Nový stav pro modální okno

  useEffect(() => {
    if (IS_DEVELOPMENT_MODE) {
        setLoading(false);
        return;
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (_event === 'SIGNED_IN' && session) {
        const { error } = await supabase.rpc('create_user_and_startup_profile');
        if (error) {
          console.error("Chyba při volání RPC funkce pro startup:", error);
        } else {
          setStep(2);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
        setIsModalOpen(true); // Otevře modální okno namísto alertu
    }
    setLoading(false);
  };

  const handleNextStep = async (formData: FormData) => {
    if (IS_DEVELOPMENT_MODE) {
      console.log("DEV_MODE: Data z kroku:", formData);
      if (step === 5) {
        alert("DEV_MODE: Registrace startupu dokončena!");
        router.push('/dashboard/startup');
      } else {
        setStep(prev => prev + 1);
      }
      return;
    }

    if (!user) return;
    setLoading(true);
    let error;

    if (step === 2 || step === 3) {
      ({ error } = await supabase.from('StartupProfile').update(formData).eq('user_id', user.id));
    }
    if (step === 4) {
      if (formData.categories) {
        await supabase.from('StartupCategory').delete().eq('startup_id', user.id);
        const toInsert = formData.categories.map((catId: string) => ({ startup_id: user.id, category_id: catId }));
        if (toInsert.length > 0) ({ error } = await supabase.from('StartupCategory').insert(toInsert));
      }
    }
    if (step === 5) {
      if (typeof formData.logo_url !== 'undefined') {
        ({ error } = await supabase.from('StartupProfile').update({ logo_url: formData.logo_url }).eq('user_id', user.id));
      }
      router.push('/dashboard/startup');
      return;
    }

    if (error) {
      alert('Něco se pokazilo: ' + error.message);
    } else {
      setStep(prev => prev + 1);
    }
    setLoading(false);
  };

  const renderStep = () => {
    if (!user) return <p>Chyba: Uživatel nebyl nalezen.</p>;
    
    switch (step) {
      case 2: return <Step1_CompanyInfo onNext={handleNextStep} />;
      case 3: return <Step2_ContactPerson onNext={handleNextStep} />;
      case 4: return <Step3_Categories onNext={handleNextStep} />;
      case 5: return <Step4_LogoUpload onNext={handleNextStep} userId={user.id} />;
      default: return null;
    }
  };

  const handleDevPrev = () => setStep(prev => Math.max(2, prev - 1));
  const handleDevNext = () => setStep(prev => Math.min(5, prev + 1));

  if (loading && !IS_DEVELOPMENT_MODE) return <p>Načítání...</p>;

  return (
    <div className="w-full min-h-screen my-8 flex items-start justify-center bg-[var(--barva-svetle-pozadi)] p-4">
      {IS_DEVELOPMENT_MODE || session ? (
        <div className="w-full">
          {renderStep()}
          {IS_DEVELOPMENT_MODE && (
            <div className="flex justify-center gap-24 my-12">
              <button onClick={handleDevPrev} className="bg-[var(--barva-primarni)] text-white w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                🢀
              </button>
              <button onClick={handleDevNext} className="bg-[var(--barva-primarni)] text-white w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                🢂
              </button>
            </div>
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
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
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
      
      {/* Nové modální okno pro potvrzení e-mailu */}
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