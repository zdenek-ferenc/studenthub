"use client";
import { useFormContext, Controller } from "react-hook-form";
import { ChallengeFormData } from "../CreateChallengeWizard";
import SkillSelectorChallenge from "../../../../components/SkillSelectorChallenge";

const FormSwitch = ({ name, options }: { name: "type" | "has_financial_reward", options: { value: string | boolean; label: string }[] }) => {
    const { control, watch } = useFormContext<ChallengeFormData>();
    const value = watch(name);
    return (
    <div className="bg-gray-100 p-1.5 rounded-full flex items-center max-w-min">
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <>
                {options.map(option => (
                    <button
                    key={option.label}
                    type="button"
                    onClick={() => field.onChange(option.value)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${value === option.value ? 'bg-white text-[var(--barva-primarni)] shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                    {option.label}
                    </button>
                ))}
                </>
            )}
        />
    </div>
    );
};

export default function Step3_Settings() {
    const { register, control, watch, formState: { errors } } = useFormContext<ChallengeFormData>();
    const hasFinancialReward = watch('has_financial_reward');

    return (
        <div className="space-y-8">
            <h2 className="text-2xl md:text-4xl font-bold md:font-extrabold text-[var(--barva-tmava)]">Nastavení a odměny</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="deadline" className="block mb-1 font-semibold text-gray-700">Termín odevzdání</label>
                    <input id="deadline" type="date" {...register('deadline', { required: 'Termín je povinný' })} className="input" />
                    {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline.message}</p>}
                </div>
                <div>
                    <label htmlFor="max_applicants" className="block mb-1 font-semibold text-gray-700">Max. počet přihlášených</label>
                    <select id="max_applicants" {...register('max_applicants', { valueAsNumber: true })} className="input bg-white">
                    {[...Array(16)].map((_, i) => <option key={i} value={i + 5}>{i + 5}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block mb-2 font-semibold text-gray-700">Potřebné dovednosti</label>
                <Controller
                    name="skills"
                    control={control}
                    render={({ field }) => <SkillSelectorChallenge onSelectionChange={field.onChange} initialSelectedIds={field.value} />}
                />
            </div>
            <div>
                <label className="block mb-2 font-semibold text-gray-700">Nabízíte finanční odměnu?</label>
                <FormSwitch name="has_financial_reward" options={[{value: true, label: 'Ano'}, {value: false, label: 'Ne'}]} />
                {hasFinancialReward ? (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="reward_first_place" className="text-sm font-medium text-gray-600">1. místo (Kč)</label>
                            <input id="reward_first_place" type="number" {...register('reward_first_place', { valueAsNumber: true })} className="input mt-1" placeholder="5000" />
                        </div>
                        <div>
                            <label htmlFor="reward_second_place" className="text-sm font-medium text-gray-600">2. místo (Kč)</label>
                            <input id="reward_second_place" type="number" {...register('reward_second_place', { valueAsNumber: true })} className="input mt-1" placeholder="Nepovinné" />
                        </div>
                        <div>
                            <label htmlFor="reward_third_place" className="text-sm font-medium text-gray-600">3. místo (Kč)</label>
                            <input id="reward_third_place" type="number" {...register('reward_third_place', { valueAsNumber: true })} className="input mt-1" placeholder="Nepovinné" />
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label htmlFor="number_of_winners" className="block mb-1 font-semibold text-gray-700">Počet výherců</label>
                            <select id="number_of_winners" {...register('number_of_winners', { valueAsNumber: true, required: 'Vyberte počet výherců' })} className="input bg-white">
                                <option value={1}>1 výherce</option>
                                <option value={2}>2 výherci</option>
                                <option value={3}>3 výherci</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="reward_description" className="block mb-1 font-semibold text-gray-700">Popis nefinanční odměny</label>
                            <input id="reward_description" {...register('reward_description')} className="input" placeholder="Např. Stáž, mentoring, balíček merche..." />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}