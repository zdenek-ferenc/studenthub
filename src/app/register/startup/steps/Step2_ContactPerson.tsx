"use client";
import { useForm } from 'react-hook-form';

// Typ pro data z tohoto kroku
type FormData = {
  contact_first_name: string;
  contact_last_name: string;
  contact_position: string;
};

type StepProps = {
  onNext: (data: FormData) => void;
};

export default function Step2_ContactPerson({ onNext }: StepProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  return (
    // Používáme stejný hlavní kontejner pro konzistentní vzhled
    <div className='max-w-lg mx-auto py-12 px-8 sm:px-12 rounded-3xl shadow-xl bg-white'>
      <h2 className="text-4xl text-center text-[var(--barva-primarni)] mb-8">Kontaktní osoba</h2>
      
      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        
        <div>
          <input 
            id="contact_first_name" 
            placeholder="Jméno"
            {...register('contact_first_name', { required: 'Jméno je povinné' })} 
            className="input" 
          />
          {errors.contact_first_name && <p className="error text-center">{errors.contact_first_name.message}</p>}
        </div>

        <div>
          <input 
            id="contact_last_name" 
            placeholder="Příjmení"
            {...register('contact_last_name', { required: 'Příjmení je povinné' })} 
            className="input" 
          />
          {errors.contact_last_name && <p className="error text-center">{errors.contact_last_name.message}</p>}
        </div>

        <div>
          <input 
            id="contact_position" 
            placeholder="Pozice ve firmě"
            {...register('contact_position')} 
            className="input" 
          />
        </div>

        <div className="pt-6 flex justify-center">
          <button type="submit" className="px-6 py-3 md:px-8 md:py-4 rounded-3xl bg-[var(--barva-primarni)] md:text-xl text-white font-semibold shadow-sm hover:opacity-90 transition-all duration-300 ease-in-out">Pokračovat</button>
        </div>
      </form>
    </div>
  );
}
