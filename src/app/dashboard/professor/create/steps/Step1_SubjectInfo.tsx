"use client";
import { useFormContext } from 'react-hook-form';
import { CreateRequestFormData } from '../page';
import { BookOpen, Users, Info } from 'lucide-react';

export default function Step1_SubjectInfo() {
    const { register, formState: { errors } } = useFormContext<CreateRequestFormData>();

    return (
        <div className="space-y-8">
            <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-800 text-sm">
                <Info className="shrink-0 mt-0.5" size={18} />
                <p><strong>Tip pro profesora:</strong> Tento krok definuje, jak se předmět zobrazí studentům. Buďte konkrétní ohledně toho, jak bude spolupráce se startupem probíhat (týmy, hodnocení, forma).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-900 mb-1">Název Předmětu</label>
                    <input
                        {...register('subject_name', { required: 'Název předmětu je povinný' })}
                        className="input w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--barva-primarni)] focus:ring-2 focus:ring-[var(--barva-primarni)]/20 outline-none transition-all"
                        placeholder="např. Marketingová Komunikace a PR"
                    />
                    {errors.subject_name && <p className="text-red-500 text-sm mt-1">{errors.subject_name.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semestr</label>
                    <div className="relative">
                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            {...register('semester', { required: true })}
                            className="input w-full pl-10 px-4 py-3 rounded-xl border border-gray-200 bg-white"
                        >
                            <option value="ZS 2025">Zimní Semestr 2025</option>
                            <option value="LS 2026">Letní Semestr 2026</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kapacita studentů</label>
                    <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="number"
                            {...register('student_count', { required: true, min: 1 })}
                            className="input w-full pl-10 px-4 py-3 rounded-xl border border-gray-200"
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Kolik studentů se může reálně zapojit?</p>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-900 mb-2">Jak bude spolupráce probíhat?</label>
                    <p className="text-xs text-gray-500 mb-2">
                        Studenti potřebují vědět pravidla hry. Budou pracovat v týmech? Budou mít pravidelné konzultace? Co je cílem pro zápočet?
                    </p>
                    <textarea
                        {...register('description', { required: 'Popis je povinný' })}
                        rows={5}
                        className="input w-full px-4 py-3 rounded-xl border border-gray-200 resize-none focus:border-[var(--barva-primarni)] focus:ring-2 focus:ring-[var(--barva-primarni)]/20 outline-none"
                        placeholder="Např.: V rámci předmětu se rozdělíte do týmů po 5 lidech. Každý tým si vybere jeden startup, pro který zpracuje analýzu. Čekají nás 2 povinné konzultace přímo se zakladatelem startupu..."
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>
            </div>
        </div>
    );
}