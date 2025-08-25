"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Session, User } from '@supabase/supabase-js';

// Importujeme komponenty pro kroky startupu
import Step1_CompanyInfo from './steps/Step1_CompanyInfo';
import Step2_ContactPerson from './steps/Step2_ContactPerson';
import Step3_Categories from './steps/Step3_Categories';
import Step4_LogoUpload from './steps/Step4_LogoUpload';

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

export default function StartupRegistrationPage() {
  const [session, setSession] = useState<Session | null>(IS_DEVELOPMENT_MODE ? ({} as Session) : null);
  // V dev módu si vytvoříme falešného usera, abychom mohli testovat nahrávání loga
  const [user, setUser] = useState<User | null>(IS_DEVELOPMENT_MODE ? ({id: 'dev-user-startup'} as User) : null);
  const [step, setStep] = useState(IS_DEVELOPMENT_MODE ? DEV_START_STEP : 1);
  const [loading, setLoading] = useState(!IS_DEVELOPMENT_MODE);
  const router = useRouter();

  useEffect(() => {
    if (IS_DEVELOPMENT_MODE) {
        setLoading(false);
        return;
    };

    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        setUser(session.user);
        setStep(2);
      }
      setLoading(false);
    };

    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (_event === 'SIGNED_IN' && session) {
        // ZMĚNA: Voláme RPC funkci pro vytvoření startup profilu
        const { error } = await supabase.rpc('create_user_and_startup_profile');
        if (error) {
          console.error("Chyba při volání RPC funkce pro startup:", error);
        } else {
          setStep(2);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNextStep = async (formData: FormData) => {
    if (IS_DEVELOPMENT_MODE) {
      console.log("DEV_MODE: Data z kroku:", formData);
      if (step === 5) {
        alert("DEV_MODE: Registrace startupu dokončena!");
        router.push('/dashboard/startup'); // Přesměrování na startup dashboard
      } else {
        setStep(prev => prev + 1);
      }
      return;
    }

    if (!user) return;
    setLoading(true);
    let error;

    // ZMĚNA: Logika pro ukládání dat do startup tabulek
    if (step === 2 || step === 3) { // Krok 1 a 2 ukládají do StartupProfile
      ({ error } = await supabase.from('StartupProfile').update(formData).eq('user_id', user.id));
    }
    if (step === 4) { // Krok 3 ukládá kategorie
      if (formData.categories) {
        await supabase.from('StartupCategory').delete().eq('startup_id', user.id);
        const toInsert = formData.categories.map((catId: string) => ({ startup_id: user.id, category_id: catId }));
        if (toInsert.length > 0) ({ error } = await supabase.from('StartupCategory').insert(toInsert));
      }
    }
    if (step === 5) { // Krok 4 ukládá URL loga
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

  // --- NOVÉ FUNKCE PRO DEV NAVIGACI ---
  const handleDevPrev = () => setStep(prev => Math.max(2, prev - 1));
  const handleDevNext = () => setStep(prev => Math.min(5, prev + 1));

  if (loading) return <p>Načítání...</p>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto relative"> {/* Přidali jsme relative pro pozicování šipek */}
        {IS_DEVELOPMENT_MODE || session ? (
          <div>
            {renderStep()}
            
            {/* --- NOVÁ DEV NAVIGACE --- */}
            {IS_DEVELOPMENT_MODE && (
              <div className="flex justify-center gap-24 my-12">
                <button onClick={handleDevPrev} className="bg-[var(--barva-primarni)] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
                  🢀
                </button>
                <button onClick={handleDevNext} className="bg-[var(--barva-primarni)] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
                  🢂
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Vytvořte si firemní účet</h2>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={['google', 'apple', 'facebook']}
              view="sign_up"
              showLinks={false}
              theme="light"
              redirectTo={typeof window !== 'undefined' ? window.location.href : ''}
            />
            <p className="text-center text-sm text-gray-600 mt-4">
              Už máte účet?{' '}
              <Link href="/login" className="font-semibold text-[var(--barva-primarni)] hover:underline">
                Přihlaste se
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
