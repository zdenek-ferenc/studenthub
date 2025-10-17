"use client";
import { useForm } from 'react-hook-form';
import { supabase } from '../../../../lib/supabaseClient';
import { useState, useEffect } from 'react';
import { useDebounce } from '../../../../hooks/useDebounce'; 
import { CheckCircle, XCircle, Loader } from 'lucide-react'; 

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
  const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm<FormData>({ mode: 'onChange' });

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const usernameValue = watch('username'); 
  const debouncedUsername = useDebounce(usernameValue, 500); 

  useEffect(() => {
    let isActive = true;

    const checkUsername = async () => {
      if (!debouncedUsername || debouncedUsername.length < 3) {
        if (isActive) setUsernameStatus('idle');
        return;
      }

      if (isActive) setUsernameStatus('checking');

      const { data, error } = await supabase
        .from('StudentProfile')
        .select('username')
        .eq('username', debouncedUsername)
        .single();
      if (!isActive) return;
      if (error && error.code !== 'PGRST116') {
        console.error("Chyba při validaci jména:", error);
        setUsernameStatus('idle');
        return;
      }
      setUsernameStatus(data ? 'taken' : 'available');
      trigger('username');
    };
    checkUsername();

    return () => {
      isActive = false;
    };
  }, [debouncedUsername, trigger]);


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
          {errors.first_name && <p className="error pt-2 text-blue-400 text-center">{errors.first_name.message}</p>}
        </div>

        <div>
          <input 
            id="last_name" 
            placeholder="Příjmení"
            {...register('last_name', { required: 'Příjmení je povinné' })} 
            className="input" 
          />
          {errors.last_name && <p className="error pt-2 text-blue-400 text-center">{errors.last_name.message}</p>}
        </div>

        <div>
          <div className="relative">
            <input 
              id="username" 
              placeholder="Uživatelské jméno"
              {...register('username', { 
                  required: 'Uživatelské jméno je povinné',
                  minLength: { value: 3, message: 'Jméno musí mít alespoň 3 znaky.' },
                  pattern: {
                    value: /^[a-zA-Z0-9_.]+$/,
                    message: 'Jméno může obsahovat jen písmena, čísla, tečky a podtržítka.'
                  },
                  validate: () => usernameStatus !== 'taken' || 'Uživatelské jméno je již zabrané.'
              })} 
              className="input pr-10"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {usernameStatus === 'checking' && <Loader className="h-5 w-5 text-blue-400 animate-spin" />}
              {usernameStatus === 'available' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {usernameStatus === 'taken' && <XCircle className="h-5 w-5 text-red-500" />}
            </div>
          </div> 
          {errors.username && <p className="error pt-2 text-blue-400 text-center">{errors.username.message}</p>}
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

        <div className="pt-6 flex justify-center">
          <button type="submit" className="px-6 py-3 md:px-8 md:py-4 rounded-3xl font-semibold text-white bg-[var(--barva-primarni)] md:text-xl cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out disabled:bg-gray-400">Pokračovat</button>
        </div>
      </form>
    </div>
  );
}