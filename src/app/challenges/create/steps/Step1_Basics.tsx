"use client";
import { useFormContext } from "react-hook-form";
import { ChallengeFormData } from "../CreateChallengeWizard";

// Pomocná komponenta pro strukturu pole formuláře
const FormField = ({ label, description, children }: { label: string, description: string, children: React.ReactNode }) => (
    <div>
        <label className="block text-xl font-bold text-gray-800">{label}</label>
        <p className="text-base text-gray-500 mt-1 mb-4">{description}</p>
        {children}
    </div>
);

export default function Step1_Basics() {
    const { register, formState: { errors } } = useFormContext<ChallengeFormData>();
    
    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-4xl font-extrabold text-[var(--barva-tmava)]">Základy výzvy</h2>
                <p className="text-lg text-gray-600 mt-2">Začněme tím nejdůležitějším. Jak se bude vaše výzva jmenovat a o co v ní ve zkratce půjde?</p>
            </div>
            
            <FormField
                label="Název výzvy"
                description="Název je to první, co student uvidí. Měl by být chytlavý, stručný a jasně říkat, o jaký typ úkolu se jedná."
            >
                <input 
                    id="title" 
                    {...register('title', { required: 'Název je povinný' })} 
                    className="input !font-normal" 
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </FormField>

            <FormField
                label="Krátký popis (max. 150 znaků)"
                description="Tento text se zobrazí na kartě výzvy a slouží jako rychlé lákadlo. Shrňte v jedné až dvou větách, co studenta čeká."
            >
                <textarea 
                    id="short_description" 
                    {...register('short_description', { 
                        required: 'Krátký popis je povinný', 
                        maxLength: { value: 150, message: 'Popis nesmí být delší než 150 znaků' } 
                    })} 
                    rows={2} 
                    className="input !font-normal" 
                />
                {errors.short_description && <p className="text-red-500 text-sm mt-1">{errors.short_description.message}</p>}
            </FormField>
        </div>
    );
}

