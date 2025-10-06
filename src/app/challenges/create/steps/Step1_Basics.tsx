"use client";
import { useFormContext } from "react-hook-form";
import { ChallengeFormData } from "../CreateChallengeWizard";

const FormField = ({ label, description, children }: { label: string, description: string, children: React.ReactNode }) => (
    <div>
        <label className="block text-xl font-semibold md:font-bold text-[var(--barva-primarni)]">{label}</label>
        <p className="text-sm md:text-base text-gray-500 mt-1 mb-4">{description}</p>
        {children}
    </div>
);

export default function Step1_Basics() {
    // --- ZMĚNA #1: Přidali jsme funkci 'watch' pro sledování hodnoty pole ---
    const { register, watch, formState: { errors } } = useFormContext<ChallengeFormData>();
    
    // --- ZMĚNA #2: Sledujeme hodnotu pole a počítáme jeho délku ---
    const shortDescriptionValue = watch('short_description', ''); // Sledujeme pole 'short_description'
    const maxLength = 150;
    const currentLength = shortDescriptionValue?.length || 0;

    return (
        <div className="space-y-4 md:space-y-10">
            <div>
                <h2 className="text-2xl md:text-4xl font-bold md:font-extrabold text-[var(--barva-tmava)]">Základy výzvy</h2>
                <p className="md:text-lg text-gray-600 mt-2">Začněme tím nejdůležitějším. Jak se bude vaše výzva jmenovat a o co v ní ve zkratce půjde?</p>
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
                label={`Krátký popis (max. ${maxLength} znaků)`}
                description="Tento text se zobrazí na kartě výzvy a slouží jako rychlé lákadlo. Shrňte v jedné až dvou větách, co studenta čeká."
            >
                <textarea 
                    id="short_description" 
                    {...register('short_description', { 
                        required: 'Krátký popis je povinný', 
                        maxLength: { value: maxLength, message: `Popis nesmí být delší než ${maxLength} znaků` } 
                    })} 
                    rows={2} 
                    className="input !font-normal" 
                />
                
                {/* --- ZMĚNA #3: Přidali jsme samotné počítadlo --- */}
                <div className={`text-right text-sm mt-1 ${currentLength > maxLength ? 'text-red-500' : 'text-gray-500'}`}>
                    {currentLength}/{maxLength}
                </div>

                {errors.short_description && <p className="text-red-500 text-sm mt-1">{errors.short_description.message}</p>}
            </FormField>
        </div>
    );
}