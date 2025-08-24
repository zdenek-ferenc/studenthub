"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Session, User } from '@supabase/supabase-js';

import Step1_PersonalInfo from './steps/Step1_PersonalInfo';
import Step2_EducationInfo from './steps/Step2_EducationInfo';
import Step3_Skills from './steps/Step3_Skills';
import Step4_Languages from './steps/Step4_Languages';

// --- VÝVOJÁŘSKÝ PŘEPÍNAČ ---
const IS_DEVELOPMENT_MODE = true; 
const DEV_START_STEP = 2; 

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

export default function StudentRegistrationPage() {
  // OPRAVA 1: Překlep 'a' byl změněn na 'useState'
  const [session, setSession] = useState<Session | null>(IS_DEVELOPMENT_MODE ? ({} as Session) : null);
  const [user, setUser] = useState<User | null>(IS_DEVELOPMENT_MODE ? ({} as User) : null);
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
        await createPublicUserAndProfile(session.user);
        setStep(2);
      }
    });

    return () => subscription.unsubscribe();
  // OPRAVA 2: Přidali jsme závislost, kterou React vyžadoval.
  // Funkce 'setSession' je stabilní, takže to nezpůsobí zacyklení.
  }, [IS_DEVELOPMENT_MODE]);

  const createPublicUserAndProfile = async (user: User) => {
    const { error: userError } = await supabase
      .from('User')
      .insert({ 
        id: user.id, 
        email: user.email, 
        role: 'student'
      });

    if (userError && userError.code !== '23505') {
      console.error('Chyba při vytváření veřejného uživatele:', userError);
      return;
    }

    const { data: profileData } = await supabase.from('StudentProfile').select('user_id').eq('user_id', user.id).single();
    if (!profileData) {
      const { error: profileError } = await supabase.from('StudentProfile').insert({ user_id: user.id });
      if (profileError) console.error('Chyba při vytváření profilu:', profileError);
    }
  };

  const handleNextStep = async (formData: FormData) => {
    if (IS_DEVELOPMENT_MODE) {
      console.log("DEV_MODE: Data z kroku:", formData);
      if (step === 5) {
        alert("DEV_MODE: Registrace dokončena!");
        setStep(DEV_START_STEP);
      } else {
        setStep(prev => prev + 1);
      }
      return;
    }

    if (!user) return;
    setLoading(true);
    let error;

    if (step === 2) { ({ error } = await supabase.from('StudentProfile').update(formData).eq('user_id', user.id)); }
    if (step === 3) { ({ error } = await supabase.from('StudentProfile').update(formData).eq('user_id', user.id)); }
    if (step === 4) {
      if (formData.skills) {
        await supabase.from('StudentSkill').delete().eq('student_id', user.id);
        const skillsToInsert = formData.skills.map((skillId: string) => ({ student_id: user.id, skill_id: skillId }));
        if (skillsToInsert.length > 0) ({ error } = await supabase.from('StudentSkill').insert(skillsToInsert));
      }
    }
    if (step === 5) {
      if (formData.languages) {
        await supabase.from('StudentLanguage').delete().eq('student_id', user.id);
        const languagesToInsert = formData.languages.map((langId: string) => ({ student_id: user.id, language_id: langId }));
        if (languagesToInsert.length > 0) ({ error } = await supabase.from('StudentLanguage').insert(languagesToInsert));
      }
      router.push('/dashboard/student');
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
    switch (step) {
      case 2: return <Step1_PersonalInfo onNext={handleNextStep} />;
      case 3: return <Step2_EducationInfo onNext={handleNextStep} />;
      case 4: return <Step3_Skills onNext={handleNextStep} />;
      case 5: return <Step4_Languages onNext={handleNextStep} />;
      default: return null;
    }
  };

  if (loading) return <p>Načítání...</p>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto">
        {IS_DEVELOPMENT_MODE || session ? (
          renderStep()
        ) : (
          <div>
            <h2 className="text-3xl font-bold mb-4">Vytvoř si studentský účet</h2>
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
              Už máš účet?{' '}
              <Link href="/login" className="font-semibold text-[var(--barva-primarni)] hover:underline">
                Přihlas se zde
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
