"use client";

import { useForm, Controller, useController, Control } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import SkillSelectorChallenge from '../../../components/SkillSelectorChallenge';
import ConfirmationModal from '../../../components/ConfirmationModal'; 

type ChallengeFormData = {
  title: string;
  type: 'public' | 'anonymous';
  short_description: string;
  description: string;
  goals: string;
  expected_outputs: string;
  has_financial_reward: boolean;
  reward_first_place?: number;
  reward_second_place?: number;
  reward_third_place?: number;
  reward_description?: string;
  skills: string[];
  attachments_urls: string[];
  deadline: string;
  max_applicants: number;
  tos_1: boolean;
  tos_2: boolean;
  tos_3: boolean;
};

type FormSwitchProps = {
  name: "type" | "has_financial_reward"; 
  control: Control<ChallengeFormData>;
  options: { value: string | boolean; label: string }[];
};

const FormSwitch = ({ name, control, options }: FormSwitchProps) => {
  const { field } = useController({ name, control });
  return (
    <div className="bg-white my-3 mb-8 gap-2 p-2 rounded-full shadow-sm flex items-center border border-gray-200 max-w-min">
      {options.map(option => (
        <button
          key={option.label}
          type="button"
          onClick={() => field.onChange(option.value)}
          className={`px-5 p-[8px] rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${field.value === option.value ? 'bg-[var(--barva-primarni)] text-white' : 'text-[var(--barva-tmava)] hover:bg-gray-100'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default function CreateChallengeForm() {
  const { user, showToast } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, url: string}[]>([]);
  const [totalBudget, setTotalBudget] = useState<number | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { register, handleSubmit, control, watch, setValue, getValues, formState: { errors } } = useForm<ChallengeFormData>({
    defaultValues: {
      type: 'public',
      has_financial_reward: true,
      skills: [],
      attachments_urls: [],
      max_applicants: 10,
      tos_1: false,
      tos_2: false,
      tos_3: false,
    }
  });

  const hasFinancialReward = watch('has_financial_reward');

  const handleSplitBudget = () => {
    if (!totalBudget || totalBudget <= 0) {
      showToast("Zadejte platnou celkovou částku.", 'error');
      return;
    }
    const first = Math.round(totalBudget * 0.55);
    const second = Math.round(totalBudget * 0.275);
    const third = totalBudget - first - second;

    setValue('reward_first_place', first, { shouldValidate: true });
    setValue('reward_second_place', second, { shouldValidate: true });
    setValue('reward_third_place', third, { shouldValidate: true });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !user) return;
    setIsUploading(true);
    const file = event.target.files[0];
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('challenge-attachments').upload(filePath, file);
    if (error) {
      showToast(`Nahrávání selhalo: ${error.message}`, 'error');
    } else {
      const { data: { publicUrl } } = supabase.storage.from('challenge-attachments').getPublicUrl(data.path);
      const newFiles = [...uploadedFiles, { name: file.name, url: publicUrl }];
      setUploadedFiles(newFiles);
      setValue('attachments_urls', newFiles.map(f => f.url));
      showToast("Soubor byl úspěšně nahrán!", 'success');
    }
    setIsUploading(false);
  };

  const handleFileDelete = async (fileUrl: string, fileName: string) => {
    const filePath = fileUrl.split('/challenge-attachments/')[1];
    if (!filePath) return;
    const { error } = await supabase.storage.from('challenge-attachments').remove([filePath]);
    if (error) {
      showToast(`Smazání souboru selhalo: ${error.message}`, 'error');
    } else {
      const newFiles = uploadedFiles.filter(f => f.name !== fileName);
      setUploadedFiles(newFiles);
      setValue('attachments_urls', newFiles.map(f => f.url));
      showToast("Soubor byl úspěšně smazán.", 'success');
    }
  };

  const handleConfirmSubmit = async () => {
    const data = getValues();
    if (!user) {
      showToast("Nejste přihlášený.", 'error');
      return;
    }
    
    setIsModalOpen(false);
    setIsSubmitting(true);

    const challengeToInsert = {
      startup_id: user.id,
      title: data.title,
      type: data.type,
      short_description: data.short_description,
      description: data.description,
      goals: data.goals,
      expected_outputs: data.expected_outputs,
      has_financial_reward: data.has_financial_reward,
      reward_first_place: data.has_financial_reward ? data.reward_first_place : null,
      reward_second_place: data.has_financial_reward ? data.reward_second_place : null,
      reward_third_place: data.has_financial_reward ? data.reward_third_place : null,
      reward_description: !data.has_financial_reward ? data.reward_description : null,
      attachments_urls: data.attachments_urls,
      deadline: data.deadline,
      max_applicants: data.max_applicants,
      status: 'open'
    };

    const { data: newChallenge, error: challengeError } = await supabase
      .from('Challenge')
      .insert(challengeToInsert)
      .select()
      .single();

    if (challengeError) {
      console.error("Chyba při vytváření výzvy:", challengeError);
      showToast(`Nepodařilo se vytvořit výzvu: ${challengeError.message}`, 'error');
      setIsSubmitting(false);
      return;
    }

    if (data.skills.length > 0) {
      const skillsToInsert = data.skills.map(skillId => ({
        challenge_id: newChallenge.id,
        skill_id: skillId,
      }));
      const { error: skillsError } = await supabase.from('ChallengeSkill').insert(skillsToInsert);
      if (skillsError) {
        console.error("Chyba při ukládání dovedností:", skillsError);
        showToast(`Výzva byla vytvořena, ale nepodařilo se uložit dovednosti: ${skillsError.message}`, 'error');
        // Pokračujeme dál, i když se dovednosti neuloží
      }
    }
    
    showToast(`Výzva "${data.title}" byla úspěšně vytvořena!`, 'success');
    router.push('/profile'); // nebo /challenges/startup
  };

  const onSubmit = () => {
    setIsModalOpen(true);
  };
  
  const formFieldStyle = "w-full bg-white rounded-lg p-3 my-4 text-base text-[var(--barva-tmava)] placeholder-gray-400 transition-colors focus:border-[var(--barva-primarni)] focus:ring-2 focus:ring-[var(--barva-primarni2)] focus:outline-none";

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl mx-auto">
        
        <div>
          <label className="form-label text-2xl font-semibold text-[var(--barva-tmava)]">Název výzvy</label>
          <input {...register('title', { required: 'Název je povinný' })} className={formFieldStyle} />
          {errors.title && <p className="text-[var(--barva-tmava)] font-semibold mb-3">{errors.title.message}</p>}
          <p className='text-md text-[var(--barva-podtext)]'>Název by měl být stručný, jasný a výstižný. Je to první věc, kterou student uvidí, musí z něj být ihned patrné, o jaký typ úkolu se jedná.</p>
        </div>

        <div>
          <label className="form-label text-2xl font-semibold text-[var(--barva-tmava)]">Typ výzvy</label>
          <FormSwitch name="type" control={control} options={[{value: 'public', label: 'Veřejná'}, {value: 'anonymous', label: 'Anonymní'}]} />
        </div>
        
        <div>
          <label className="form-label text-2xl font-semibold text-[var(--barva-tmava)]">Krátký popis</label>
          <textarea {...register('short_description')} className={formFieldStyle} rows={2}></textarea>
          <p className='text-md text-[var(--barva-podtext)]'>Tento text se bude zobrazovat v kartě výzvy a slouží jako rychlé „lákadlo“ pro studenty. Shrňte v jedné větě, co bude student dělat a proč by to mohlo být zajímavé. Mělo by být jasné, jaký typ práce ho čeká.</p>
        </div>
        <div>
          <label className="form-label text-2xl font-semibold text-[var(--barva-tmava)]">Popis výzvy (detailní zadání)</label>
          <textarea {...register('description', { required: 'Popis je povinný' })} className={formFieldStyle} rows={5}></textarea>
          <p className='text-md text-[var(--barva-podtext)]'>Popište svoji firmu a okolnosti, které vás vedly k zadání této výzvy. Vysvětlete studentům, proč je pro vás tato výzva důležitá a jaký problém nebo potřebu tím řešíte. Uveďte vše tak, aby i někdo, kdo vás nezná, rozuměl kontextu a motivaci.</p>      
        </div>
        <div>
          <label className="form-label text-2xl font-semibold text-[var(--barva-tmava)]">Cíle výzvy</label>
          <textarea {...register('goals')} className={formFieldStyle} rows={3}></textarea>
          <p className='text-md text-[var(--barva-podtext)]'>Vyjádřete jasně a stručně, čeho chcete díky této výzvě dosáhnout. Jaká změna nebo přínos má vzniknout? Co by měl studentův výstup podpořit či zlepšit? Zaměřte se na to, jaký efekt má výzva mít na vaši značku, projekt nebo podnikání.</p>
        </div>
        <div>
          <label className="form-label text-2xl font-semibold text-[var(--barva-tmava)]">Očekávané výstupy</label>
          <textarea {...register('expected_outputs')} className={formFieldStyle} rows={3}></textarea>
          <p className='text-md text-[var(--barva-podtext)]'>Zde podrobně popište, co konkrétně musí student dodat – jaký typ a množství materiálů, v jakých formátech, případně s jakým rozlišením, strukturou či obsahem. Toto pole má jasně specifikovat technické požadavky, které studenti musí splnit.</p>
        </div>

        <div>
          <label className="form-label text-2xl font-semibold text-[var(--barva-tmava)]">Nabízíte finanční odměnu?</label>
          <FormSwitch name="has_financial_reward" control={control} options={[{value: true, label: 'Ano'}, {value: false, label: 'Ne'}]} />
          
          {hasFinancialReward ? (
            <div className="mt-4 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="form-label text-xl font-semibold text-[var(--barva-tmava)]">Celkový budget (volitelné)</label>
                <div className="flex items-center gap-2 mt-2">
                  <input 
                    type="number" 
                    onChange={(e) => setTotalBudget(parseInt(e.target.value))} 
                    className={formFieldStyle + " my-0"}
                    placeholder="Např. 10000" 
                  />
                  <button type="button" onClick={handleSplitBudget} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300">
                    Rozdělit
                  </button>
                </div>
                <p className='text-sm text-[var(--barva-podtext)] mt-2'>Zadejte celkovou částku a my ji doporučeně rozdělíme na 1., 2. a 3. místo.</p>
              </div>

              <div>
                <label className="form-label text-xl font-semibold text-[var(--barva-tmava)]">Odměna za 1. místo (v Kč)</label>
                <input type="number" {...register('reward_first_place', { valueAsNumber: true, required: 'Odměna za 1. místo je povinná' })} className={formFieldStyle} placeholder="Např. 5500" />
                {errors.reward_first_place && <p className="text-red-500">{errors.reward_first_place.message}</p>}
              </div>
              <div>
                <label className="form-label text-xl font-semibold text-[var(--barva-tmava)]">Odměna za 2. místo (v Kč)</label>
                <input type="number" {...register('reward_second_place', { valueAsNumber: true })} className={formFieldStyle} placeholder="Nepovinné" />
              </div>
              <div>
                <label className="form-label text-xl font-semibold text-[var(--barva-tmava)]">Odměna za 3. místo (v Kč)</label>
                <input type="number" {...register('reward_third_place', { valueAsNumber: true })} className={formFieldStyle} placeholder="Nepovinné" />
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <label className="form-label text-2xl font-semibold text-[var(--barva-tmava)]">Popis odměny</label>
              <input {...register('reward_description')} className={formFieldStyle} />
              <p className='text-md text-[var(--barva-podtext)]'>Pokud nenabízíte finanční odměnu, je důležité studentům za jejich práci nabídnout jinou přidanou hodnotu...</p>
            </div>
          )}
        </div>

        <div>
          <label className="form-label text-2xl font-semibold text-[var(--barva-tmava)]">Potřebné dovednosti</label>
          <Controller
            name="skills"
            control={control}
            render={({ field }) => <SkillSelectorChallenge onSelectionChange={field.onChange} />}
          />
        </div>
        
        <div className='flex flex-col items-start gap-2'>
          <label className="form-label text-2xl font-semibold text-[var(--barva-tmava)]">Podklady a přílohy</label>
          <input type="file" id="attachmentUpload" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
          <label htmlFor="attachmentUpload" className="text-sm cursor-pointer text-white bg-[var(--barva-primarni)] px-4 border-2 rounded-full py-2 font-semibold hover:bg-[#0069cccb] transition-all duration-300 ease-in-out">
            {isUploading ? 'Nahrávám...' : 'Připojit soubor'}
          </label>
          <div className="mt-2 space-y-1 w-full">
              {uploadedFiles.map((file, index) => (
                  <div key={index} className="text-sm text-[var(--barva-tmava)] bg-[var(--barva-primarni2)] p-2 rounded-md flex justify-between items-center">
                      <span className="truncate pl-2">{file.name}</span>
                      <button 
                        type="button" 
                        onClick={() => handleFileDelete(file.url, file.name)}
                        className="text-[var(--barva-primarni)] cursor-pointer hover:text-[var(--barva-tmava)] p-1 rounded-full"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                  </div>
              ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="form-label text-2xl font-semibold text-[var(--barva-tmava)]">Termín odevzdání</label>
            <input type="date" {...register('deadline', { required: true })} className={formFieldStyle} />
          </div>
          <div>
            <label className="form-label text-2xl font-semibold text-[var(--barva-tmava)]">Maximální počet přihlášení</label>
            <select {...register('max_applicants', { valueAsNumber: true })} className={formFieldStyle}>
              {[...Array(16)].map((_, i) => <option key={i} value={i + 5}>{i + 5}</option>)}
            </select>
          </div>
        </div>
        
        <div className="space-y-6 pt-4">
          <div className="flex items-start">
              <input id="tos_1" type="checkbox" {...register('tos_1', { required: true })} className="h-4 w-4 rounded border-gray-300 text-[var(--barva-primarni)] focus:ring-[var(--barva-primarni)] mt-1" />
              <label htmlFor="tos_1" className="ml-2 block text-md text-[var(--barva-tmava)]">Potvrzuji, že jsem oprávněn tuto výzvu zadat jménem společnosti a souhlasím se zveřejněním.</label>
          </div>
          <div className="flex items-start">
              <input id="tos_2" type="checkbox" {...register('tos_2', { required: true })} className="h-4 w-4 rounded border-gray-300 text-[var(--barva-primarni)] focus:ring-[var(--barva-primarni)] mt-1" />
              <label htmlFor="tos_2" className="ml-2 block text-md text-[var(--barva-tmava)]">Zavazuji se hodnotit všechna odevzdaná řešení férově a podle uvedených kritérií a udělit slíbenou odměnu (pokud byla uvedena).</label>
          </div>
          <div className="flex items-start">
              <input id="tos_3" type="checkbox" {...register('tos_3', { required: true })} className="h-4 w-4 rounded border-gray-300 text-[var(--barva-primarni)] focus:ring-[var(--barva-primarni)] mt-1" />
              <label htmlFor="tos_3" className="ml-2 block text-md text-[var(--barva-tmava)]">Souhlasím s podmínkami používání platformy StudentHUB a zásadami ochrany osobních údajů.</label>
          </div>
        </div>
        <div className='flex justify-center mb-12'>
          <button type="submit" disabled={isSubmitting} className="mt-8 px-14 py-4 rounded-full font-semibold text-white bg-[var(--barva-primarni)] text-2xl cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed">
          {isSubmitting ? 'Zveřejňuji...' : 'Zveřejnit výzvu'}
        </button>
        </div>
        
      </form>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        title="Opravdu chcete zveřejnit výzvu?"
        message="Po zveřejnění již nebude možné upravovat základní zadání. Studenti se budou moci ihned přihlašovat."
      />
    </>
  );
}