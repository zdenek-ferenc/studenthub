"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import { UseFormRegister, FieldValues, useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import AvatarUploader from './components/AvatarUploader';
import SkillSelectorEdit from './components/EditSkillSelector';
import LanguageSelectorEdit from './components/EditLanguageSelector';
import EditSocialLinks from './components/EditSocialLinks';
import LoadingSpinner from '../../../components/LoadingSpinner';

type StudentProfile = {
    first_name: string;
    last_name: string;
    username: string;
    university: string | null;
    field_of_study: string | null;
    bio: string | null;
    github_url: string | null;
    linkedin_url: string | null;
    dribbble_url: string | null;
    personal_website_url: string | null;
    profile_picture_url: string | null;
    recruitment_status: string | null;
    stripe_connect_id: string | null;
    charges_enabled: boolean | null;
};

type Tab = 'personal' | 'skills' | 'links' | 'payouts';

export default function StudentEditForm() {
    const { user, showToast, loading: authLoading, refetchProfile } = useAuth();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [hasFetched, setHasFetched] = useState(false);

    const initialTab = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState<Tab>(
        (initialTab === 'skills' || initialTab === 'links' || initialTab === 'payouts') ? initialTab : 'personal'
    );

    const { register, handleSubmit, reset, watch, setValue, formState: { isDirty, isSubmitting } } = useForm<StudentProfile>({
        defaultValues: {
            recruitment_status: null,
        }
    });

    const [originalSkills, setOriginalSkills] = useState<string[]>([]);
    const [originalLanguages, setOriginalLanguages] = useState<string[]>([]);

    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const currentProfilePictureUrl = watch('profile_picture_url');

    useEffect(() => {
        if (user && !hasFetched) {
            setLoading(true);
            Promise.all([
                supabase.from('StudentProfile').select('*').eq('user_id', user.id).single(),
                supabase.from('StudentSkill').select('skill_id').eq('student_id', user.id),
                supabase.from('StudentLanguage').select('language_id').eq('student_id', user.id),
            ]).then(([profileRes, skillsRes, languagesRes]) => {
                if (profileRes.data) {
                    const profileData = {
                        ...profileRes.data,
                        recruitment_status: profileRes.data.recruitment_status || null,
                    };
                    reset(profileData);
                }

                const skillIds = skillsRes.data?.map(s => s.skill_id) || [];
                setSelectedSkills(skillIds);
                setOriginalSkills(skillIds);
                const langIds = languagesRes.data?.map(l => l.language_id) || [];
                setSelectedLanguages(langIds);
                setOriginalLanguages(langIds);
                setHasFetched(true);
                setLoading(false);
            });
        }
    }, [user, hasFetched, reset]);

    const handleProfileSubmit = async (data: Partial<StudentProfile>) => {
        if (!user) return;

        const { recruitment_status, stripe_connect_id, charges_enabled, ...profileData } = data;

        const sanitizedData = Object.fromEntries(
            Object.entries(profileData).map(([key, value]) => [key, value === '' ? null : value])
        );

        const dataToUpdate = {
            ...sanitizedData,
            recruitment_status: recruitment_status || null,
        };

        const { error } = await supabase.from('StudentProfile').update(dataToUpdate).eq('user_id', user.id);

        if (error) {
            showToast(`Chyba: ${error.message}`, 'error');
        } else {
            if (isDirty) {
                showToast('Osobní údaje a odkazy byly úspěšně uloženy!', 'success');
            }
            refetchProfile();
            reset({}, { keepValues: true });
        }
    };

    const handleSkillsSubmit = async () => {
        if (!user) return;
        const originalSet = new Set(originalSkills);
        const newSet = new Set(selectedSkills);
        const skillsToAdd = selectedSkills.filter((id: string) => !originalSet.has(id));
        const skillsToRemove = originalSkills.filter((id: string) => !newSet.has(id));
        try {
            if (skillsToRemove.length > 0) {
                const { error } = await supabase.from('StudentSkill').delete().eq('student_id', user.id).in('skill_id', skillsToRemove);
                if (error) throw error;
            }
            if (skillsToAdd.length > 0) {
                const toInsert = skillsToAdd.map(skillId => ({ student_id: user.id, skill_id: skillId, level: 1, xp: 0 }));
                const { error } = await supabase.from('StudentSkill').insert(toInsert);
                if (error) throw error;
            }
            showToast('Dovednosti byly úspěšně uloženy!', 'success');
            setOriginalSkills(selectedSkills);
            refetchProfile();
        } catch (error: unknown) {
            showToast(`Chyba při ukládání dovedností: ${(error as Error).message}`, 'error');
        }
    };
    const handleLanguagesSubmit = async () => {
        if (!user) return;
        const originalSet = new Set(originalLanguages);
        const newSet = new Set(selectedLanguages);
        const languagesToAdd = selectedLanguages.filter((id: string) => !originalSet.has(id));
        const languagesToRemove = originalLanguages.filter((id: string) => !newSet.has(id));
        try {
            if (languagesToRemove.length > 0) {
                const { error } = await supabase.from('StudentLanguage').delete().eq('student_id', user.id).in('language_id', languagesToRemove);
                if (error) throw error;
            }
            if (languagesToAdd.length > 0) {
                const toInsert = languagesToAdd.map(langId => ({ student_id: user.id, language_id: langId }));
                const { error } = await supabase.from('StudentLanguage').insert(toInsert);
                if (error) throw error;
            }
            showToast('Jazyky byly úspěšně uloženy!', 'success');
            setOriginalLanguages(selectedLanguages);
            refetchProfile();
        } catch (error: unknown) {
            showToast(`Chyba při ukládání jazyků: ${(error as Error).message}`, 'error');
        }
    };

    const handleStripeConnect = async () => {
        try {
            const response = await fetch('/api/stripe/onboarding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.status === 401) {
                showToast('Vaše přihlášení vypršelo. Prosím, přihlaste se znovu.', 'error');
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Server response:', errorData);
                throw new Error(errorData.message || 'Failed to initiate Stripe onboarding');
            }

            const { url } = await response.json();
            if (url) {
                window.location.href = url;
            }
        } catch (error) {
            console.error('Stripe Connect Error:', error);
            showToast('Chyba při propojování se Stripe.', 'error');
        }
    };


    if (loading || authLoading) {
        return <LoadingSpinner />;
    }

    const TabButton = ({ tab, label }: { tab: Tab, label: string }) => (
        <button
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer w-full text-sm sm:text-base text-left px-4 py-2 text-[var(--barva-primarni)] rounded-lg transition-colors ${activeTab === tab ? 'bg-[var(--barva-primarni)] text-white' : 'hover:bg-white'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="grid md:grid-cols-4 gap-2 sm:gap-8">
            <aside className="md:col-span-1">
                <nav className="space-y-2">
                    <TabButton tab="personal" label="Osobní údaje" />
                    <TabButton tab="skills" label="Dovednosti a Jazyky" />
                    <TabButton tab="links" label="Odkazy" />
                    <TabButton tab="payouts" label="Výplaty" />
                </nav>
            </aside>
            <main className="md:col-span-3">
                <form onSubmit={handleSubmit(handleProfileSubmit)} className="space-y-4 sm:space-y-8 bg-white p-4 sm:p-8 rounded-xl shadow-xs">
                    {activeTab === 'personal' && (
                        <>
                            <h2 className="text-xl sm:text-2xl text-[var(--barva-primarni)] font-semibold mb-4">Osobní údaje</h2>
                            {user && (
                                <div className="flex justify-center pb-6 border-b border-gray-100 mb-4 sm:mb-6">
                                    <AvatarUploader
                                        userId={user.id}
                                        currentAvatarUrl={currentProfilePictureUrl || null}
                                        onUploadSuccess={(newUrl) => {
                                            setValue('profile_picture_url', newUrl, { shouldDirty: true });
                                            refetchProfile();
                                        }}
                                        onDeleteSuccess={() => {
                                            setValue('profile_picture_url', null, { shouldDirty: true });
                                            refetchProfile();
                                        }}
                                    />
                                </div>
                            )}
                            <div>
                                <label htmlFor="first_name" className="block mb-1 text-sm sm:text-base font-semibold text-[var(--barva-tmava)]">Jméno</label>
                                <input id="first_name" {...register('first_name')} className="input !font-normal" />
                            </div>
                            <div>
                                <label htmlFor="last_name" className="block mb-1 text-sm sm:text-base font-semibold text-[var(--barva-tmava)]">Příjmení</label>
                                <input id="last_name" {...register('last_name')} className="input !font-normal" />
                            </div>
                            <div>
                                <label htmlFor="username" className="block mb-1 text-sm sm:text-base font-semibold text-[var(--barva-tmava)]">Uživatelské jméno</label>
                                <input id="username" {...register('username')} className="input !font-normal" />
                            </div>
                            <div>
                                <label htmlFor="bio" className="block mb-1 text-sm sm:text-base font-semibold text-[var(--barva-tmava)]">Bio (krátký popisek)</label>
                                <textarea id="bio" {...register('bio')} className="input !font-normal min-h-[120px]" />
                            </div>

                            <div >
                                <label htmlFor="recruitment_status" className="block mb-1 text-sm sm:text-base font-semibold text-[var(--barva-tmava)]">Pracovní status</label>
                                <p className="text-xs text-gray-500 mb-2">Dejte startupům vědět, zda jste otevření novým nabídkám.</p>
                                <select
                                    id="recruitment_status"
                                    {...register('recruitment_status')}
                                    className="input cursor-pointer !font-normal bg-white"
                                >
                                    <option value="">Nespecifikováno</option>
                                    <option value="open_to_work">✅ Jsem otevřený/á nabídkám</option>
                                    <option value="not_looking">⛔ Momentálně nehledám</option>
                                </select>
                            </div>
                        </>
                    )}
                    {activeTab === 'skills' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-[var(--barva-primarni)]">Dovednosti</h2>
                                <SkillSelectorEdit onSelectionChange={setSelectedSkills} initialSelectedIds={selectedSkills} />
                                <button type="button" onClick={handleSkillsSubmit} className="mt-6 px-6 py-2 rounded-full text-white bg-[var(--barva-primarni)] cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out">Uložit dovednosti</button>
                            </div>
                            <hr />
                            <div>
                                <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-[var(--barva-primarni)]">Jazyky</h2>
                                <LanguageSelectorEdit onSelectionChange={setSelectedLanguages} initialSelectedIds={selectedLanguages} />
                                <button type="button" onClick={handleLanguagesSubmit} className="mt-6 px-6 py-2 rounded-full text-white bg-[var(--barva-primarni)] cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out">Uložit jazyky</button>
                            </div>
                        </div>
                    )}
                    {activeTab === 'links' && (
                        <>
                            <h2 className="text-xl sm:text-2xl text-[var(--barva-primarni)] font-semibold mb-4">Sociální a profesní odkazy</h2>
                            <EditSocialLinks register={register as unknown as UseFormRegister<FieldValues>} />
                        </>
                    )}
                    {activeTab === 'payouts' && (
                        <div className="space-y-6">
                            <h2 className="text-xl sm:text-2xl text-[var(--barva-primarni)] font-semibold mb-4">Nastavení výplat</h2>
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <h3 className="font-bold text-lg text-gray-800 mb-2">Stripe Connect</h3>
                                <p className="text-gray-600 mb-6 text-sm">
                                    Pro přijímání finančních odměn za výhry v soutěžích je nutné mít propojený účet Stripe.
                                </p>

                                {watch('charges_enabled') ? (
                                    <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-lg border border-green-100">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        </div>
                                        <div>
                                            <p className="font-bold">Účet je aktivní a připraven k výplatám</p>
                                            <p className="text-xs opacity-80">Vaše bankovní údaje jsou bezpečně uloženy u Stripe.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleStripeConnect}
                                        className="flex items-center gap-2 px-6 py-3 cursor-pointer rounded-full bg-[var(--barva-primarni)] text-white font-bold hover:bg-[var(--barva-primarni)]/90 transition-all ease-in-out duration-200 shadow-md"
                                    >
                                        <span>Připojit účet Stripe</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    {(activeTab === 'personal' || activeTab === 'links') && (
                        <div className="pt-4">
                            <button type="submit" disabled={!isDirty || isSubmitting} className="px-6 py-2 rounded-full text-white bg-[var(--barva-primarni)] cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out disabled:bg-gray-300 disabled:cursor-not-allowed">
                                {isSubmitting ? 'Ukládám...' : 'Uložit změny'}
                            </button>
                        </div>
                    )}
                </form>
            </main>
        </div>
    );
}