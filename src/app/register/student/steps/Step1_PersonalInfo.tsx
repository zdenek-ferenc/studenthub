"use client";
import { useForm } from 'react-hook-form';
import { supabase } from '../../../../lib/supabaseClient'; // Uprav cestu

type FormData = {
  first_name: string;
  last_name: string;
  username: string;
  phone_number: string;
  date_of_birth: string;
};

type StepProps = {
  onNext: (data: FormData) => void;
};

export default function Step1_PersonalInfo({ onNext }: StepProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  return (
    <div className='max-w-lg mx-auto py-12 px-8 sm:px-12 rounded-3xl shadow-xl bg-white'>
      <h2 className="text-4xl text-center text-[var(--barva-primarni)] mb-8">Vytvoř si profil</h2>
      
      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        
        <div>
          <input 
            id="first_name" 
            placeholder="Jméno"
            {...register('first_name', { required: 'Jméno je povinné' })} 
            className="input" 
          />
          {errors.first_name && <p className="error text-center">{errors.first_name.message}</p>}
        </div>

        <div>
          <input 
            id="last_name" 
            placeholder="Příjmení"
            {...register('last_name', { required: 'Příjmení je povinné' })} 
            className="input" 
          />
          {errors.last_name && <p className="error text-center">{errors.last_name.message}</p>}
        </div>

        <div>
          <input 
            id="username" 
            placeholder="Uživatelské jméno"
            {...register('username', { 
                required: 'Uživatelské jméno je povinné',
                minLength: { value: 3, message: 'Jméno musí mít alespoň 3 znaky.' },
                // OPRAVA: Přidali jsme validaci unikátnosti
                validate: async (value) => {
                    const { data } = await supabase
                        .from('StudentProfile')
                        .select('username')
                        .eq('username', value)
                        .single();
                    
                    // Pokud data existují, jméno je zabrané
                    return !data || 'Uživatelské jméno je již zabrané.';
                }
            })} 
            className="input" 
          />
          {errors.username && <p className="error text-center">{errors.username.message}</p>}
        </div>

        <div>
          <input 
            id="phone_number" 
            type="tel" 
            placeholder="Telefonní číslo"
            {...register('phone_number')} 
            className="input" 
          />
        </div>

        <div>
          <input 
            id="date_of_birth" 
            type="date"
            {...register('date_of_birth')} 
            className="input" 
          />
        </div>

        <div className="pt-6 flex justify-center">
          <button type="submit" className="px-8 py-4 rounded-3xl bg-[var(--barva-primarni)] text-xl text-white font-semibold shadow-sm hover:opacity-90 transition-all duration-300 ease-in-out">Pokračovat</button>
        </div>
      </form>
    </div>
  );
}
