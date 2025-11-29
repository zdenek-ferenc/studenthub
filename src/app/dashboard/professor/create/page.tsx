"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { generateJoinCode } from '../../../../lib/utils/code-generator';
import { ArrowLeft, RefreshCw, Save } from 'lucide-react';
import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';

type CreateRequestFormData = {
    subject_name: string;
    semester: string;
    student_count: number;
    description: string;
    join_code: string;
};

export default function CreateRequestPage() {
    const { user, showToast } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const controls = useAnimation();
    const [isErrorState, setIsErrorState] = useState(false);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<CreateRequestFormData>({
        defaultValues: {
            join_code: generateJoinCode(),
            semester: 'ZS 2025',
            student_count: 30
        }
    });

    const { onChange: onJoinCodeChange, ...joinCodeRest } = register('join_code', { required: true });

    const handleGenerateCode = () => {
        setValue('join_code', generateJoinCode());
        setIsErrorState(false);
    };

    const onSubmit = async (data: CreateRequestFormData) => {
        if (!user) return;
        setIsLoading(true);
        setIsErrorState(false);

        const finalJoinCode = data.join_code.toUpperCase();

        try {
            const { error } = await supabase
                .from('AcademicRequest')
                .insert({
                    professor_id: user.id,
                    subject_name: data.subject_name,
                    semester: data.semester,
                    student_count: data.student_count,
                    description: data.description,
                    join_code: finalJoinCode,
                    status: 'open'
                });

            if (error) {
                if (error.code === '23505' && error.message?.includes('join_code')) {
                    showToast('Tento kód je již obsazen, vygenerovali jsme nový.', 'error');
                    
                    const newCode = generateJoinCode();
                    setValue('join_code', newCode);
                    setIsErrorState(true);

                    controls.start({
                        x: [0, -10, 10, -10, 10, 0],
                        transition: { duration: 0.4 }
                    });

                    setIsLoading(false);
                    return; 
                }
                throw error; 
            }

            showToast('Poptávka byla úspěšně vytvořena!', 'success');
            router.push('/dashboard/professor');

        } catch (error: unknown) {
            console.error('Error creating request:', error);
            showToast('Chyba při vytváření poptávky.', 'error');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--barva-svetle-pozadi)] p-6 md:py-32">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
                <Link href="/dashboard/professor" className="inline-flex items-center text-gray-500 hover:text-gray-800 mb-4 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    Zpět na Dashboard
                </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Nová Poptávka</h1>
                    <p className="text-gray-500 mb-8">Vypište nový předmět pro spolupráci se startupy.</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Název Předmětu</label>
                            <input
                                {...register('subject_name', { required: 'Název předmětu je povinný' })}
                                className="input w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--barva-primarni)] focus:ring-2 focus:ring-[var(--barva-primarni)]/20 outline-none transition-all"
                                placeholder="např. Marketingová Komunikace"
                            />
                            {errors.subject_name && <p className="text-red-500 text-sm mt-1">{errors.subject_name.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Semestr</label>
                                <select
                                    {...register('semester', { required: true })}
                                    className="input w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--barva-primarni)] focus:ring-2 focus:ring-[var(--barva-primarni)]/20 outline-none transition-all bg-white"
                                >
                                    <option value="ZS 2025">Zimní Semestr 2025</option>
                                    <option value="LS 2026">Letní Semestr 2026</option>
                                    <option value="ZS 2026">Zimní Semestr 2026</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Odhad Studentů</label>
                                <input
                                    type="number"
                                    {...register('student_count', { required: true, min: 1 })}
                                    className="input w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--barva-primarni)] focus:ring-2 focus:ring-[var(--barva-primarni)]/20 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Popis Spolupráce</label>
                            <textarea
                                {...register('description', { required: 'Popis je povinný' })}
                                rows={4}
                                className="input w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--barva-primarni)] focus:ring-2 focus:ring-[var(--barva-primarni)]/20 outline-none transition-all resize-none"
                                placeholder="Co od firmy očekáváte? Jaký je cíl projektu?"
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                        </div>
                        <div className={`bg-gray-50 p-6 rounded-2xl border transition-colors duration-300 ${isErrorState ? 'border-red-300 bg-red-50' : 'border-gray-100'}`}>
                            <label className={`block text-sm font-medium mb-2 transition-colors ${isErrorState ? 'text-red-600' : 'text-gray-700'}`}>
                                Unikátní Kód Předmětu
                            </label>
                            <div className="flex gap-3">
                                <motion.input
                                    animate={controls}
                                    {...joinCodeRest}
                                    onChange={(e) => {
                                        e.target.value = e.target.value.toUpperCase();
                                        onJoinCodeChange(e);
                                        setIsErrorState(false);
                                    }}
                                    className={`flex-grow px-4 text-black py-3 rounded-xl border font-mono text-lg font-bold text-center tracking-widest uppercase focus:ring-2 outline-none transition-all ${
                                        isErrorState 
                                            ? 'border-red-300 text-red-600 focus:border-red-500 focus:ring-red-200' 
                                            : 'border-gray-200 focus:border-[var(--barva-primarni)] focus:ring-[var(--barva-primarni)]/20'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={handleGenerateCode}
                                    className="px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600"
                                    title="Vygenerovat nový kód"
                                >
                                    <RefreshCw size={24} />
                                </button>
                            </div>
                            <p className={`text-xs mt-2 transition-colors ${isErrorState ? 'text-red-500' : 'text-gray-500'}`}>
                                {isErrorState ? 'Původní kód byl obsazen. Vygenerovali jsme nový.' : 'Tento kód budou studenti používat pro připojení k předmětu.'}
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 rounded-xl font-bold text-white bg-[var(--barva-primarni)] hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                'Ukládám...'
                            ) : (
                                <>
                                    <Save size={20} />
                                    Vytvořit Poptávku
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
