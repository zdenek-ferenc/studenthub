"use client";

import { Fragment, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../../../lib/supabaseClient';
import { Listbox, Transition } from '@headlessui/react';

const SelectorIcon = () => (
    <svg className="h-5 w-5 text-[var(--barva-primarni)] cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
);

type StudentProfile = {
    first_name: string;
    last_name: string;
    username: string;
    bio: string | null;
    university: string | null;
    field_of_study: string | null;
};

export type Submission = {
  id: string;
  status: string;
  link: string | null;
  file_url: string | null;
  rating: number | null;
  position: number | null;
  feedback_comment: string | null;
  StudentProfile: StudentProfile | null;
};

type FeedbackFormData = {
  rating: number;
  position: number;
  comment: string;
};

// OPRAVA: Komponenta teď přijímá i funkci 'onSuccess'
export default function SubmissionCard({ submission, onSuccess }: { submission: Submission, onSuccess: () => void }) {
  const student = submission.StudentProfile;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { isValid } } = useForm<FeedbackFormData>({
    defaultValues: {
      rating: submission.rating || 0,
      position: submission.position || 0,
      comment: submission.feedback_comment || ''
    }
  });

  const isSubmitted = submission.status === 'submitted';
  const isReviewed = submission.status === 'reviewed' || submission.status === 'winner' || submission.status === 'rejected';

  const onConfirmFeedback = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    const { error } = await supabase
      .from('Submission')
      .update({
        rating: data.rating,
        position: data.position,
        feedback_comment: data.comment,
        status: 'reviewed'
      })
      .eq('id', submission.id);

    if (error) {
      alert("Chyba při ukládání hodnocení.");
    } else {
      alert("Hodnocení bylo uloženo.");
      onSuccess(); // Zavoláme funkci od rodiče, aby obnovil data
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-500">
          {student?.first_name?.[0]}{student?.last_name?.[0]}
        </div>
        <div className='flex flex-col gap-2'>
          <p className="text-lg font-bold text-gray-800">{student?.first_name} {student?.last_name}</p>
          <p className="text-sm text-gray-500 -mt-1">@{student?.username}</p>
        </div>
      </div>
      <p className="text-md text-gray-600">{student?.bio}</p>
      <div className="flex flex-wrap text-md gap-2">
        <span className="bg-red-600 text-white flex justify-center px-3 py-1 rounded-2xl">{student?.university}</span>
        <span className="bg-purple-400 text-white flex justify-center px-3 py-1 rounded-2xl">{student?.field_of_study}</span>
      </div>

      {isSubmitted || isReviewed ? (
        <a href={submission.file_url || submission.link || '#'} target="_blank" rel="noopener noreferrer" className="btn-secondary text-[var(--barva-primarni)] font-semibold text-center">
          Stáhnout řešení
        </a>
      ) : (
        <div className='flex justify-center'>
          <button disabled className="inline-block px-6 py-2 rounded-full text-[var(--barva-podtext)] font-semibold">
            Čekáme na řešení...
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onConfirmFeedback)} className="border-t border-gray-100 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Hodnocení:</label>
          <Controller
            name="rating"
            control={control}
            rules={{ min: 1 }}
            render={({ field }) => (
              <Listbox value={field.value} onChange={field.onChange} disabled={isReviewed}>
                <div className="relative w-18">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-lg text-[var(--barva-tmava)] bg-[var(--barva-svetle-pozadi)] py-2 pl-3 pr-10 text-left focus:outline-none disabled:opacity-70">
                    <span className="block truncate">{field.value || '1 - 10'}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><SelectorIcon /></span>
                  </Listbox.Button>
                  <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 focus:outline-none sm:text-sm z-10">
                      {[...Array(10)].map((_, i) => (
                        <Listbox.Option key={i + 1} value={i + 1} className={({ active }) => `relative cursor-default select-none py-2 pl-4 pr-4 ${active ? 'bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)]' : 'text-gray-900'}`}>
                          {i + 1}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            )}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Pořadí:</label>
          <Controller
            name="position"
            control={control}
            rules={{ min: 1 }}
            render={({ field }) => (
              <Listbox value={field.value} onChange={field.onChange} disabled={isReviewed}>
                <div className="relative w-28">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-lg text-[var(--barva-tmava)] bg-[var(--barva-svetle-pozadi)] py-2 pl-3 pr-10 text-left focus:outline-none disabled:opacity-70">
                    <span className="block truncate">{field.value ? `${field.value}. místo` : 'Vyber'}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><SelectorIcon /></span>
                  </Listbox.Button>
                  <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg focus:outline-none sm:text-sm z-10">
                      {[...Array(10)].map((_, i) => (
                        <Listbox.Option key={i + 1} value={i + 1} className={({ active }) => `relative cursor-default select-none py-2 pl-4 pr-4 ${active ? 'bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)]' : 'text-gray-900'}`}>
                          {i + 1}. místo
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            )}
          />
        </div>

        <Controller
            name="comment"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
                <div className='flex flex-col items-start justify-between mt-5'>
                    <label className="text-sm font-medium text-gray-700">Komentář k řešení:</label>
                    <textarea {...field} placeholder="..." rows={2} className="px-3 py-3 mt-3 w-full text-sm text-[var(--barva-tmava)] border-gray-200 bg-[var(--barva-svetle-pozadi)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--barva-primarni)] focus:border-transparent p-2 disabled:opacity-70" disabled={isReviewed} />
                </div>
            )}
        />
        
        {!isReviewed && (
            <div className='flex justify-center mt-6'>
                <button type="submit" disabled={!isValid || isSubmitting} className="px-6 py-2 rounded-full bg-[var(--barva-primarni)] text-white font-semibold disabled:bg-gray-300 cursor-pointer">
                    {isSubmitting ? 'Ukládám...' : 'Potvrdit'}
                </button>
            </div>
        )}
      </form>
    </div>
  );
}
