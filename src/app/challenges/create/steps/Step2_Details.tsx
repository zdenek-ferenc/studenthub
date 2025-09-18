"use client";
import { useFormContext, useFieldArray } from "react-hook-form";
import { ChallengeFormData } from "../CreateChallengeWizard";
import { PlusCircle, XCircle } from "lucide-react";

// Pomocná komponenta pro strukturu pole formuláře
const FormField = ({ label, description, children }: { label: string, description: string, children: React.ReactNode }) => (
    <div>
        <label className="block text-xl font-bold text-gray-800">{label}</label>
        <p className="text-base text-gray-500 mt-1 mb-4">{description}</p>
        {children}
    </div>
);

export default function Step2_Details() {
    const { register, control, formState: { errors } } = useFormContext<ChallengeFormData>();

    // --- OPRAVA ZDE: Odstraněn 'as any' a správně se odkazuje na typ v ChallengeFormData ---
    const { fields, append, remove } = useFieldArray({
        control,
        name: "expected_outputs", 
    });

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-4xl font-extrabold text-[var(--barva-tmava)]">Detailní zadání</h2>
                <p className="text-lg text-gray-600 mt-2">Nyní je čas jít do hloubky. Popište studentům kontext a přesně specifikujte, co od nich očekáváte.</p>
            </div>
            
            <FormField
                label="Podrobný popis"
                description="Představte svou firmu, projekt a důvod, proč tuto výzvu zadáváte. Čím více kontextu studentům dáte, tím lepší řešení dostanete."
            >
                <textarea 
                    id="description" 
                    {...register('description', { required: 'Podrobný popis je povinný' })} 
                    rows={5} 
                    className="input" 
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </FormField>

            <FormField
                label="Cíle výzvy"
                description="Jasně definujte, čeho chcete touto výzvou dosáhnout. Co je hlavním úkolem a jaký by měl být výsledek?"
            >
                <textarea 
                    id="goals" 
                    {...register('goals', { required: 'Cíle jsou povinné' })} 
                    rows={3} 
                    className="input" 
                />
                {errors.goals && <p className="text-red-500 text-sm mt-1">{errors.goals.message}</p>}
            </FormField>

            <FormField
                label="Očekávané výstupy"
                description="Rozdělte zadání na konkrétní, měřitelné úkoly. Každý bod se studentovi zobrazí jako položka v checklistu."
            >
                <div className="space-y-3">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                            <input
                                // --- OPRAVA ZDE: Správná cesta k registraci pole objektů ---
                                {...register(`expected_outputs.${index}.value` as const, { required: true })}
                                className="input flex-grow"
                                placeholder={`Např. PDF prezentace, odkaz na Figmu...`}
                            />
                            <button type="button" onClick={() => remove(index)}>
                                <XCircle className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors" />
                            </button>
                        </div>
                    ))}
                    <button 
                        type="button" 
                        // --- OPRAVA ZDE: Přidáváme objekt, ne jen string ---
                        onClick={() => append({ value: "" })}
                        className="flex items-center gap-2 text-sm font-semibold text-[var(--barva-primarni)] hover:text-blue-700 transition-colors"
                    >
                        <PlusCircle size={18} />
                        Přidat další výstup
                    </button>
                </div>
            </FormField>
        </div>
    );
}