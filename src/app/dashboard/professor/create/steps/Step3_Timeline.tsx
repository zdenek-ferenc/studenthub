"use client";
import { useFormContext } from 'react-hook-form';
import { CreateRequestFormData } from '../page';
import { Calendar, RefreshCw} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Step3_Timeline() {
    const { register, watch, setValue } = useFormContext<CreateRequestFormData>();
    const joinCode = watch('join_code');

    const handleRegenerate = () => {
        // Zde by ideálně měla být funkce importovaná z utils, 
        // ale pro ukázku stačí zkopírovat logiku generování
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setValue('join_code', result);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-10">
            
            <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900">Poslední kroky</h3>
                <p className="text-gray-500">Nastavte očekávání ohledně času a vygenerujte přístup pro studenty.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Přihlášky Startupů */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Uzávěrka pro Startupy</label>
                    <p className="text-xs text-gray-500 mb-3">Do kdy se mohou firmy hlásit? Poté se náběr uzavře.</p>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="date"
                            {...register('deadline_application', { required: true })}
                            className="input w-full pl-10 px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--barva-primarni)]"
                        />
                    </div>
                </div>

                {/* Dodání Výstupů */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Finální odevzdání studenty</label>
                    <p className="text-xs text-gray-500 mb-3">Kdy studenti odevzdají hotovou práci startupům?</p>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="date"
                            {...register('deadline_delivery', { required: true })}
                            className="input w-full pl-10 px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--barva-primarni)]"
                        />
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100 my-6"></div>

            {/* JOIN CODE */}
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 text-center">
                <label className="block text-base font-bold text-gray-900 mb-2">
                    Přístupový kód pro studenty
                </label>
                <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                    Tento kód studenti zadají ve svém profilu, aby se přidali do tohoto předmětu a mohli se hlásit na projekty.
                </p>

                <div className="flex items-center justify-center gap-4 mb-4">
                    <motion.div 
                        key={joinCode}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-4xl md:text-5xl font-mono font-bold text-[var(--barva-primarni)] tracking-widest bg-white px-8 py-4 rounded-xl shadow-sm border border-gray-100"
                    >
                        {joinCode}
                    </motion.div>
                </div>

                <button
                    type="button"
                    onClick={handleRegenerate}
                    className="text-gray-500 hover:text-gray-800 text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                    <RefreshCw size={16} />
                    Vygenerovat jiný kód
                </button>
            </div>
        </div>
    );
}