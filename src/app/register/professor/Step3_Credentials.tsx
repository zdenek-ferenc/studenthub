"use client";
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type FormData = {
  email: string;
  password: string;
  confirm_password: string;
};

type StepProps = {
  onSubmit: (data: FormData) => void;
  onBack: () => void;
  isLoading: boolean;
};

export default function Step3_Credentials({ onSubmit, onBack, isLoading }: StepProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const password = watch('password');

  return (
    <div className='max-w-lg mx-auto py-6 sm:py-8 md:py-12 px-8 sm:px-12 rounded-3xl shadow-xl bg-white'>
      <h2 className="text-2xl sm:text-3xl md:text-4xl text-center text-[var(--barva-primarni)] mb-2">Přihlašovací údaje</h2>
      <p className="text-center text-gray-500 mb-6">Zabezpečte svůj účet.</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input 
            id="email" 
            type="email"
            placeholder="Email *"
            {...register('email', { 
                required: 'Email je povinný',
                pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Neplatný formát emailu"
                }
            })} 
            className="input" 
          />
          {errors.email && <p className="error text-sm text-red-400 pt-1">{errors.email.message}</p>}
        </div>

        <div className="relative">
          <input 
            id="password" 
            type={showPassword ? "text" : "password"}
            placeholder="Heslo (min. 6 znaků) *"
            {...register('password', { 
                required: 'Heslo je povinné',
                minLength: {
                    value: 6,
                    message: "Heslo musí mít alespoň 6 znaků"
                }
            })} 
            className="input pr-10" 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {errors.password && <p className="error text-sm text-red-400 pt-1">{errors.password.message}</p>}
        </div>

        <div className="relative">
          <input 
            id="confirm_password" 
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Potvrzení hesla *"
            {...register('confirm_password', { 
                required: 'Potvrzení hesla je povinné',
                validate: value => value === password || "Hesla se neshodují"
            })} 
            className="input pr-10" 
          />
           <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {errors.confirm_password && <p className="error text-sm text-red-400 pt-1">{errors.confirm_password.message}</p>}
        </div>

        <div className="pt-6 flex justify-between items-center">
            <button type="button" onClick={onBack} disabled={isLoading} className="text-gray-500 hover:text-gray-800 font-medium px-4 disabled:opacity-50">
                Zpět
            </button>
            <button type="submit" disabled={isLoading} className="px-8 py-3 rounded-full font-semibold text-white bg-[var(--barva-primarni)] hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed">
                {isLoading ? 'Registruji...' : 'Dokončit registraci'}
            </button>
        </div>
      </form>
    </div>
  );
}
