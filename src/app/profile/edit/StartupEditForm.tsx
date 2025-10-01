"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import CategorySelectorEdit from './components/EditCategorySelector';

type StartupProfile = {
    company_name: string; website: string; description: string | null;
    ico: string | null; phone_number: string | null; address: string | null;
    contact_first_name: string; contact_last_name: string; contact_position: string | null;
};

type Tab = 'company' | 'contact' | 'categories';

export default function StartupEditForm() {
    const { user, showToast } = useAuth();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    
    const initialTab = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState<Tab>(
        (initialTab === 'contact' || initialTab === 'categories') ? initialTab : 'company'
    );
    
    const { register, handleSubmit, reset, formState: { isDirty, isSubmitting } } = useForm();
    
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

const [hasFetched, setHasFetched] = useState(false);

useEffect(() => {
    if (!user || hasFetched) return;

    const fetchData = async () => {
        setLoading(true);
        const [profileRes, categoriesRes] = await Promise.all([
            supabase.from('StartupProfile').select('*').eq('user_id', user.id).single(),
            supabase.from('StartupCategory').select('category_id').eq('startup_id', user.id),
        ]);

        if (profileRes.data) reset(profileRes.data);
        if (categoriesRes.data) setSelectedCategories(categoriesRes.data.map(c => c.category_id));
        
        setLoading(false);
        setHasFetched(true); 
    };

    fetchData();
}, [user, reset, hasFetched]);

useEffect(() => {
    setHasFetched(false);
}, [user?.id]);

    const handleProfileSubmit = async (data: Partial<StartupProfile>) => {
        if (!user) return;
        const { error } = await supabase.from('StartupProfile').update(data).eq('user_id', user.id);
        if (error) showToast(`Chyba: ${error.message}`, 'error');
        else {
            showToast('Profil byl úspěšně uložen!', 'success');
            reset({}, { keepValues: true });
        }
    };

    const handleCategoriesSubmit = async () => {
        if (!user) return;
        await supabase.from('StartupCategory').delete().eq('startup_id', user.id);
        const toInsert = selectedCategories.map(categoryId => ({ startup_id: user.id, category_id: categoryId }));
        if (toInsert.length > 0) {
            const { error } = await supabase.from('StartupCategory').insert(toInsert);
            if (error) {
                showToast(`Chyba při ukládání kategorií: ${error.message}`, 'error');
                return;
            }
        }
        showToast('Kategorie byly úspěšně uloženy!', 'success');
    };

    if (loading) return <p>Načítám data...</p>;

    const TabButton = ({ tab, label }: { tab: Tab, label: string }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer w-full text-left px-4 py-2 text-[var(--barva-primarni)] rounded-lg transition-colors ${activeTab === tab ? 'bg-[var(--barva-primarni)] shadow-md text-white' : 'hover:bg-white'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="grid md:grid-cols-4 gap-8">
            <aside className="md:col-span-1">
                <nav className="space-y-2">
                    <TabButton tab="company" label="Informace o firmě" />
                    <TabButton tab="contact" label="Kontaktní osoba" />
                    <TabButton tab="categories" label="Kategorie" />
                </nav>
            </aside>
            <main className="md:col-span-3">
                <form onSubmit={handleSubmit(handleProfileSubmit)} className="space-y-4 bg-white text-[var(--barva-tmava)] p-8 rounded-xl shadow-md">
                    {activeTab === 'company' && (
                        <>
                            <h2 className="text-2xl text-[var(--barva-primarni)] font-bold mb-4">Informace o firmě</h2>
                            <div>
                                <label htmlFor="company_name" className="block mb-1 font-semibold">Název firmy</label>
                                <input id="company_name" {...register('company_name')} className="input !font-normal" />
                            </div>
                            <div>
                                <label htmlFor="website" className="block mb-1 font-semibold">Webová stránka</label>
                                <input id="website" {...register('website')} className="input !font-normal" />
                            </div>
                            <div>
                                <label htmlFor="description" className="block mb-1 font-semibold">Popis firmy</label>
                                <textarea id="description" {...register('description')} className="input !font-normal min-h-[150px]" />
                            </div>
                        </>
                    )}
                    {activeTab === 'contact' && (
                    <>
                            <h2 className="text-2xl text-[var(--barva-primarni)] font-bold mb-4">Kontaktní osoba</h2>
                            <div>
                                <label htmlFor="contact_first_name" className="block mb-1 font-semibold">Jméno</label>
                                <input id="contact_first_name" {...register('contact_first_name')} className="input !font-normal" />
                            </div>
                            <div>
                                <label htmlFor="contact_last_name" className="block mb-1 font-semibold">Příjmení</label>
                                <input id="contact_last_name" {...register('contact_last_name')} className="input !font-normal" />
                            </div>
                            <div>
                                <label htmlFor="contact_position" className="block mb-1 font-semibold">Pozice ve firmě</label>
                                <input id="contact_position" {...register('contact_position')} className="input !font-normal" />
                            </div>
                        </>
                    )}
                    
                    {['company', 'contact'].includes(activeTab) && (
                        <button type="submit" disabled={!isDirty || isSubmitting} className="px-5 py-2 mt-4 rounded-full font-semibold text-white bg-[var(--barva-primarni)] text-lg cursor-pointer hover:opacity-90 disabled:bg-gray-300">
                            {isSubmitting ? 'Ukládám...' : 'Uložit změny'}
                        </button>
                    )}
                </form>
                {activeTab === 'categories' && (
                    <div className="space-y-4 bg-white p-8 rounded-xl shadow-md">
                        <h2 className="text-2xl text-[var(--barva-primarni)] font-bold mb-4">Kategorie</h2>
                        <CategorySelectorEdit onSelectionChange={setSelectedCategories} initialSelectedIds={selectedCategories} />
                        <button type="button" onClick={handleCategoriesSubmit} className="px-5 mt-2 py-2 rounded-full font-semibold text-white bg-[var(--barva-primarni)] text-lg cursor-pointer hover:opacity-90">Uložit kategorie</button>
                    </div>
                )}
            </main>
        </div>
    );
}