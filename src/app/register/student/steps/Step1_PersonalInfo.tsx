"use client";
import { useForm } from 'react-hook-form';
import { supabase } from '../../../../lib/supabaseClient';
import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '../../../../hooks/useDebounce';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import GDPRModal from '../../../../components/GDPRModal';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css'; 
import { Controller } from 'react-hook-form';

type FormData = {
  first_name: string;
  last_name: string;
  username: string;
  phone_number: string;
  gdpr_consent: boolean;
};

type StepProps = {
  onNext: (data: FormData) => void;
  initialData: FormData;
};

export default function Step1_PersonalInfo({ onNext, initialData }: StepProps) {
  const { register, control, handleSubmit, formState: { errors, isSubmitting, isValidating }, watch } = useForm<FormData>({
      mode: 'onChange',
      reValidateMode: 'onChange',
      defaultValues: {
          first_name: initialData.first_name || '',
          last_name: initialData.last_name || '',
          username: initialData.username || '',
          phone_number: initialData.phone_number || '',
          gdpr_consent: initialData.gdpr_consent || false,
      }
  });

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [displayError, setDisplayError] = useState<string | null>(null);
  const [isGdprModalOpen, setIsGdprModalOpen] = useState(false);

  const usernameValue = watch('username');
  const debouncedUsername = useDebounce(usernameValue, 500);

  const validateUsername = useCallback(async (username: string) => {
    if (username.length < 5) return true;
    if (username === initialData.username) return true;

    const { data, error } = await supabase
      .from('StudentProfile')
      .select('username')
      .eq('username', username)
      .single();

    if (data) return 'Uživatelské jméno je již zabrané.';
    if (error && error.code !== 'PGRST116') return 'Chyba při ověřování.';
    
    return true;
  }, [initialData.username]);

  useEffect(() => {
    const userHasStoppedTyping = usernameValue === debouncedUsername;

    // Řízení ikonky
    if (isValidating) {
      setUsernameStatus('checking');
    } else if (!debouncedUsername || debouncedUsername.length < 5) {
      setUsernameStatus('idle');
    } else if (errors.username) {
      setUsernameStatus('taken');
    } else {
      setUsernameStatus('available');
    }

    const usernameError = errors.username;
    if (usernameError) {
      if (usernameError.type === 'minLength') {
        setDisplayError(userHasStoppedTyping ? usernameError.message || null : null);
      } else {
        setDisplayError(usernameError.message || null);
      }
    } else {
      setDisplayError(null);
    }

  }, [isValidating, errors.username, debouncedUsername, usernameValue]);

  return (
    <div className='max-w-lg mx-auto py-12 px-8 sm:px-12 rounded-3xl shadow-xl bg-white'>
      <h2 className="text-4xl text-center text-[var(--barva-primarni)] mb-8">Vytvoř si profil</h2>
      
      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        <p className="text-sm text-gray-400 text-center">Položky označené <span className='text-red-400'>*</span> jsou povinné.</p>
        <div>
          <input 
            id="first_name" 
            placeholder="Jméno *"
            {...register('first_name', { required: 'Jméno je povinné' })} 
            className="input" 
          />
          {errors.first_name && <p className="error pt-2 text-red-500 text-center">{errors.first_name.message}</p>}
        </div>

        <div>
          <input 
            id="last_name" 
            placeholder="Příjmení *"
            {...register('last_name', { required: 'Příjmení je povinné' })} 
            className="input" 
          />
          {errors.last_name && <p className="error pt-2 text-red-500 text-center">{errors.last_name.message}</p>}
        </div>

        <div>
          <div className="relative">
            <input 
              id="username" 
              placeholder="Uživatelské jméno *"
              {...register('username', { 
                  required: 'Uživatelské jméno je povinné',
                  minLength: { value: 5, message: 'Jméno musí mít alespoň 5 znaků.' },
                  pattern: {
                    value: /^[a-zA-Z0-9_.]+$/,
                    message: 'Jméno může obsahovat jen písmena, čísla, tečky a podtržítka.'
                  },
                  validate: validateUsername
              })} 
              className="input pr-10"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {usernameStatus === 'checking' && <Loader className="h-5 w-5 text-blue-400 animate-spin" />}
              {usernameStatus === 'available' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {usernameStatus === 'taken' && usernameValue === debouncedUsername && <XCircle className="h-5 w-5 text-red-500" />}
            </div>
          </div> 
          {displayError && <p className="error pt-2 text-red-500 text-center">{displayError}</p>}
        </div>

        <div>
          <Controller
            name="phone_number"
            control={control}
            rules={{
              required: 'Telefonní číslo je povinné',
              validate: (value) => isValidPhoneNumber(value || '') || 'Zadejte platné telefonní číslo'
            }}
            render={({ field }) => (
              <PhoneInput
          {...field}
          placeholder="Telefonní číslo *"
          className="input"
          defaultCountry="CZ" 
          international
          countryCallingCodeEditable={false}
              />
            )}
          />
          {errors.phone_number && <p className="error pt-2 text-red-500 text-center">{errors.phone_number.message}</p>}
        </div>

      <div className="pt-4">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="gdpr_consent"
            type="checkbox"
            {...register('gdpr_consent', { required: 'Pro pokračování je nutné udělit souhlas.' })}
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="gdpr_consent" className="font-medium text-gray-700">
            Souhlasím se zpracováním osobních údajů
          </label>
          <p className="text-gray-500 text-xs">
            Pro více informací o tom, jak nakládáme s vašimi daty, si přečtěte naše{' '}
            <button
              type="button"
              onClick={() => setIsGdprModalOpen(true)}
              className="underline hover:text-[var(--barva-primarni)] focus:outline-none cursor-pointer">
              Zásady ochrany osobních údajů
            </button>.
          </p>
        </div>
      </div>
      {errors.gdpr_consent && <p className="error text-red-500 text-center mt-2">{errors.gdpr_consent.message}</p>}
    </div>
        <div className="pt-6 flex justify-center">
          <button 
            type="submit" 
            disabled={isSubmitting || isValidating || usernameValue !== debouncedUsername}
            className="px-6 py-3 md:px-8 md:py-4 rounded-3xl font-semibold text-white bg-[var(--barva-primarni)] md:text-xl cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isValidating || usernameValue !== debouncedUsername ? 'Ověřuji...' : 'Pokračovat'}
          </button>
        </div>
      </form>
      <GDPRModal isOpen={isGdprModalOpen} onClose={() => setIsGdprModalOpen(false)} />
    </div>
  );
}