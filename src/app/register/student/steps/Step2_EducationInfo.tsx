"use client";
import { useForm } from 'react-hook-form';

type FormData = {
  university: string;
  field_of_study: string;
  specialization: string;
  year_of_study: number;
};

type StepProps = {
  onNext: (data: FormData) => void;
};

export default function Step2_EducationInfo({ onNext }: StepProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  return (
    // Používáme stejný hlavní kontejner pro konzistentní vzhled
    <div className='max-w-lg mx-auto py-12 px-8 sm:px-12 rounded-3xl shadow-xl bg-white'>
      <h2 className="text-4xl text-center text-[var(--barva-primarni)] mb-8">Vzdělání</h2>
      
      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        
        <div>
          <input 
            id="university" 
            placeholder="Škola / Univerzita"
            {...register('university', { required: 'Škola je povinná' })} 
            className="input" 
          />
          {errors.university && <p className="error text-center">{errors.university.message}</p>}
        </div>

        <div>
          <input 
            id="field_of_study" 
            placeholder="Obor"
            {...register('field_of_study')} 
            className="input" 
          />
        </div>

        <div>
          <input 
            id="specialization" 
            placeholder="Specializace"
            {...register('specialization')} 
            className="input" 
          />
        </div>

        <div>
          <input 
            id="year_of_study" 
            type="number" 
            placeholder="Ročník"
            {...register('year_of_study', { valueAsNumber: true })} 
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
