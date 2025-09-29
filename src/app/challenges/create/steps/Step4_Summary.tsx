"use client";
import { useEffect, useState, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { ChallengeFormData } from "../CreateChallengeWizard";
import { supabase } from "../../../../lib/supabaseClient";
import { Edit2, CheckCircle, Tag, Target, DollarSign, Settings, FileText, Info } from "lucide-react";

type Skill = {
    id: string;
    name: string;
};

const SummaryRow = ({ 
    label, 
    value, 
    step, 
    setStep, 
    icon: Icon 
}: { 
    label: string; 
    value: React.ReactNode; 
    step: number; 
    setStep: (step: number) => void; 
    icon: React.ElementType 
}) => (
    <div className="py-5 border-b border-gray-100 flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)] rounded-lg flex items-center justify-center">
            <Icon size={18} />
        </div>
        <div className="flex-grow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold text-xl text-[var(--barva-tmava)]">{label}</p>
                    <div className="text-gray-900 mt-1 prose prose-sm max-w-none">
                        {value}
                    </div>
                </div>
                <button 
                    type="button" 
                    onClick={() => setStep(step)} 
                    className="p-2 text-gray-400 hover:text-[var(--barva-primarni)] transition-colors cursor-pointer"
                    aria-label={`Upravit sekci ${label}`}
                >
                    <Edit2 size={16} />
                </button>
            </div>
        </div>
    </div>
);

export default function Step4_Summary({ setStep }: { setStep: (step: number) => void }) {
    const { watch } = useFormContext<ChallengeFormData>();
    const data = watch();

    const [allSkills, setAllSkills] = useState<Skill[]>([]);

    useEffect(() => {
        const fetchSkills = async () => {
            const { data: skillsData } = await supabase.from('Skill').select('id, name');
            if (skillsData) {
                setAllSkills(skillsData);
            }
        };
        fetchSkills();
    }, []);

    const selectedSkillNames = useMemo(() => {
        if (!data.skills || allSkills.length === 0) return [];
        return data.skills
            .map(skillId => allSkills.find(s => s.id === skillId)?.name)
            // OPRAVA: Přidán typ pro 'name', aby se předešlo implicitnímu 'any'
            .filter((name: string | undefined): name is string => !!name);
    }, [data.skills, allSkills]);


    const rewards = [
        data.reward_first_place,
        data.reward_second_place,
        data.reward_third_place
    ].filter(Boolean).join(' Kč, ');
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[var(--barva-tmava)]">Souhrn a zveřejnění</h2>
            <p className="text-gray-500">Zkontrolujte si prosím všechny údaje. Kliknutím na ikonku tužky se můžete vrátit a upravit danou sekci.</p>
            
            <div className="space-y-2">
                <SummaryRow 
                    label="Název a popis" 
                    value={
                        <>
                            <h3 className="text-lg font-bold not-prose">{data.title}</h3>
                            <p>{data.short_description}</p>
                        </>
                    } 
                    step={1} 
                    setStep={setStep} 
                    icon={Info}
                />
                <SummaryRow 
                    label="Detailní zadání" 
                    value={
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-bold text-gray-600 flex items-center gap-2 not-prose">
                                    <FileText size={16} /> Podrobný popis
                                </h4>
                                <p className="text-sm max-w-xl mt-1">{data.description}</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-600 flex items-center gap-2 not-prose">
                                    <Target size={16} /> Cíle
                                </h4>
                                <p className="text-sm line-clamp-2 mt-1">{data.goals}</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-600 flex items-center gap-2 not-prose">
                                    <CheckCircle size={16} /> Očekávané výstupy
                                </h4>
                                <ul className="list-disc pl-5 mt-1">
                                    {data.expected_outputs?.map(output => 
                                        output.value && <li key={output.value} className="text-sm">{output.value}</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    } 
                    step={2} 
                    setStep={setStep} 
                    icon={FileText}
                />
                <SummaryRow 
                    label="Nastavení" 
                    value={
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <p><strong>Deadline:</strong><br/> {data.deadline ? new Date(data.deadline).toLocaleDateString('cs-CZ') : 'Není nastaven'}</p>
                            <p><strong>Max. přihlášených:</strong><br/> {data.max_applicants}</p>
                        </div>
                    } 
                    step={3} 
                    setStep={setStep}
                    icon={Settings}
                />
                <SummaryRow 
                    label="Potřebné dovednosti" 
                    value={
                        <div className="flex flex-wrap gap-2">
                            {selectedSkillNames.length > 0 ? selectedSkillNames.map(name => (
                                <span key={name} className="px-3 py-1 bg-[var(--barva-primarni2)] text-[var(--barva-primarni)] rounded-full text-sm font-medium">
                                    {name}
                                </span>
                            )) : <p className="text-sm text-gray-500">Nejsou vyžadovány žádné specifické dovednosti.</p>}
                        </div>
                    } 
                    step={3} 
                    setStep={setStep} 
                    icon={Tag}
                />
                <SummaryRow 
                    label="Odměna" 
                    value={
                        <p className="font-bold text-lg text-green-600">
                            {data.has_financial_reward ? `${rewards} Kč` : (data.reward_description || 'Nefinanční odměna')}
                        </p>
                    }
                    step={3} 
                    setStep={setStep} 
                    icon={DollarSign}
                />
            </div>
        </div>
    );
}