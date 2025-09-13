"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../../lib/supabaseClient'; 
import { useAuth } from '../../../contexts/AuthContext';
import ConfirmationModal from '../../../components/ConfirmationModal';
import type { Submission } from './SubmissionCard'; // Importujeme typ pro Submission

type SubmissionFormData = {
  link: string;
  file_url: string | null;
};

type SubmissionFormProps = {
  challengeId: string;
  submissionId: string;
  initialSubmission: Submission | null;
  // OPRAVA: onSuccess nyní přijímá aktualizovaná data
  onSuccess: (updatedSubmission: Submission) => void;
};

export default function SubmissionForm({ challengeId, submissionId, initialSubmission, onSuccess }: SubmissionFormProps) {
  const { user, showToast } = useAuth();
  const { register, handleSubmit, setValue, getValues } = useForm<SubmissionFormData>({
    defaultValues: {
      link: initialSubmission?.link || '',
      file_url: initialSubmission?.file_url || null
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string, url: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmitted = initialSubmission?.status === 'submitted';

  useEffect(() => {
    if (initialSubmission?.file_url) {
      const url = initialSubmission.file_url;
      const name = url.split('/').pop()?.split('-').slice(1).join('-') || 'Odevzdaný soubor';
      setUploadedFile({ name, url });
    }
  }, [initialSubmission]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !user) return;
    setIsUploading(true);
    const file = event.target.files[0];
    const filePath = `${user.id}/${challengeId}/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage.from('submission-files').upload(filePath, file);

    if (error) {
      showToast(`Nahrávání selhalo: ${error.message}`, 'error');
    } else {
      const { data: { publicUrl } } = supabase.storage.from('submission-files').getPublicUrl(data.path);
      setUploadedFile({ name: file.name, url: publicUrl });
      setValue('file_url', publicUrl);
      showToast("Soubor byl úspěšně nahrán!", 'success');
    }
    setIsUploading(false);
  };

  const handleFileDelete = async () => {
    if (!uploadedFile) return;
    const filePath = uploadedFile.url.split('/submission-files/')[1];
    
    const { error } = await supabase.storage.from('submission-files').remove([filePath]);

    if (error) {
      showToast(`Smazání souboru selhalo: ${error.message}`, 'error');
    } else {
      setUploadedFile(null);
      setValue('file_url', null);
      showToast("Soubor byl úspěšně smazán.", 'success');
    }
  };
  
  const onTriggerSubmit = () => {
    setIsModalOpen(true);
  };

  const onConfirmSubmit = async () => {
    setIsModalOpen(false);
    setIsSubmitting(true);
    
    const data = getValues();

    // OPRAVA: Použijeme .select() abychom dostali zpět aktualizovaná data
    const { data: updatedSubmission, error } = await supabase
      .from('Submission')
      .update({
        link: data.link,
        file_url: uploadedFile?.url || null,
        submitted_at: new Date().toISOString(),
        status: 'submitted'
      })
      .eq('id', submissionId)
      .select('*, StudentProfile(*)') // Chceme zpět kompletní data
      .single();

    if (error) {
      showToast(`Odevzdání se nezdařilo: ${error.message}`, 'error');
    } else if (updatedSubmission) {
      showToast("Řešení bylo úspěšně odevzdáno!", 'success');
      // OPRAVA: Předáme nová data zpět rodiči
      onSuccess(updatedSubmission as Submission);
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mt-8">
        <h2 className="text-2xl font-bold text-center text-[var(--barva-tmava)] mb-6">
          {isSubmitted ? 'Odevzdané řešení' : 'Odevzdat řešení'}
        </h2>
        <form onSubmit={handleSubmit(onTriggerSubmit)} className="space-y-6">
          <div>
            <textarea 
              {...register('link')} 
              placeholder="Napiš krátký text nebo vlož odkaz na řešení (GitHub, Figma...)"
              className="w-full min-h-[100px] rounded-lg border border-gray-200 bg-gray-50 p-3 text-base text-[var(--barva-tmava)] placeholder-gray-400 transition-colors focus:border-[var(--barva-primarni)] focus:ring-1 focus:ring-[var(--barva-primarni)] focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
              disabled={isSubmitted}
            />
          </div>
          
          <div>
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
                <input type="file" id="submissionFile" onChange={handleFileUpload} disabled={isUploading} className="hidden" accept=".zip" />
                <label htmlFor="submissionFile" className="w-full flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[var(--barva-primarni)] hover:bg-blue-50 transition-colors">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-[var(--barva-primarni)] text-[var(--barva-primarni)] font-bold text-lg">+</span>
                  <span className="font-semibold text-[var(--barva-primarni)]">{isUploading ? 'Nahrávám...' : 'Připojit přílohu'}</span>
                </label>
                <p className="text-xs text-gray-500 mt-2">Prosím, nahrajte všechny soubory sbalené do jednoho ZIP archivu.</p>
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