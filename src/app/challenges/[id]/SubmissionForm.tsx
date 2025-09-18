"use client";

import { useState, useEffect, Fragment, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../../lib/supabaseClient'; 
import { useAuth } from '../../../contexts/AuthContext';
import ConfirmationModal from '../../../components/ConfirmationModal';
import type { Submission } from './SubmissionCard';
import { Check, Square, Info } from 'lucide-react';
import { Popover, Transition } from '@headlessui/react';
import { useDebounce } from '../../../hooks/useDebounce';

type SubmissionFormData = {
  link: string;
  file_url: string | null;
  completed_outputs: string[];
};

type SubmissionFormProps = {
  challengeId: string;
  submissionId: string;
  initialSubmission: Submission | null;
  expectedOutputs: string[];
  onSuccess: (updatedSubmission: Submission) => void;
};

const ChecklistItem = ({ text, isChecked, onToggle, isSubmitted }: { text: string; isChecked: boolean; onToggle: () => void; isSubmitted: boolean; }) => {
  return (
    <div 
      onClick={!isSubmitted ? onToggle : undefined} 
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
        isChecked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
      } ${!isSubmitted ? 'hover:border-blue-400' : 'cursor-default'}`}
    >
      <div className="mt-0.5">
        {isChecked ? <Check className="w-5 h-5 text-green-600" /> : <Square className="w-5 h-5 text-gray-400" />}
      </div>
      <p className={`flex-1 ${isChecked ? 'text-gray-800 line-through' : 'text-gray-800'}`}>
        {text}
      </p>
    </div>
  );
};


export default function SubmissionForm({ challengeId, submissionId, initialSubmission, expectedOutputs, onSuccess }: SubmissionFormProps) {
  const { user, showToast } = useAuth();
  const { register, handleSubmit, setValue, getValues, watch } = useForm<SubmissionFormData>({
    defaultValues: {
      link: initialSubmission?.link || '',
      file_url: initialSubmission?.file_url || null,
      completed_outputs: initialSubmission?.completed_outputs || [],
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string, url: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [lastSavedData, setLastSavedData] = useState({
      link: initialSubmission?.link || '',
      completed_outputs: initialSubmission?.completed_outputs || [],
  });

  const isSubmitted = initialSubmission?.status === 'submitted';
  
  const completedOutputs = watch('completed_outputs');
  const linkText = watch('link');

  const debouncedCompletedOutputs = useDebounce(completedOutputs, 1500);
  const debouncedLinkText = useDebounce(linkText, 2000);

  const autoSaveSubmission = useCallback(async (dataToSave: Partial<SubmissionFormData>) => {
      if (!initialSubmission || isSubmitted) return;

      setIsSaving(true);
      setSaveStatus('idle');

      const { error } = await supabase
          .from('Submission')
          .update(dataToSave)
          .eq('id', submissionId);

      setIsSaving(false);
      if (error) {
          showToast("Chyba při automatickém ukládání.", "error");
      } else {
          setLastSavedData(prev => ({ ...prev, ...dataToSave }));
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
      }
  }, [submissionId, initialSubmission, isSubmitted, showToast]);

  useEffect(() => {
    const lastSavedSet = new Set(lastSavedData.completed_outputs);
    const debouncedSet = new Set(debouncedCompletedOutputs);
    const areSetsEqual = lastSavedSet.size === debouncedSet.size && [...lastSavedSet].every(value => debouncedSet.has(value));

    if (!areSetsEqual) {
        autoSaveSubmission({ completed_outputs: debouncedCompletedOutputs });
    }
  }, [debouncedCompletedOutputs, autoSaveSubmission, lastSavedData.completed_outputs]);

  useEffect(() => {
    if (debouncedLinkText !== lastSavedData.link) {
        autoSaveSubmission({ link: debouncedLinkText });
    }
  }, [debouncedLinkText, autoSaveSubmission, lastSavedData.link]);


  useEffect(() => {
    if (initialSubmission?.file_url) {
      const url = initialSubmission.file_url;
      const name = url.split('/').pop()?.split('-').slice(1).join('-') || 'Odevzdaný soubor';
      setUploadedFile({ name, url });
    }
  }, [initialSubmission]);

  const handleToggleOutput = (outputText: string) => {
    const currentCompleted = getValues('completed_outputs');
    const newCompleted = new Set(currentCompleted);
    if (newCompleted.has(outputText)) {
      newCompleted.delete(outputText);
    } else {
      newCompleted.add(outputText);
    }
    setValue('completed_outputs', Array.from(newCompleted), { shouldDirty: true });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !user) return;
    setIsUploading(true);
    const file = event.target.files[0];
    const filePath = `${user.id}/${challengeId}/${Date.now()}-${file.name}`;

    const { data: storageData, error: storageError } = await supabase.storage.from('submission-files').upload(filePath, file);

    if (storageError) {
      showToast(`Nahrávání selhalo: ${storageError.message}`, 'error');
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('submission-files').getPublicUrl(storageData.path);
    
    // --- ZMĚNA ZDE: Uložíme URL rovnou do databáze ---
    const { error: dbError } = await supabase
      .from('Submission')
      .update({ file_url: publicUrl })
      .eq('id', submissionId);

    if (dbError) {
        showToast("Soubor se nahrál, ale nepodařilo se ho uložit k odevzdání.", "error");
    } else {
        setUploadedFile({ name: file.name, url: publicUrl });
        setValue('file_url', publicUrl);
        showToast("Soubor byl úspěšně nahrán a uložen!", 'success');
    }
    setIsUploading(false);
  };

  const handleFileDelete = async () => {
    if (!uploadedFile) return;
    const filePath = uploadedFile.url.split('/submission-files/')[1];
    
    const { error: storageError } = await supabase.storage.from('submission-files').remove([filePath]);

    if (storageError) {
      showToast(`Smazání souboru selhalo: ${storageError.message}`, 'error');
      return;
    }
    
    // --- ZMĚNA ZDE: Po smazání souboru aktualizujeme i databázi ---
    const { error: dbError } = await supabase
        .from('Submission')
        .update({ file_url: null })
        .eq('id', submissionId);

    if (dbError) {
        showToast("Soubor byl smazán, ale změna se neuložila. Zkuste obnovit stránku.", "error");
    } else {
        setUploadedFile(null);
        setValue('file_url', null);
        showToast("Soubor byl úspěšně smazán.", 'success');
    }
  };
  
  const onTriggerSubmit = async () => {
    if(isSaving) {
        showToast("Počkejte prosím na dokončení ukládání...", "error");
        return;
    }
    await autoSaveSubmission(getValues());
    setIsModalOpen(true);
  };

  const onConfirmSubmit = async () => {
    setIsModalOpen(false);
    setIsSubmitting(true);
    
    const data = getValues();

    const { data: updatedSubmission, error } = await supabase
      .from('Submission')
      .update({
        link: data.link,
        file_url: uploadedFile?.url || null,
        submitted_at: new Date().toISOString(),
        status: 'submitted',
        completed_outputs: data.completed_outputs,
      })
      .eq('id', submissionId)
      .select('*, StudentProfile(*)')
      .single();

    if (error) {
      showToast(`Odevzdání se nezdařilo: ${error.message}`, 'error');
    } else if (updatedSubmission) {
      showToast("Řešení bylo úspěšně odevzdáno!", 'success');
      onSuccess(updatedSubmission as Submission);
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mt-8">
        <h2 className="text-2xl font-bold text-center text-[var(--barva-tmava)] mb-6">
          {isSubmitted ? 'Tvoje odevzdané řešení' : 'Odevzdat řešení'}
        </h2>
        <form onSubmit={handleSubmit(onTriggerSubmit)} className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
                <div>
                    <label className="block text-lg font-semibold text-gray-800">Checklist výstupů</label>
                    <p className="text-sm text-gray-500">Odškrtávej si úkoly, ať na nic nezapomeneš. Tvůj postup se automaticky ukládá.</p>
                </div>
            </div>
            <div className="space-y-2">
              {expectedOutputs.map((output, index) => (
                <ChecklistItem 
                  key={index}
                  text={output}
                  isChecked={completedOutputs.includes(output)}
                  onToggle={() => handleToggleOutput(output)}
                  isSubmitted={isSubmitted}
                />
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-3">
                <label className="block text-lg font-semibold text-gray-800">Doplňující informace</label>
            </div>
            <textarea 
              {...register('link')} 
              placeholder="Vlož odkaz na řešení (GitHub, Figma...) nebo napiš krátkou zprávu pro startup."
              className="w-full min-h-[100px] rounded-lg border border-gray-200 bg-gray-50 p-3 text-base text-[var(--barva-tmava)] placeholder-gray-400 transition-colors focus:border-[var(--barva-primarni)] focus:ring-1 focus:ring-[var(--barva-primarni)] focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
              disabled={isSubmitted}
            />
          </div>
          
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3">Nahrání souborů</label>
            {uploadedFile && (
              <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md text-sm">
                <span className="font-medium text-gray-700 truncate pr-2">{uploadedFile.name}</span>
                {!isSubmitted && (
                  <button type="button" onClick={handleFileDelete} className="text-red-500 hover:text-red-700 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            )}

            {!isSubmitted && !uploadedFile && (
              <>
                <input type="file" id="submissionFile" onChange={handleFileUpload} disabled={isUploading} className="hidden" accept=".zip,.rar,.7z" />
                <label htmlFor="submissionFile" className="w-full flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[var(--barva-primarni)] hover:bg-blue-50 transition-colors">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-[var(--barva-primarni)] text-[var(--barva-primarni)] font-bold text-lg">+</span>
                  <span className="font-semibold text-[var(--barva-primarni)]">{isUploading ? 'Nahrávám...' : 'Připojit přílohu'}</span>
                </label>
                
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-gray-500">Prosím, nahrajte všechny soubory sbalené do jednoho ZIP archivu.</p>
                  <Popover className="relative">
                    {({ }) => (
                      <>
                        <Popover.Button className="focus:outline-none">
                           <Info className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-pointer" />
                        </Popover.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="opacity-0 translate-y-1"
                          enterTo="opacity-100 translate-y-0"
                          leave="transition ease-in duration-150"
                          leaveFrom="opacity-100 translate-y-0"
                          leaveTo="opacity-0 translate-y-1"
                        >
                          <Popover.Panel className="absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 transform px-4 sm:px-0">
                            <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                              <div className="bg-white p-4">
                                <p className="text-sm font-medium text-gray-900">
                                  Jak vytvořit ZIP?
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                  Vyberte soubory, klikněte na ně pravým tlačítkem a zvolte možnost „Komprimovat do ZIP“ (nebo „Přidat do archivu“ podle systému).
                                </p>
                                <a
                                  href="https://support.microsoft.com/cs-cz/windows/zazipov%C3%A1n%C3%AD-a-rozzipov%C3%A1n%C3%AD-soubor%C5%AF-8d28fa72-f2f9-712f-67df-f80cf89fd4e5"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800"
                                >
                                  Celý návod &rarr;
                                </a>
                              </div>
                            </div>
                          </Popover.Panel>
                        </Transition>
                      </>
                    )}
                  </Popover>
                </div>

              </>
            )}
          </div>

          {!isSubmitted && (
            <div className="pt-4 flex justify-center">
              <button type="submit" disabled={isSubmitting} className="mt-6 text-2xl px-6 py-3 rounded-full bg-[var(--barva-primarni)] text-white font-semibold cursor-pointer">
                {isSubmitting ? 'Odevzdávám...' : 'Odevzdat řešení'}
              </button>
            </div>
          )}
        </form>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={onConfirmSubmit}
        title="Opravdu chcete odevzdat řešení?"
        message="Tato akce je nevratná. Po odevzdání již nebudete moci řešení upravovat."
      />
    </>
  );
}