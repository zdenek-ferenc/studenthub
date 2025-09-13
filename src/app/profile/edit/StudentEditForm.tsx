"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import { useForm } from 'react-hook-form';
import SkillSelectorEdit from './components/EditSkillSelector'; // Změna názvu komponenty pro konzistenci
import LanguageSelectorEdit from './components/EditLanguageSelector'; // Změna názvu komponenty pro konzistenci

// Typy pro data, která budeme načítat a ukládat
type StudentProfile = {
    first_name: string;
    last_name: string;
    username: string;
    university: string;
    field_of_study: string;
    bio: string | null;
};

type Tab = 'personal' | 'skills';

export default function StudentEditForm() {
    const { user, showToast } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('personal');
    
    const { register, handleSubmit, reset, formState: { isDirty, isSubmitting } } = useForm();
    
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

    useEffect(() => {
        if (!user) return;
        
        const fetchData = async () => {
            setLoading(true);
            const [profileRes, skillsRes, languagesRes] = await Promise.all([
                supabase.from('StudentProfile').select('*').eq('user_id', user.id).single(),
                supabase.from('StudentSkill').select('skill_id').eq('student_id', user.id),
                supabase.from('StudentLanguage').select('language_id').eq('student_id', user.id),
            ]);

            if (profileRes.data) {
                reset(profileRes.data);
            }
            if (skillsRes.data) {
                setSelectedSkills(skillsRes.data.map(s => s.skill_id));
            }
            if (languagesRes.data) {
                setSelectedLanguages(languagesRes.data.map(l => l.language_id));
            }
            setLoading(false);
        };
        fetchData();
    }, [user, reset]);

    const handleProfileSubmit = async (data: Partial<StudentProfile>) => {
        if (!user) return;
        const { error } = await supabase.from('StudentProfile').update(data).eq('user_id', user.id);
        if (error) {
            showToast(`Chyba: ${error.message}`, 'error');
        } else {
            showToast('Osobní údaje byly úspěšně uloženy!', 'success');
            reset({}, { keepValues: true }); // Resetuje isDirty, ale zachová hodnoty
        }
    };

    const handleSkillsSubmit = async () => {
        if (!user) return;
        await supabase.from('StudentSkill').delete().eq('student_id', user.id);
        const toInsert = selectedSkills.map(skillId => ({ student_id: user.id, skill_id: skillId }));
        if (toInsert.length > 0) {
            const { error } = await supabase.from('StudentSkill').insert(toInsert);
            if (error) {
                showToast(`Chyba při ukládání dovedností: ${error.message}`, 'error');
            } else {
                showToast('Dovednosti byly úspěšně uloženy!', 'success');
            }
        } else {
             showToast('Dovednosti byly úspěšně uloženy!', 'success');
        }
    };
    
    const handleLanguagesSubmit = async () => {
        if (!user) return;
        await supabase.from('StudentLanguage').delete().eq('student_id', user.id);
        const toInsert = selectedLanguages.map(langId => ({ student_id: user.id, language_id: langId }));
        if(toInsert.length > 0) {
            const { error } = await supabase.from('StudentLanguage').insert(toInsert);
            if (error) {
                showToast(`Chyba při ukládání jazyků: ${error.message}`, 'error');
            } else {
                showToast('Jazyky byly úspěšně uloženy!', 'success');
            }
        } else {
            showToast('Jazyky byly úspěšně uloženy!', 'success');
        }
    };

    if (loading) return <p>Načítám data...</p>;

    const TabButton = ({ tab, label }: { tab: Tab, label: string }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer w-full text-left px-4 py-2 text-[var(--barva-primarni)] rounded-lg transition-colors ${activeTab === tab ? 'bg-[var(--barva-primarni)] text-white' : 'hover:bg-white'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="grid md:grid-cols-4 gap-8">
            <aside className="md:col-span-1">
                <nav className="space-y-2">
                    <TabButton tab="personal" label="Osobní údaje" />
                    <TabButton tab="skills" label="Dovednosti a Jazyky" />
                </nav>
            </aside>

            <main className="md:col-span-3">
                {activeTab === 'personal' && (
                    <form onSubmit={handleSubmit(handleProfileSubmit)} className="space-y-4 text-[var(--barva-tmava)] bg-white p-8 rounded-xl shadow-xs">
                        <h2 className="text-2xl text-[var(--barva-primarni)] font-bold mb-4">Osobní údaje</h2>
                        <div>
                            <label htmlFor="first_name" className="block mb-1 font-semibold">Jméno</label>
                            <input id="first_name" {...register('first_name')} className="input !font-normal" />
                        </div>
                         <div>
                            <label htmlFor="last_name" className="block mb-1 font-semibold">Příjmení</label>
                            <input id="last_name" {...register('last_name')} className="input !font-normal" />
                        </div>
                        <div>
                            <label htmlFor="username" className="block mb-1 font-semibold">Uživatelské jméno</label>
                            <input id="username" {...register('username')} className="input !font-normal" />
                        </div>
                        <div>
                            <label htmlFor="bio" className="block mb-1 font-semibold">Bio (krátký popisek)</label>
                            <textarea id="bio" {...register('bio')} className="input !font-normal min-h-[120px]" />
                        </div>
                        <button type="submit" disabled={!isDirty || isSubmitting} className="px-5 py-2 rounded-full font-semibold text-white bg-[var(--barva-primarni)] text-lg cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out disabled:bg-gray-300 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Ukládám...' : 'Uložit změny'}
                        </button>
                    </form>
                )}
                {activeTab === 'skills' && (
                    <div className="space-y-8 bg-white p-8 rounded-xl shadow-md">
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-[var(--barva-primarni)]">Dovednosti</h2>
                            <SkillSelectorEdit onSelectionChange={setSelectedSkills} initialSelectedIds={selectedSkills} />
                            <button onClick={handleSkillsSubmit} className="mt-4 px-5 py-2 rounded-full font-semibold text-white bg-[var(--barva-primarni)] text-lg cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out">Uložit dovednosti</button>
                        </div>
                        <hr/>
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-[var(--barva-primarni)]">Jazyky</h2>
                            <LanguageSelectorEdit onSelectionChange={setSelectedLanguages} initialSelectedIds={selectedLanguages} />
                            <button onClick={handleLanguagesSubmit} className="mt-4 px-5 py-2 rounded-full font-semibold text-white bg-[var(--barva-primarni)] text-lg cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out">Uložit jazyky</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}