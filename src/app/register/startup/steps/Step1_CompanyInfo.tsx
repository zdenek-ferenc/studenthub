"use client";
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import GDPRModal from '../../../../components/GDPRModal';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import '@/components/ui/phone-input.css'
import { Controller } from 'react-hook-form';

type FormData = {
  company_name: string;
  ico: string;
  website: string;
  phone_number: string;
  contact_email: string;
  address: string;
  gdpr_consent: boolean;
};

type StepProps = {
  onNext: (data: FormData) => void;
  initialData: FormData; 
};

export default function Step1_CompanyInfo({ onNext, initialData }: StepProps) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<FormData>({
      defaultValues: {
          company_name: initialData.company_name || '',
          ico: initialData.ico || '',
          website: initialData.website || '',
          phone_number: initialData.phone_number || '',
          contact_email: initialData.contact_email || '',
          address: initialData.address || '',
          gdpr_consent: initialData.gdpr_consent || false,
      }
  });

  const [isGdprModalOpen, setIsGdprModalOpen] = useState(false);

  return (
    <div className='max-w-lg mx-auto py-6 sm:py-8 md:py-12 px-8 sm:px-12 rounded-3xl shadow-xl bg-white'>
      <h2 className="text-2xl sm:text-3xl md:text-4xl text-center text-[var(--barva-primarni)] mb-4">Informace o firmě</h2>
      
      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        <p className="text-sm text-gray-400 text-center">Položky označené <span className='text-red-400'>*</span> jsou povinné.</p>
        <div>
          <input 
            id="company_name" 
            placeholder="Název firmy / projektu *"
            {...register('company_name', { required: 'Název firmy je povinný' })} 
            className="input" 
          />
          {errors.company_name && <p className="error text-sm md:text-base pt-2 text-blue-400 text-center">{errors.company_name.message}</p>}
        </div>

        <div>
          <input 
            id="contact_email" 
            type="email"
            placeholder="Kontaktní e-mail *"
            {...register('contact_email', { required: 'Kontaktní e-mail je povinný' })} 
            className="input" 
          />
          {errors.contact_email && <p className="error text-sm md:text-base pt-2 text-blue-400 text-center">{errors.contact_email.message}</p>}
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
          {errors.phone_number && <p className="error text-sm md:text-base pt-2 text-blue-400 text-center">{errors.phone_number.message}</p>}
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
            id="ico" 
            placeholder="IČO"
            {...register('ico')} 
            className="input" 
          />
        </div>

        <div>
          <input 
            id="address" 
            placeholder="Sídlo firmy"
            {...register('address')} 
            className="input" 
          />
        </div>

        <div className="pt-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="gdpr_consent"
                  type="checkbox"
                  {...register('gdpr_consent', { required: 'Pro pokračování je nutné udělit souhlas.' })}
                  className="focus:ring-indigo-500 h-4 w-4 bg-[var(--barva-primarni)] border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-xs md:text-sm">
                <label htmlFor="gdpr_consent" className="font-medium text-gray-700">
                  Souhlasím se zpracováním osobních údajů
                </label>
                <p className="text-gray-500 text-xs">
                  Pro více informací o tom, jak nakládáme s vašimi daty, si přečtěte naše{' '}
                  <button
                    type="button"
                    onClick={() => setIsGdprModalOpen(true)}
                    className="underline hover:text-[var(--barva-primarni)] cursor-pointer focus:outline-none">
                    Zásady ochrany osobních údajů
                  </button>.
                </p>
              </div>
            </div>
            {errors.gdpr_consent && <p className="error text-red-500 text-sm sm:text-base text-center mt-2">{errors.gdpr_consent.message}</p>}
          </div>
        <div className="pt-3 md:pt-6 flex justify-center">
          <button type="submit" className="px-5 py-3 md:px-6 md:py-3 rounded-full font-semibold text-white bg-[var(--barva-primarni)] text-sm sm:text-base md:text-xl cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out disabled:bg-gray-400">Pokračovat</button>
        </div>
      </form>
      <GDPRModal isOpen={isGdprModalOpen} onClose={() => setIsGdprModalOpen(false)} />
    </div>
  );
}