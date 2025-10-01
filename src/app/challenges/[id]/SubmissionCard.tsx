"use client";

import { Fragment, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../../../lib/supabaseClient';
import { Listbox, Transition } from '@headlessui/react';
import { User, Edit, Clock } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

type StudentProfile = {
    first_name: string; last_name: string; username: string; bio: string | null; university: string | null; field_of_study: string | null;
};

export type Submission = {
  id: string; student_id: string; status: string; link: string | null; file_url: string | null;
  rating: number | null; position: number | null; feedback_comment: string | null; is_favorite: boolean;
  completed_outputs: string[]; 
  is_public_on_profile: boolean;
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
  
  const isReviewed = submission.status === 'reviewed' || submission.status === 'winner' || submission.status === 'rejected';
  const [isEditing, setIsEditing] = useState(submission.status === 'submitted');

  const { control, handleSubmit, formState: { isValid }, reset } = useForm({
    defaultValues: { rating: submission.rating || 0, comment: submission.feedback_comment || '' }
  });

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
      setIsEditing(false);
    }
    setIsSubmitting(false);
  };

  const handleCancelEdit = () => {
    reset({ rating: submission.rating || 0, comment: submission.feedback_comment || '' });
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col h-full gap-4">
      {/* --- HLAVIČKA (vždy stejná) --- */}
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
      </div>
      
      {/* --- POZNÁMKA STUDENTA (vždy zabírá místo) --- */}
      <div className="text-sm min-h-[88px]"> {/* min-h-XX je klíčová třída */}
          <h5 className="font-semibold text-gray-700 mb-1">Poznámka studenta</h5>
          {submission.link ? (
            <blockquote className="bg-gray-50 border-l-4 border-gray-200 text-gray-800 p-3 rounded-r-lg italic">
              <p>{submission.link}</p>
            </blockquote>
          ) : (
            <div className="bg-gray-50 border-l-4 border-transparent p-3 rounded-r-lg">
              <p className="italic text-gray-400">Student nepřidal žádnou poznámku.</p>
            </div>
          )}
      </div>

      {/* --- TLAČÍTKO PRO AKCI (vždy na stejném místě) --- */}
      <div>
        {submission.status === 'submitted' || isReviewed ? (
          <a href={submission.file_url || '#'} target="_blank" rel="noopener noreferrer" className="w-full text-center block px-6 py-2 rounded-full bg-[var(--barva-primarni)] text-white font-semibold hover:bg-blue-700 transition-colors">
            Stáhnout řešení
          </a>
        ) : (
          <button disabled className="w-full text-center px-6 py-2 rounded-full bg-gray-100 text-gray-400 font-semibold cursor-not-allowed">
            Čeká na odevzdání
          </button>
        )}
      </div>
      
      {/* --- FORMULÁŘ HODNOCENÍ (flex-grow vyplní zbytek místa) --- */}
      <form onSubmit={handleSubmit(onConfirmFeedback)} className="border-t border-gray-100 pt-4 space-y-3 flex-grow flex flex-col">
          {submission.status !== 'applied' ? (
            <>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-md font-bold text-gray-800">Hodnocení řešení</h4>
                {!isEditing && isReviewed && (
                  <button type="button" onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-[var(--barva-primarni)] transition-colors">
                    <Edit size={12} /> Upravit
                  </button>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Hodnocení (1-10):</label>
                <Controller
                    name="rating" control={control} rules={{ required: true, min: 1 }}
                    render={({ field }) => (
                    <Listbox value={field.value} onChange={field.onChange} disabled={!isEditing}>
                        <div className="relative w-28">
                        <Listbox.Button className="relative w-full cursor-pointer rounded-lg text-[var(--barva-tmava)] bg-gray-50 py-2 pl-3 pr-10 text-left focus:outline-none border border-gray-200 disabled:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed">
                            <span className="block truncate">{field.value ? `${field.value} / 10` : 'Vyber'}</span>
                            {isEditing && <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><SelectorIcon /></span>}
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
              
              <div className="flex-grow flex flex-col">
                  <label className="text-sm font-medium text-gray-700">Komentář:</label>
                  <Controller
                      name="comment" control={control} rules={{ required: true, minLength: 10 }}
                      render={({ field }) => (
                          <textarea {...field} placeholder="Napište studentovi zpětnou vazbu..." rows={3} className="px-3 py-2 mt-1 w-full text-sm text-[var(--barva-tmava)] border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--barva-primarni)] focus:border-transparent p-2 disabled:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed flex-grow" disabled={!isEditing} />
                      )}
                  />
              </div>
              
              {isEditing && (
                  <div className='flex justify-center pt-2 gap-4'>
                      {isReviewed && <button type="button" onClick={handleCancelEdit} className="px-6 py-2 rounded-full text-gray-600 font-semibold">Zrušit</button>}
                      <button type="submit" disabled={!isValid || isSubmitting} className="px-6 py-2 rounded-full bg-[var(--barva-primarni)] text-white font-semibold disabled:bg-gray-300 cursor-pointer">
                          {isSubmitting ? 'Ukládám...' : 'Uložit hodnocení'}
                      </button>
                  </div>
              )}
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center bg-gray-50 rounded-lg p-4">
              <Clock className="w-8 h-8 text-gray-400 mb-2"/>
              <p className="text-md text-gray-400">Jakmile student odevzdá řešení, budete ho moci ohodnotit.</p>
            </div>
          )}
      </form>
    </div>
  );
}