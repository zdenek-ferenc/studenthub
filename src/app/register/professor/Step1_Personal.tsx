"use client";
import { useForm, Controller } from 'react-hook-form';
import DynamicTitleInput from '../../../components/ui/DynamicTitleInput';

type FormData = {
  title_before: string;
  first_name: string;
  last_name: string;
  title_after: string;
};

type StepProps = {
  onNext: (data: FormData) => void;
  initialData: Partial<FormData>;
};

export default function Step1_Personal({ onNext, initialData }: StepProps) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      title_before: initialData.title_before || '',
      first_name: initialData.first_name || '',
      last_name: initialData.last_name || '',
      title_after: initialData.title_after || '',
    }
  });

  return (
    <div className='max-w-lg mx-auto py-6 sm:py-8 md:py-12 px-8 sm:px-12 rounded-3xl shadow-xl bg-white'>
      <h2 className="text-2xl sm:text-3xl md:text-4xl text-center text-[var(--barva-primarni)] mb-2">Osobní údaje</h2>
      <p className="text-center text-gray-500 mb-8">Představte se nám.</p>
      
      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        
        {/* Titul před */}
        <div>
            <label htmlFor="title_before" className="block text-sm font-medium text-gray-700 mb-3">
                Tituly před jménem
            </label>
            <Controller
                name="title_before"
                control={control}
                render={({ field }) => (
                    <DynamicTitleInput 
                        value={field.value} 
                        onChange={field.onChange} 
                        placeholder="..."
                    />
                )}
            />
        </div>

        {/* Jméno a Příjmení */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-3">
                    Jméno <span className="text-red-500">*</span>
                </label>
                <input 
                    id="first_name" 
                    {...register('first_name', { required: 'Jméno je povinné' })} 
                    className="input !py-2" placeholder="..."
                />
                {errors.first_name && <p className="error text-sm text-red-400 pt-1">{errors.first_name.message}</p>}
            </div>

            <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-3">
                    Příjmení <span className="text-red-500">*</span>
                </label>
                <input 
                    id="last_name" 
                    {...register('last_name', { required: 'Příjmení je povinné' })} 
                    className="input !py-2"  placeholder="..."
                />
                {errors.last_name && <p className="error text-sm text-red-400 pt-1">{errors.last_name.message}</p>}
            </div>
        </div>

        {/* Titul za */}
        <div>
            <label htmlFor="title_after" className="block text-sm font-medium text-gray-700 mb-3">
                Tituly za jménem
            </label>
            <Controller
                name="title_after"
                control={control}
                render={({ field }) => (
                    <DynamicTitleInput 
                        value={field.value} 
                        onChange={field.onChange} 
                        placeholder="..."
                    />
                )}
            />
        </div>

        <div className="pt-6 flex justify-center">
          <button type="submit" className="px-8 py-3 cursor-pointer rounded-full font-semibold text-white bg-[var(--barva-primarni)] hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Pokračovat
          </button>
        </div>
      </form>
    </div>
  );
}
