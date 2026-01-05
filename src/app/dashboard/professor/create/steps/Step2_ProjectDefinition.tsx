"use client";
import { useFormContext, useFieldArray } from 'react-hook-form';
import { CreateRequestFormData } from '../page';
import { Plus, Trash2, HelpCircle, Info } from 'lucide-react';
import { PROJECT_TYPES_CONFIG, ProjectTypeKey } from '../../../../../types/academic';
import Tooltip from '../../../../../components/Tooltip';

export default function Step2_ProjectDefinition() {
    const { register, control, watch, setValue } = useFormContext<CreateRequestFormData>();
    const selectedType = watch('selected_project_type');

    const { fields: deliverableFields, append: appendDel, remove: removeDel } = useFieldArray({
        control, name: "deliverables"
    });

    const { fields: reqFields, append: appendReq, remove: removeReq } = useFieldArray({
        control, name: "requirements"
    });

    // Inteligentní změna předvoleb podle typu projektu
    const handleTypeChange = (type: ProjectTypeKey) => {
        setValue('selected_project_type', type);
        const config = PROJECT_TYPES_CONFIG[type];
        
        // Reset výstupů
        setValue('deliverables', config.defaultDeliverables.map(d => ({ value: d })));
        
        // Inteligentní návrhy požadavků podle oboru
        let suggestedReqs: string[] = [];
        if (type.includes('marketing') || type.includes('social')) {
            suggestedReqs = ['Přístup do Google Analytics / Meta Business Suite', 'Rozpočet na kampaně (min. 2000 Kč)', 'Existující grafické podklady'];
        } else if (type.includes('development') || type.includes('app')) {
            suggestedReqs = ['Přístup do repozitáře / dokumentace API', 'Serverové prostředí pro nasazení', 'Kontakt na technického leada'];
        } else {
            suggestedReqs = ['Poskytnutí interních dat k analýze', 'Dostupnost zakladatele pro hloubkový rozhovor'];
        }
        setValue('requirements', suggestedReqs.map(r => ({ value: r })));
    };

    return (
        <div className="space-y-8">
            <div className="bg-purple-50 p-4 rounded-xl text-purple-900 text-sm">
                <h4 className="font-bold mb-1 flex items-center gap-2">
                    <Info size={18} />
                    Co hledáme za projekty?
                </h4>
                <p className="ml-6">
                    Tato sekce slouží jako <strong>filtr pro startupy</strong>. Vyberte typ projektu, který nejlépe sedí do vašich osnov. 
                    Čím přesněji definujete výstupy a požadavky, tím kvalitnější firmy se vám přihlásí.
                </p>
            </div>

            {/* Výběr Typu */}
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Typ Projektu / Zaměření</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {(Object.keys(PROJECT_TYPES_CONFIG) as ProjectTypeKey[]).map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => handleTypeChange(type)}
                            className={`p-3 rounded-xl border text-left transition-all text-sm font-medium ${
                                selectedType === type
                                    ? 'border-[var(--barva-primarni)] bg-[var(--barva-primarni)] text-white shadow-md transform scale-105'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white hover:bg-gray-50'
                            }`}
                        >
                            {PROJECT_TYPES_CONFIG[type].title}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* VÝSTUPY */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-bold text-gray-900">Co studenti odevzdají?</label>
                        
                        {/* OPRAVENÝ TOOLTIP: Obaluje ikonu a používá 'content' */}
                        <Tooltip content="Konkrétní soubory nebo výsledky. Např. 'PDF Report', 'Zdrojový kód', 'Prezentace'.">
                            <HelpCircle className="text-gray-400 hover:text-gray-600 cursor-help" size={18} />
                        </Tooltip>
                    </div>
                    
                    <div className="space-y-3">
                        {deliverableFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2">
                                <input
                                    {...register(`deliverables.${index}.value` as const, { required: true })}
                                    className="flex-grow px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-[var(--barva-primarni)] outline-none bg-white"
                                    placeholder="Definujte výstup..."
                                />
                                <button type="button" onClick={() => removeDel(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => appendDel({ value: '' })}
                            className="text-sm text-[var(--barva-primarni)] font-semibold flex items-center gap-1 mt-2 hover:opacity-80 transition-opacity"
                        >
                            <Plus size={16} /> Přidat další výstup
                        </button>
                    </div>
                </div>

                {/* POŽADAVKY */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-bold text-gray-900">Podmínky pro Startup</label>
                        
                        {/* OPRAVENÝ TOOLTIP */}
                        <Tooltip content="Co musí startup mít/udělat, aby spolupráce fungovala? Např. 'Mít nasbíraná data', 'Mít rozpočet'.">
                            <HelpCircle className="text-gray-400 hover:text-gray-600 cursor-help" size={18} />
                        </Tooltip>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-4 italic">
                        Vyhněte se obecným frázím, buďte specifičtí - co technicky nebo časově potřebujete?
                    </p>

                    <div className="space-y-3">
                        {reqFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2">
                                <input
                                    {...register(`requirements.${index}.value` as const)}
                                    className="flex-grow px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-[var(--barva-primarni)] outline-none bg-white"
                                    placeholder="Např. Přístup k datům z GA4..."
                                />
                                <button type="button" onClick={() => removeReq(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => appendReq({ value: '' })}
                            className="text-sm text-[var(--barva-primarni)] font-semibold flex items-center gap-1 mt-2 hover:opacity-80 transition-opacity"
                        >
                            <Plus size={16} /> Přidat podmínku
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}