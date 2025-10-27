"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import { UseFormRegister, FieldValues, useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
// Import AvatarUploader
import AvatarUploader from './components/AvatarUploader';
import SkillSelectorEdit from './components/EditSkillSelector';
import LanguageSelectorEdit from './components/EditLanguageSelector';
import EditSocialLinks from './components/EditSocialLinks';
import LoadingSpinner from '../../../components/LoadingSpinner';

type StudentProfile = {
    first_name: string;
    last_name: string;
    username: string;
    university: string | null; // Povolíme null
    field_of_study: string | null; // Povolíme null
    bio: string | null;
    github_url: string | null;
    linkedin_url: string | null;
    dribbble_url: string | null;
    personal_website_url: string | null;
    profile_picture_url: string | null; // <-- Přidáno pole pro profilovku
};

type Tab = 'personal' | 'skills' | 'links';

export default function StudentEditForm() {
    const { user, showToast, loading: authLoading, refetchProfile } = useAuth();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [hasFetched, setHasFetched] = useState(false);

    const initialTab = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState<Tab>(
        initialTab === 'skills' || initialTab === 'links' ? initialTab : 'personal'
    );

    // Přidáváme watch a setValue z react-hook-form
    const { register, handleSubmit, reset, watch, setValue, formState: { isDirty, isSubmitting } } = useForm<StudentProfile>(); // Upraven typ pro useForm

    const [originalSkills, setOriginalSkills] = useState<string[]>([]);
    const [originalLanguages, setOriginalLanguages] = useState<string[]>([]);

    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

    // Sledujeme aktuální URL profilovky z formuláře
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
                    reset(profileRes.data); // Načte data do formuláře, včetně profile_picture_url
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

        // Odebereme profile_picture_url z dat pro update, protože se ukládá zvlášť
        const { profile_picture_url, ...profileData } = data;

        const sanitizedData = Object.fromEntries(
            Object.entries(profileData).map(([key, value]) => [key, value === '' ? null : value])
        );
        const { error } = await supabase.from('StudentProfile').update(sanitizedData).eq('user_id', user.id);
        if (error) {
            showToast(`Chyba: ${error.message}`, 'error');
        } else {
            // Pouze pokud byla změna v datech formuláře (kromě profilovky)
            if (isDirty) {
                 showToast('Osobní údaje a odkazy byly úspěšně uloženy!', 'success');
            }
            refetchProfile(); // Znovu načte profil v AuthContextu
            reset({}, { keepValues: true }); // Resetuje 'dirty' stav
        }
    };

    // Funkce handleSkillsSubmit a handleLanguagesSubmit zůstávají stejné
    const handleSkillsSubmit = async () => { /* ... tvůj kód ... */
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
    const handleLanguagesSubmit = async () => { /* ... tvůj kód ... */
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


    if (loading || authLoading) {
        return <LoadingSpinner />;
    }

    const TabButton = ({ tab, label }: { tab: Tab, label: string }) => (
        <button
            type="button" // Přidáno type="button", aby nesubmitoval formulář
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer w-full text-left px-4 py-2 text-[var(--barva-primarni)] rounded-lg transition-colors ${activeTab === tab ? 'bg-[var(--barva-primarni)] text-white' : 'hover:bg-white'}`}
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
                </nav>
            </aside>

            <main className="md:col-span-3">
                {/* Obalující formulář zůstává, ale submit se řeší jen pro záložky 'personal' a 'links' */}
                <form onSubmit={handleSubmit(handleProfileSubmit)} className="space-y-8 bg-white p-8 rounded-xl shadow-xs">
                    {/* === Záložka Osobní údaje === */}
                    {activeTab === 'personal' && (
                        <>
                            <h2 className="text-2xl text-[var(--barva-primarni)] font-semibold mb-4">Osobní údaje</h2>

                            {/* --- Avatar Uploader --- */}
                            {user && (
                              <div className="flex justify-center pb-6 border-b border-gray-100 mb-6">
                                <AvatarUploader
                                  userId={user.id}
                                  currentAvatarUrl={currentProfilePictureUrl || null}
                                  onUploadSuccess={(newUrl) => {
                                    // Aktualizujeme hodnotu v react-hook-form
                                    setValue('profile_picture_url', newUrl, { shouldDirty: true });
                                    // Můžeme rovnou zavolat refetch, aby se obrázek aktualizoval i v headeru atd.
                                    refetchProfile();
                                  }}
                                  onDeleteSuccess={() => {
                                    // Aktualizujeme hodnotu v react-hook-form
                                    setValue('profile_picture_url', null, { shouldDirty: true });
                                    refetchProfile();
                                  }}
                                />
                              </div>
                            )}
                            {/* --- Konec Avatar Uploader --- */}

                            <div>
                                <label htmlFor="first_name" className="block mb-1 font-semibold text-[var(--barva-tmava)]">Jméno</label>
                                <input id="first_name" {...register('first_name')} className="input !font-normal" />
                            </div>
                            <div>
                                <label htmlFor="last_name" className="block mb-1 font-semibold text-[var(--barva-tmava)]">Příjmení</label>
                                <input id="last_name" {...register('last_name')} className="input !font-normal" />
                            </div>
                            <div>
                                <label htmlFor="username" className="block mb-1 font-semibold text-[var(--barva-tmava)]">Uživatelské jméno</label>
                                <input id="username" {...register('username')} className="input !font-normal" />
                            </div>
                            <div>
                                <label htmlFor="bio" className="block mb-1 font-semibold text-[var(--barva-tmava)]">Bio (krátký popisek)</label>
                                <textarea id="bio" {...register('bio')} className="input !font-normal min-h-[120px]" />
                            </div>
                        </>
                    )}

                    {/* === Záložka Dovednosti a Jazyky === */}
                    {activeTab === 'skills' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-semibold mb-4 text-[var(--barva-primarni)]">Dovednosti</h2>
                                <SkillSelectorEdit onSelectionChange={setSelectedSkills} initialSelectedIds={selectedSkills} />
                                {/* Tlačítko pro uložení jen skillů */}
                                <button type="button" onClick={handleSkillsSubmit} className="mt-6 px-6 py-2 rounded-full text-white bg-[var(--barva-primarni)] cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out">Uložit dovednosti</button>
                            </div>
                            <hr/>
                            <div>
                                <h2 className="text-2xl font-semibold mb-4 text-[var(--barva-primarni)]">Jazyky</h2>
                                <LanguageSelectorEdit onSelectionChange={setSelectedLanguages} initialSelectedIds={selectedLanguages} />
                                {/* Tlačítko pro uložení jen jazyků */}
                                <button type="button" onClick={handleLanguagesSubmit} className="mt-6 px-6 py-2 rounded-full text-white bg-[var(--barva-primarni)] cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out">Uložit jazyky</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'links' && (
                        <>
                            <h2 className="text-2xl text-[var(--barva-primarni)] font-semibold mb-4">Sociální a profesní odkazy</h2>
                            <EditSocialLinks register={register as unknown as UseFormRegister<FieldValues>} />                        </>
                    )}

                    {/* Společné tlačítko Uložit pro záložky 'personal' a 'links' */}
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