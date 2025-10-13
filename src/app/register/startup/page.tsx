"use client";

import { useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../../lib/supabaseClient';
import { Provider, Session, User } from '@supabase/supabase-js';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';

import Step1_CompanyInfo from './steps/Step1_CompanyInfo';
import Step2_ContactPerson from './steps/Step2_ContactPerson';
import Step3_Categories from './steps/Step3_Categories';
import Step4_LogoUpload from './steps/Step4_LogoUpload';
import ConfirmationModal from '../../../components/ConfirmationModal';

type Category = { id: string; name: string; };

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
  logo_url?: string | null;
};

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
  const { user, profile, loading: authLoading, refetchProfile } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailRegister, setShowEmailRegister] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [initialDataLoading, setInitialDataLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      setInitialDataLoading(true);
      try {
        const { data, error } = await supabase.from('Category').select('id, name').order('name', { ascending: true });
        if (error) throw error;
        setAllCategories(data || []);
      } catch (err) {
        console.error("Chyba při načítání kategorií:", err);
      } finally {
        setInitialDataLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleSocialSignIn = useCallback(async (sessionUser: User) => {
    const provider = sessionUser.app_metadata.provider;
    if (provider && provider !== 'email') {
        const { data: existingUser } = await supabase.from('User').select('id').eq('id', sessionUser.id).single();
        if (!existingUser) {
            const { error: userError } = await supabase.from('User').insert({ id: sessionUser.id, email: sessionUser.email, role: 'startup' });
            if (userError) { setError(`Chyba při vytváření záznamu User: ${userError.message}`); return; }
            const { error: profileError } = await supabase.from('StartupProfile').insert({ user_id: sessionUser.id, contact_email: sessionUser.email, registration_step: 2 });
            if (profileError) { setError(`Chyba při vytváření záznamu StartupProfile: ${profileError.message}`); return; }
            await refetchProfile();
        }
    }
  }, [refetchProfile]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
            await handleSocialSignIn(session.user);
        }
    });
    return () => subscription.unsubscribe();
  }, [handleSocialSignIn]);


  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
        data: { role: 'startup' },
        emailRedirectTo: `${window.location.origin}/register/startup`
    }
});
    if (signUpError) {
        setError(signUpError.message.includes("User already registered") ? "Uživatel s tímto e-mailem již existuje." : "Registrace se nezdařila.");
    } else {
      setIsModalOpen(true);
    }
    setIsSubmitting(false);
  };
  
  const handleNextStep = async (formData: Partial<FormData>) => {
    if (!user || !profile) return;
    setIsSubmitting(true);
    const nextStep = (profile.registration_step || 1) + 1;
    let updateError;
    switch(profile.registration_step) {
        case 2: case 3:
            ({ error: updateError } = await supabase.from('StartupProfile').update(formData).eq('user_id', user.id)); break;
        case 4:
            if (formData.categories) {
                await supabase.from('StartupCategory').delete().eq('startup_id', user.id);
                const toInsert = formData.categories.map(catId => ({ startup_id: user.id, category_id: catId }));
                if (toInsert.length > 0) ({ error: updateError } = await supabase.from('StartupCategory').insert(toInsert));
            } break;
        case 5:
             if (formData.logo_url !== undefined) ({ error: updateError } = await supabase.from('StartupProfile').update({ logo_url: formData.logo_url }).eq('user_id', user.id)); break;
    }
    if (updateError) { alert('Něco se pokazilo: ' + updateError.message); setIsSubmitting(false); return; }
    const { error: stepError } = await supabase.from('StartupProfile').update({ registration_step: nextStep }).eq('user_id', user.id);
    if (stepError) { alert('Chyba při ukládání postupu: ' + stepError.message); } 
    else if (nextStep >= 6) { router.push('/dashboard'); }
    refetchProfile();
    setIsSubmitting(false);
  };

  const renderStep = () => {
    if (!user || !profile) return <div className="py-20"><LoadingSpinner /></div>;
    switch (profile.registration_step) {
      case 2: return <Step1_CompanyInfo onNext={handleNextStep} />;
      case 3: return <Step2_ContactPerson onNext={handleNextStep} />;
      case 4: return <Step3_Categories onNext={handleNextStep} allCategories={allCategories} isLoading={initialDataLoading} />;
      case 5: return <Step4_LogoUpload onNext={handleNextStep} userId={user.id} />;
      default:
        if (profile.registration_step && profile.registration_step >= 6) { router.push('/dashboard'); }
        return <p>Načítání kroku registrace...</p>;
    }
  };

  if (authLoading) return <div className="py-20"><LoadingSpinner /></div>;

  return (
    <div className="w-full min-h-screen flex py-5 md:py-32 items-start justify-center bg-[var(--barva-svetle-pozadi)] p-4">
      {user && profile ? (
        <div className="w-full">
          {renderStep()}
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
                          <button type="submit" disabled={isSubmitting} className="mt-3 px-6 py-2 rounded-full bg-[var(--barva-primarni)] text-white font-semibold cursor-pointer">
                              {isSubmitting ? 'Registruji...' : 'Vytvořit účet'}
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
        onConfirm={() => { setIsModalOpen(false); setShowEmailRegister(false); }}
        title="E-mail odeslán"
        message="Potvrzovací e-mail byl odeslán na vaši adresu. Zkontrolujte si prosím schránku a dokončete registraci."
      />
    </div>
  );
}