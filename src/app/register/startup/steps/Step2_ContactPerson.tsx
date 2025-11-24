"use client";
import { useForm } from 'react-hook-form';

type FormData = {
  contact_first_name: string;
  contact_last_name: string;
  contact_position: string;
};

type StepProps = {
  onNext: (data: FormData) => void;
  initialData: FormData; 
};

export default function Step2_ContactPerson({ onNext, initialData }: StepProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
      defaultValues: {
          contact_first_name: initialData.contact_first_name || '',
          contact_last_name: initialData.contact_last_name || '',
          contact_position: initialData.contact_position || '',
      }
  });

  return (
    <div className='max-w-lg mx-auto py-6 sm:py-8 md:py-12 px-8 sm:px-12 rounded-3xl shadow-xl bg-white'>
      <h2 className="text-2xl sm:text-3xl md:text-4xl text-center text-[var(--barva-primarni)] mb-4">Kontaktní osoba</h2>
      
      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        <p className="text-sm text-gray-400 text-center">Položky označené <span className='text-red-400'>*</span> jsou povinné.</p>
        <div>
          <input 
            id="contact_first_name" 
            placeholder="Jméno *"
            {...register('contact_first_name', { required: 'Jméno je povinné' })} 
            className="input" 
          />
          {errors.contact_first_name && <p className="error pt-2 text-blue-400 text-center">{errors.contact_first_name.message}</p>}
        </div>

        <div>
          <input 
            id="contact_last_name" 
            placeholder="Příjmení *"
            {...register('contact_last_name', { required: 'Příjmení je povinné' })} 
            className="input" 
          />
          {errors.contact_last_name && <p className="error pt-2 text-blue-400 text-center">{errors.contact_last_name.message}</p>}
        </div>

        <div>
          <input 
            id="contact_position" 
            placeholder="Pozice ve firmě"
            {...register('contact_position')} 
            className="input" 
          />
        </div>
        

        <div className="pt-3 md:pt-6 flex justify-center">
          <button type="submit" className="px-5 py-3 md:px-6 md:py-3 rounded-full font-semibold text-white bg-[var(--barva-primarni)] text-sm sm:text-base md:text-xl cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out disabled:bg-gray-400">Pokračovat</button>
        </div>
      </form>
    </div>
  );
}