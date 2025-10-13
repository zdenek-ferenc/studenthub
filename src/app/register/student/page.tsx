"use client";

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../../lib/supabaseClient';
import { Provider } from '@supabase/supabase-js';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';

import Step1_PersonalInfo from './steps/Step1_PersonalInfo';
import Step2_EducationInfo from './steps/Step2_EducationInfo';
import Step3_Skills from './steps/Step3_Skills';
import Step4_Languages from './steps/Step4_Languages';
import ConfirmationModal from '../../../components/ConfirmationModal';

type Skill = { id: string; name: string; };
type Language = { id: string; name: string; };

type FormData = {
  first_name?: string;
  last_name?: string;
  username?: string;
  phone_number?: string;
  date_of_birth?: string;
  university?: string;
  field_of_study?: string;
  specialization?: string;
  year_of_study?: number;
  skills?: string[];
  languages?: string[];
};

const SocialButton = ({ provider, label, icon }: { provider: Provider, label: string, icon: ReactNode }) => {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
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

export default function StudentRegistrationPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailRegister, setShowEmailRegister] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [allLanguages, setAllLanguages] = useState<Language[]>([]);
  const [initialDataLoading, setInitialDataLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (allSkills.length === 0 || allLanguages.length === 0) {
        setInitialDataLoading(true);
        try {
          const [skillsRes, languagesRes] = await Promise.all([
            supabase.from('Skill').select('id, name').order('name', { ascending: true }),
            supabase.from('Language').select('id, name').order('name', { ascending: true })
          ]);
          if (skillsRes.error) throw skillsRes.error;
          if (languagesRes.error) throw languagesRes.error;
          setAllSkills(skillsRes.data || []);
          setAllLanguages(languagesRes.data || []);
        } catch (error) {
          console.error("Chyba při přednačítání dat pro registraci:", error);
        } finally {
          setInitialDataLoading(false);
        }
      } else {
        setInitialDataLoading(false);
      }
    };
    fetchInitialData();
  }, [allSkills.length, allLanguages.length]);

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (signUpError) {
      if (signUpError.message.includes('User already registered')) {
        setError("Uživatel s tímto e-mailem již existuje. Zkuste se přihlásit.");
      } else {
        setError(signUpError.message);
      }
      setIsSubmitting(false);
      return;
    }
    
    setIsModalOpen(true); // Show confirmation modal
    setIsSubmitting(false);
  };
  
    const handleNextStep = async (formData: FormData) => {
        if (!user || !profile) return;
        setIsSubmitting(true);
        let error;
        const nextStep = (profile.registration_step || 1) + 1;
        const currentStep = profile.registration_step;

        // Determine which update to perform based on the current step
        if (currentStep === 2) { 
            ({ error } = await supabase.from('StudentProfile').update(formData).eq('user_id', user.id));
        } else if (currentStep === 3) {
            ({ error } = await supabase.from('StudentProfile').update(formData).eq('user_id', user.id)); 
        } else if (currentStep === 4 && formData.skills) {
          await supabase.from('StudentSkill').delete().eq('student_id', user.id);
          const skillsToInsert = formData.skills.map((skillId: string) => ({ student_id: user.id, skill_id: skillId, level: 1, xp: 0 }));
          if (skillsToInsert.length > 0) ({ error } = await supabase.from('StudentSkill').insert(skillsToInsert));
        } else if (currentStep === 5 && formData.languages) {
          await supabase.from('StudentLanguage').delete().eq('student_id', user.id);
          const languagesToInsert = formData.languages.map((langId: string) => ({ student_id: user.id, language_id: langId }));
          if (languagesToInsert.length > 0) ({ error } = await supabase.from('StudentLanguage').insert(languagesToInsert));
        }
        
        if (error) {
          alert('Něco se pokazilo: ' + error.message);
          setIsSubmitting(false);
          return;
        }

        // Update registration step
        const { error: stepError } = await supabase.from('StudentProfile').update({ registration_step: nextStep }).eq('user_id', user.id);

        if (stepError) {
            alert('Chyba při ukládání postupu: ' + stepError.message);
        } else if (nextStep > 5) {
            router.push('/');
        }
        // AuthContext will automatically update the profile and trigger re-render
        setIsSubmitting(false);
  };
  
  const renderStep = () => {
    if (!profile) return <LoadingSpinner />;
    
    switch (profile.registration_step) {
      case 2: return <Step1_PersonalInfo onNext={handleNextStep} />;
      case 3: return <Step2_EducationInfo onNext={handleNextStep} />;
      case 4: return <Step3_Skills onNext={handleNextStep} allSkills={allSkills} isLoading={initialDataLoading} />;
      case 5: return <Step4_Languages onNext={handleNextStep} allLanguages={allLanguages} isLoading={initialDataLoading} />;
      default:
        // If registration is complete, redirect away
        if (profile.registration_step && profile.registration_step >= 6) {
            router.push('/');
            return <LoadingSpinner />;
        }
        return <p>Načítání kroku registrace...</p>;
    }
  };
  
    if (authLoading) return <div className="py-20"><LoadingSpinner /></div>;
  
    return (
    <div className="w-full min-h-screen flex items-start justify-center bg-[var(--barva-svetle-pozadi)] px-4 py-10 md:py-32">
      {user && profile ? (
        <div className="w-full">
          {renderStep()}
        </div>
      ) : (
        <div className="w-full max-w-4xl grid lg:grid-cols-2 bg-white rounded-2xl shadow-lg overflow-hidden">
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
                      <button type="submit" disabled={isSubmitting} className="mt-3 px-6 py-2 rounded-full bg-[var(--barva-primarni)] text-white font-semibold cursor-pointer">
                        {isSubmitting ? 'Registruji...' : 'Vytvořit účet'}
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
            <Image
              src="/login.png"
              alt="Student a inovace"
              width={1600}
              height={2000}
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