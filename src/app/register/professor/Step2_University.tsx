"use client";
import { useForm } from 'react-hook-form';

type FormData = {
  university_name: string;
  faculty_name: string;
  bio: string;
};

type StepProps = {
  onNext: (data: FormData) => void;
  initialData: Partial<FormData>;
  onBack: () => void;
};

export default function Step2_University({ onNext, initialData, onBack }: StepProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      university_name: initialData.university_name || '',
      faculty_name: initialData.faculty_name || '',
      bio: initialData.bio || '',
    }
  });

  return (
    <div className='max-w-lg mx-auto py-6 sm:py-8 md:py-12 px-8 sm:px-12 rounded-3xl shadow-xl bg-white'>
      <h2 className="text-2xl sm:text-3xl md:text-4xl text-center text-[var(--barva-primarni)] mb-2">Univerzita</h2>
      <p className="text-center text-gray-500 mb-6">Kde působíte?</p>
      
      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        <div>
          <input 
            id="university_name" 
            placeholder="Název univerzity (např. VUT Brno) *"
            {...register('university_name', { required: 'Název univerzity je povinný' })} 
            className="input" 
          />
          {errors.university_name && <p className="error text-sm text-red-400 pt-1">{errors.university_name.message}</p>}
        </div>

        <div>
          <input 
            id="faculty_name" 
            placeholder="Název fakulty *"
            {...register('faculty_name', { required: 'Název fakulty je povinný' })} 
            className="input" 
          />
          {errors.faculty_name && <p className="error text-sm text-red-400 pt-1">{errors.faculty_name.message}</p>}
        </div>

        <div>
          <textarea 
            id="bio" 
            rows={4}
            placeholder="Krátké představení (např. Učím marketing a hledám praxi pro studenty...) *"
            {...register('bio', { required: 'Krátké představení je povinné' })} 
            className="input resize-none" 
          />
          {errors.bio && <p className="error text-sm text-red-400 pt-1">{errors.bio.message}</p>}
        </div>

        <div className="pt-6 flex justify-between items-center">
            <button type="button" onClick={onBack} className="text-gray-500 hover:text-gray-800 font-medium px-4">
                Zpět
            </button>
            <button type="submit" className="px-8 py-3 cursor-pointer rounded-full font-semibold text-white bg-[var(--barva-primarni)] hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Pokračovat
            </button>
        </div>
      </form>
    </div>
  );
}
