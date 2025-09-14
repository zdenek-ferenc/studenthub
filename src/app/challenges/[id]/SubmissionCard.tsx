"use client";

import { Fragment, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../../../lib/supabaseClient';
import { Listbox, Transition } from '@headlessui/react';
import { User } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

// Typy zůstávají stejné, jen se už nepoužívá is_favorite
type StudentProfile = {
    first_name: string; last_name: string; username: string; bio: string | null; university: string | null; field_of_study: string | null;
};
export type Submission = {
  id: string; student_id: string; status: string; link: string | null; file_url: string | null;
  rating: number | null; position: number | null; feedback_comment: string | null; is_favorite: boolean;
  StudentProfile: StudentProfile | null;
};

const SelectorIcon = () => (
    <svg className="h-5 w-5 text-[var(--barva-primarni)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.53 8.28a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.72 9.53a.75.75 0 011.06 0L10 15.19l2.47-2.47a.75.75 0 111.06 1.06l-3 3a.75.75 0 01-1.06 0l-3-3a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
);

export default function SubmissionCard({ submission, onUpdate, anonymousId }: { submission: Submission, onUpdate: (updatedSubmission: Submission) => void, anonymousId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useAuth();

  const { control, handleSubmit, formState: { isValid } } = useForm({
    defaultValues: { rating: submission.rating || 0, comment: submission.feedback_comment || '' }
  });

  const isReviewed = submission.status === 'reviewed' || submission.status === 'winner' || submission.status === 'rejected';
  const isSubmitted = submission.status === 'submitted';

  const onConfirmFeedback = async (data: { rating: number, comment: string }) => {
    setIsSubmitting(true);
    const { data: updatedSubmission, error } = await supabase
      .from('Submission')
      .update({ rating: data.rating, feedback_comment: data.comment, status: 'reviewed' })
      .eq('id', submission.id)
      .select('*, StudentProfile(*)')
      .single();

    if (error) {
      showToast(`Chyba: ${error.message}`, 'error');
    } else if (updatedSubmission) {
      onUpdate(updatedSubmission as Submission);
      showToast("Hodnocení bylo úspěšně uloženo.", 'success');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col gap-4">
      <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-500">
                    <User size={24} />
                </div>
                <div>
                    <p className="text-lg font-bold text-gray-800">{anonymousId}</p>
                    <p className="text-sm text-gray-500">Anonymní student</p>
                </div>
            </div>
            {/* Hvězdička pro favority je pryč */}
      </div>      
      {submission.link && (
        <div className="text-sm">
          <h5 className="font-semibold text-gray-700 mb-1">Poznámka studenta</h5>
          <blockquote className="bg-gray-50 border-l-4 border-gray-200 text-gray-800 p-3 rounded-r-lg italic">
            <p>{submission.link}</p>
          </blockquote>
        </div>
      )}

      {isSubmitted || isReviewed ? (
        <a href={submission.file_url || '#'} target="_blank" rel="noopener noreferrer" className="w-full text-center px-6 py-2 rounded-full bg-[var(--barva-primarni)] text-white font-semibold hover:bg-blue-700 transition-colors">
          Stáhnout řešení
        </a>
      ) : (
        <div className='flex justify-center'>
          <button disabled className="w-full text-center px-6 py-2 rounded-full bg-gray-100 text-gray-400 font-semibold">
            Čeká na odevzdání
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onConfirmFeedback)} className="border-t border-gray-100 pt-4 space-y-3">
          <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Hodnocení:</label>
          <Controller
              name="rating" control={control} rules={{ required: true, min: 1 }}
              render={({ field }) => (
              <Listbox value={field.value} onChange={field.onChange} disabled={isReviewed}>
                  <div className="relative w-28">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-lg text-[var(--barva-tmava)] bg-gray-50 py-2 pl-3 pr-10 text-left focus:outline-none disabled:opacity-70 border border-gray-200">
                      <span className="block truncate">{field.value ? `${field.value} / 10` : 'Vyber'}</span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><SelectorIcon /></span>
                  </Listbox.Button>
                  <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                      <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
                      {[...Array(10)].map((_, i) => (
                          <Listbox.Option key={i + 1} value={i + 1} className={({ active }) => `relative cursor-default select-none py-2 pl-4 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}`}>{i + 1}</Listbox.Option>
                      ))}
                      </Listbox.Options>
                  </Transition>
                  </div>
              </Listbox>
              )}
          />
          </div>
          
          <Controller
              name="comment" control={control} rules={{ required: true, minLength: 10 }}
              render={({ field }) => (
                  <div className='flex flex-col items-start justify-between mt-2'>
                      <label className="text-sm font-medium text-gray-700">Komentář k řešení:</label>
                      <textarea {...field} placeholder="Napište studentovi zpětnou vazbu..." rows={3} className="px-3 py-2 mt-1 w-full text-sm text-[var(--barva-tmava)] border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--barva-primarni)] focus:border-transparent p-2 disabled:opacity-70" disabled={isReviewed} />
                  </div>
              )}
          />
          
          {!isReviewed && (
              <div className='flex justify-center pt-2'>
                  <button type="submit" disabled={!isValid || isSubmitting} className="px-6 py-2 rounded-full bg-[var(--barva-primarni)] text-white font-semibold disabled:bg-gray-300 cursor-pointer">
                      {isSubmitting ? 'Ukládám...' : 'Uložit hodnocení'}
                  </button>
              </div>
          )}
      </form>
    </div>
  );
}
