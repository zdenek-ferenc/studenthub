"use client";
import { useForm } from 'react-hook-form';

// Změnili jsme typ, aby odpovídal polím pro startup
type FormData = {
  company_name: string;
  ico: string;
  website: string;
  phone_number: string;
  contact_email: string;
  address: string;
};

type StepProps = {
  onNext: (data: FormData) => void;
};

export default function Step1_CompanyInfo({ onNext }: StepProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  return (
    // Používáme stejný hlavní kontejner pro konzistentní vzhled
    <div className='max-w-lg mx-auto py-12 px-8 sm:px-12 rounded-3xl shadow-xl bg-white'>
      <h2 className="text-4xl text-center text-[var(--barva-primarni)] mb-8">Informace o firmě</h2>
      
      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        
        <div>
          <input 
            id="company_name" 
            placeholder="Název firmy"
            {...register('company_name', { required: 'Název firmy je povinný' })} 
            className="input" 
          />
          {errors.company_name && <p className="error text-center">{errors.company_name.message}</p>}
        </div>

        <div>
          <input 
            id="ico" 
            placeholder="IČO"
            {...register('ico')} 
            className="input" 
          />
        </div>

        <div>
          <input 
            id="website" 
            placeholder="Webová stránka"
            {...register('website')} 
            className="input" 
          />
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
            id="contact_email" 
            type="email"
            placeholder="Kontaktní e-mail"
            {...register('contact_email', { required: 'Kontaktní e-mail je povinný' })} 
            className="input" 
          />
           {errors.contact_email && <p className="error text-center">{errors.contact_email.message}</p>}
        </div>

        <div>
          <input 
            id="address" 
            placeholder="Sídlo firmy"
            {...register('address')} 
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
