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
    contact_first_name: string; contact_last_name: string; contact_position: string; registration_step?: number;
    categories: string[]; logo_url: string | null; gdpr_consent: boolean;
};

type FormDataStep = Partial<Omit<StartupRegistrationData, 'categories' | 'logo_url'>> & {
    categories?: string[]; logo_url?: string | null;
};

const initialStartupFormData: StartupRegistrationData = {
    company_name: '', ico: '', website: '', phone_number: '', contact_email: '', address: '',
    contact_first_name: '', contact_last_name: '', contact_position: '',
    categories: [], logo_url: null, gdpr_consent: false,
};


const RegistrationHeader = ({ currentStep, onBack, isLoading }: { currentStep: number, onBack: () => void, isLoading: boolean }) => {
    const stepIndex = Math.max(0, currentStep - 2);
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
    const [formDataCache, setFormDataCache] = useState<StartupRegistrationData>(initialStartupFormData);

    const [authInitialized, setAuthInitialized] = useState(IS_DEVELOPMENT_MODE);
    const [localProfileLoaded, setLocalProfileLoaded] = useState(IS_DEVELOPMENT_MODE);



    const loadInitialProfileData = useCallback(async (userId: string): Promise<number | null> => {
        setIsSaving(true);
        setError(null);
        console.log("loadInitialProfileData: Spuštěno...");
        try {
            const { data, error: selectError } = await supabase
                .from('StartupProfile')
                .select('*, StartupCategory(category_id)')
                .eq('user_id', userId)
                .single();

            if (selectError) {
                console.error("Chyba při načítání profilu (loadInitialProfileData):", selectError);
                if (selectError.message.includes("multiple (or no) rows returned") || selectError.code === 'PGRST116') {

                     if(selectError.code !== 'PGRST116') {
                        setError("Chyba databáze: Nalezeno více profilů pro jednoho uživatele.");
                     } else {
                        console.log("Profil startupu nenalezen (loadInitialProfileData) - kód PGRST116.");
                     }
                } else {
                    setError(`Nepodařilo se načíst data profilu: ${selectError.message}`);
                }

                return null;
            }

            if (data) {
                console.log("loadInitialProfileData: Profil nalezen, nastavuji formDataCache.");
                setFormDataCache(prev => ({
                    ...prev,
                    ...data,
                    categories: data.StartupCategory?.map((c: { category_id: string }) => c.category_id) || [],
                }));
                const currentDBStep = data.registration_step || 2;
                console.log(`loadInitialProfileData: Profil načten, DB krok je ${currentDBStep}.`);

                return currentDBStep;
            }


             console.log("Profil startupu nenalezen (loadInitialProfileData - konec).");
             return null;

        } catch (err: unknown) {
            console.error("Neočekávaná chyba v catch bloku loadInitialProfileData:", err);
            if (err instanceof Error) {
                setError(`Nepodařilo se načíst data profilu: ${err.message || 'Neznámá chyba'}`);
            } else {
                 setError(`Nepodařilo se načíst data profilu: Neznámá chyba`);
            }
            return null;
        } finally {
            setIsSaving(false);
             console.log("loadInitialProfileData: Dokončeno.");
        }

    }, [setError, step, isSaving]);


    const handleUserSignedIn = useCallback(async (session: Session) => {
        if (!session?.user) {
             setError("Nepodařilo se získat informace o uživateli.");
             if (loading) setLoading(false);
             return;
         }
        const userId = session.user.id;
        console.log(`handleUserSignedIn (startup) voláno pro userId: ${userId}`);


        if (isSaving) {
            console.log("handleUserSignedIn: Přeskakuji, protože isSaving je true.");
            return;
        }

        try {
             setIsSaving(true);

            const { data: existingUser, error: selectUserError } = await supabase
                .from('User')
                .select('id, role')
                .eq('id', userId)
                .maybeSingle();

            if (selectUserError) {
                console.error("Chyba RLS (406?) při kontrole User:", selectUserError);

            }

            if (existingUser && existingUser.role !== 'startup') {
                setError(`Účet je již registrován s rolí: ${existingUser.role}.`);
                await supabase.auth.signOut();
                setUser(null); setSession(null);
                setAuthInitialized(false); setLocalProfileLoaded(false);
                setLoading(false);
                setIsSaving(false);
                return;
            }


            let loadedDBStep: number | null = null;

            if (existingUser) {
                console.log(`Uživatel (startup) ${userId} nalezen v User tabulce.`);
                if (!localProfileLoaded) {
                     console.log("Profil startupu ještě nebyl načten, volám loadInitialProfileData...");
                     loadedDBStep = await loadInitialProfileData(userId);
                     if (loadedDBStep !== null) {
                         setLocalProfileLoaded(true);
                         console.log("Profil startupu úspěšně načten, localProfileLoaded=true");
                     } else {
                         console.log("Načítání profilu selhalo nebo profil nenalezen.");



                     }
                } else {
                     console.log("Profil startupu již byl načten (localProfileLoaded=true).");

                }
            } else {
                 console.log(`Uživatel (startup) ${userId} nenalezen (nebo RLS selhal), vytvářím nové záznamy...`);
                 const { error: userInsertError } = await supabase
                     .from('User')
                     .insert({ id: userId, email: session.user.email, role: 'startup' });
                 if (userInsertError && !userInsertError.message.includes('duplicate key')) { throw userInsertError; }

                 const { error: profileInsertError } = await supabase
                     .from('StartupProfile')
                     .insert({ user_id: userId, registration_step: 2, contact_email: session.user.email });
                 if (profileInsertError && !profileInsertError.message.includes('duplicate key') && !profileInsertError.message.includes('startup_profile_user_id_key')) { throw profileInsertError; }


                 loadedDBStep = 2;
                 setFormDataCache(prev => ({ ...prev, contact_email: session.user.email || '' }));
                 setLocalProfileLoaded(true);
                 console.log("Nový uživatel a profil startupu vytvořen, krok=2, localProfileLoaded=true");
            }


             const targetStep = loadedDBStep ?? step;


             if (step !== targetStep) {
                 console.log(`Nastavuji krok UI na ${targetStep}`);
                 setStep(targetStep);
             } else {
                  console.log(`Ponechávám krok UI na ${step}.`);
             }



             if (targetStep >= 6) {
                 console.log(`Registrace startupu dokončena (krok ${targetStep}), přesměrovávám na /challenges`);
                 if (typeof window !== 'undefined') {
                     sessionStorage.setItem('justFinishedRegistration', 'true');
                 }
                 router.push('/challenges');
             } else {
                 console.log(`Pokračuji v registraci startupu na kroku ${targetStep}`);
             }

        } catch (err: unknown) {
            console.error("Chyba v handleUserSignedIn (startup):", err);
            if (err instanceof Error) {
                 setError(`Nastala chyba při zpracování přihlášení: ${err.message}. Zkuste to prosím znovu.`);
            } else {
                setError(`Nastala chyba při zpracování přihlášení: Neznámá chyba. Zkuste to prosím znovu.`);
            }

        } finally {
             setIsSaving(false);
             if (loading) {
                 console.log("handleUserSignedIn (startup) dokončil hlavní loading.");
                 setLoading(false);
            }
        }


    }, [router, loadInitialProfileData, localProfileLoaded, loading, setError, isSaving, step]);

    type StartupCategoryInsert = {
    startup_id: string;
    category_id: string;
    };

    type RelatedTableInsertData = StartupCategoryInsert;

    const saveStepData = useCallback(async (currentStep: number, data: StartupRegistrationData) => {

    if (!user || isSaving) return;
     setIsSaving(true);
     console.log(`Ukládám (startup) krok ${currentStep} pro uživatele ${user.id}`);
     setError(null);

     try {
         let updateData: Partial<StartupRegistrationData> = {};
         let relatedTableData: {
             table: string;
             data: RelatedTableInsertData[]; 
             deleteCondition?: Record<string, any>;
         } | null = null;
         // ------------------------------

         switch (currentStep) {
             case 2:
                 updateData = { company_name: data.company_name, ico: data.ico, website: data.website, phone_number: data.phone_number, contact_email: data.contact_email, address: data.address, gdpr_consent: data.gdpr_consent };
                 break;
             case 3:
                 updateData = { contact_first_name: data.contact_first_name, contact_last_name: data.contact_last_name, contact_position: data.contact_position };
                 break;
             case 4:
                 relatedTableData = {
                     table: 'StartupCategory',
                     data: data.categories.map(id => ({ startup_id: user.id, category_id: id })), // <-- Data odpovídají StartupCategoryInsert
                     deleteCondition: { startup_id: user.id }
                 };
                 break;
             case 5:
                 updateData = { logo_url: data.logo_url };
                 break;
         }

         if (Object.keys(updateData).length > 0) {
             console.log("Aktualizuji StartupProfile s daty:", updateData);
             const { error: profileUpdateError } = await supabase
                 .from('StartupProfile')
                 .update(updateData)
                 .eq('user_id', user.id);
             if (profileUpdateError) {
                 console.error("Supabase profile update error object:", profileUpdateError);
                 throw new Error(`Chyba při aktualizaci profilu: ${profileUpdateError.message} (Kód: ${profileUpdateError.code})`);
             }
             console.log(`Startup profil úspěšně aktualizován pro krok ${currentStep}`);
         }

         if (relatedTableData) {
             if (relatedTableData.deleteCondition) {
                 const { error: deleteError } = await supabase.from(relatedTableData.table).delete().match(relatedTableData.deleteCondition);
                 if (deleteError && deleteError.code !== 'PGRST204') throw deleteError;
                 console.log(`Staré záznamy smazány (nebo neexistovaly) z ${relatedTableData.table}`);
             }
             if (relatedTableData.data.length > 0) {
                 const { error: insertError } = await supabase.from(relatedTableData.table).insert(relatedTableData.data);
                 if (insertError) throw insertError;
                  console.log(`Nové záznamy vloženy do ${relatedTableData.table}`);
             }
         }

         const nextStepInDB = Math.min(currentStep + 1, 6);
         const { error: stepUpdateError } = await supabase.from('StartupProfile').update({ registration_step: nextStepInDB }).eq('user_id', user.id);
         if (stepUpdateError) {
             console.error("Supabase step update error object:", stepUpdateError);
             throw new Error(`Chyba při aktualizaci kroku registrace: ${stepUpdateError.message} (Kód: ${stepUpdateError.code})`);
         }
          console.log(`Startup registration step aktualizován na ${nextStepInDB}`);

     } catch (error: unknown) {
          console.error("Detailní chyba při ukládání (startup) na pozadí:", error);
          if (error instanceof Error) {
              console.error("Chyba při ukládání (startup) na pozadí (message):", error.message);
              setError(`Uložení selhalo: ${error.message}`);
          } else {
              console.error("Neznámá chyba při ukládání (startup) na pozadí:", error);
              setError("Uložení selhalo z neznámého důvodu.");
          }

          throw error;

     } finally {
         setIsSaving(false);
         console.log(`Ukládání (startup) kroku ${currentStep} dokončeno.`);
     }

}, [user, isSaving, setError]);


    const handleNextStep = async (formData: FormDataStep) => {

        setError(null);
        const newCache = { ...formDataCache, ...formData };
        setFormDataCache(newCache);

        try {
            await saveStepData(step, newCache);
            const nextStep = step + 1;

            if (nextStep > 5) {
                console.log("Poslední krok startupu uložen, nastavuji flag a přesměrovávám...");
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('justFinishedRegistration', 'true');
                }
                router.push('/challenges');
            } else {
                setStep(nextStep);
            }

        } catch (error) {
            console.log("Ukládání selhalo, zůstávám na kroku:", step);

        }
    };



    useEffect(() => {

         const fetchStaticData = async () => {
             if (staticDataLoaded) return;
             try {
                 const { data } = await supabase.from('Category').select('id, name').order('name');
                 setAllCategories(data || []);
                 setStaticDataLoaded(true);
                 console.log("Statická data (kategorie) načtena.");
             } catch (err) {
                 console.error("Chyba při načítání kategorií:", err);
                 setError("Nepodařilo se načíst potřebná data pro formulář.");
             } finally {
                  if (loading && authInitialized) {
                     setLoading(false);
                  }
             }
         };
         if(!staticDataLoaded) {
              fetchStaticData();
         }
    }, [staticDataLoaded, loading, authInitialized]);


    useEffect(() => {
         console.log(`Auth useEffect (startup) spuštěn: authInit=${authInitialized}, loading=${loading}, user=${!!user}, profileLoaded=${localProfileLoaded}`);

        if (authInitialized || IS_DEVELOPMENT_MODE) {

             if (IS_DEVELOPMENT_MODE && !user) {
                  setUser({ id: 'dev-user-startup' } as User);
                  setSession({} as Session);
                  setStep(DEV_START_STEP);
                  setLoading(false);
                  setLocalProfileLoaded(true);
             }
            return;
        }

        let isSubscribed = true;
        let initialCheckDone = false;

        supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
            console.log("getSession (startup) výsledek:", !!currentSession);
            initialCheckDone = true;
            if (!isSubscribed || authInitialized) {
                 console.log("getSession: Přeskakuji zpracování (unsubscribed nebo už inicializováno).");
                 return;
            }


            setAuthInitialized(true);
            console.log("Auth inicializace nastavena na true v getSession.");

            if (currentSession) {
                const currentUserForGetSession = currentSession.user;
                console.log("Nalezena session (startup), nastavuji uživatele...");
                setUser(currentUserForGetSession);
                setSession(currentSession);



                if (!localProfileLoaded) {
                     console.log("getSession: Profil ještě nebyl načten (localProfileLoaded=false), volám handleUserSignedIn...");
                     await handleUserSignedIn(currentSession);
                } else {
                     console.log("getSession: Profil už byl načten (localProfileLoaded=true), přeskočeno volání handleUserSignedIn.");

                     const currentDBStep = formDataCache.registration_step || 2;
                     if (currentDBStep >= 6) {
                        console.log("getSession: Registrace vypadá dokončená, přesměrovávám.");
                        if (typeof window !== 'undefined') { sessionStorage.setItem('justFinishedRegistration', 'true');}
                        router.push('/challenges');
                     }
                }
            } else {
                console.log("Session (startup) nenalezena.");
                setLoading(false);
            }



        }).catch(err => {
             console.error("Chyba v getSession (startup):", err);
             if (isSubscribed) {
                 setError("Chyba při ověřování session.");
                 setLoading(false);
                 setAuthInitialized(true);
             }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            console.log("onAuthStateChange (startup) event:", _event, "Session:", !!newSession);
            if (!isSubscribed) return;

            const currentUser = newSession?.user ?? null;
            const previousUserId = user?.id;


             setSession(newSession);
             setUser(currentUser);


            if (currentUser?.id !== previousUserId) {
                console.log("onAuthStateChange: Uživatel se změnil, resetuji localProfileLoaded.");
                setLocalProfileLoaded(false);
                 setAuthInitialized(false);
                 setLoading(true);
                 return;
            }


            if (!initialCheckDone && !loading) {
                 console.log("onAuthStateChange dokončil loading (před getSession?).");
                 setLoading(false);

             }

            if (_event === 'SIGNED_IN' && newSession) {


                 if (!localProfileLoaded) {
                     console.log("onAuthStateChange: SIGNED_IN, profil nebyl načten, volám handleUserSignedIn...");
                     await handleUserSignedIn(newSession);
                 } else {
                     console.log("onAuthStateChange: SIGNED_IN, profil už byl načten, přeskočeno volání handleUserSignedIn.");
                 }
            } else if (_event === 'SIGNED_OUT') {
                console.log("Uživatel (startup) odhlášen, resetuji stav.");
                setStep(1);
                setFormDataCache(initialStartupFormData);
                setLocalProfileLoaded(false);
                setAuthInitialized(false);
                setLoading(false);
            }
        });

        return () => {
             console.log("Unsubscribing (startup) from auth changes.");
            isSubscribed = false;
            subscription?.unsubscribe();
        };

    }, [authInitialized, handleUserSignedIn, loadInitialProfileData, user, localProfileLoaded, loading, router, formDataCache.registration_step]);


    const handleEmailRegister = async (e: React.FormEvent) => {

         e.preventDefault();
         setError(null);
         setLoading(true);
         try {
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
                 setError(`Registrace se nezdařila: ${signUpError.message}`);
             } else {
                 setIsModalOpen(true);
             }
         } catch(err: unknown) {
              if (err instanceof Error) {
                  setError(`Nastala neočekávaná chyba: ${err.message}`);
              } else {
                   setError(`Nastala neočekávaná chyba.`);
              }
         } finally {
             setLoading(false);
         }
    };


    const renderStep = () => {

          if (!user && !IS_DEVELOPMENT_MODE) {
              if (step === 1) return null;

              if(loading || step !== 1) return <div className="py-10"><LoadingSpinner/></div>;
              return null;
          }
          if (!staticDataLoaded && step === 4) {
               return <div className="py-10"><LoadingSpinner /></div>;
          }
          if (!user && IS_DEVELOPMENT_MODE && step > 1) {
               return <div className="py-10"><LoadingSpinner /></div>;
          }
          if (!user && !IS_DEVELOPMENT_MODE && step > 1) {

              return <div className="py-10"><LoadingSpinner/></div>;
          }
          const currentUserId = user ? user.id : 'dev-user-startup';

         switch (step) {
             case 2: return <Step1_CompanyInfo onNext={handleNextStep} initialData={formDataCache} />;
             case 3: return <Step2_ContactPerson onNext={handleNextStep} initialData={formDataCache} />;
             case 4: return <Step3_Categories onNext={handleNextStep} allCategories={allCategories} isLoading={!staticDataLoaded} initialSelectedIds={formDataCache.categories} />;
             case 5: return <Step4_LogoUpload onNext={handleNextStep} userId={currentUserId} />;
             default: return null;
         }
    };



    if (loading && !authInitialized) {
        return <div className="w-full min-h-screen flex items-center justify-center bg-[var(--barva-svetle-pozadi)]"><LoadingSpinner /></div>;
    }


    return (
        <div className="w-full min-h-screen flex items-start justify-center bg-[var(--barva-svetle-pozadi)] px-4">
            {session ? (
                <div className="w-full py-6 md:py-12">
                    {step >= 2 && step <= 5 && (
                        <RegistrationHeader
                            currentStep={step}
                            onBack={() => setStep(s => Math.max(2, s - 1))}
                            isLoading={isSaving || (loading && step > 1)} 
                        />
                    )}
                     {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-50 p-3 rounded-lg max-w-lg mx-auto">{error}</p>}
                    {renderStep()}
                </div>
            ) : (

                 <div className="w-full max-w-4xl grid lg:grid-cols-2 bg-white rounded-2xl shadow-md overflow-hidden my-6 md:my-32">
                     <div className="p-8 sm:p-12 flex flex-col justify-center">
                         <div>
                             <div className="text-center">
                                 <h1 className="text-3xl font-bold text-[var(--barva-tmava)]">Zaregistrujte svou firmu</h1>
                                 <p className="text-gray-500 mt-2 text-sm">Najděte ty nejlepší talenty pro vaše projekty.</p>
                             </div>
                             <div className="mt-8 space-y-4">
                                 {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</p>}
                                 {loading ? <LoadingSpinner /> : !showEmailRegister ? ( 
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