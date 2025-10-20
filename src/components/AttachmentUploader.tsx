"use client";
import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { UploadCloud, File, X} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

type AttachmentUploaderProps = {
    challengeId: string | null;
    initialFiles: string[];
    onUploadComplete: (urls: string[]) => void;
};

const sanitizeFileName = (filename: string) => {
    const withoutDiacritics = filename.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return withoutDiacritics.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-._]/g, '');
};

const getFileNameFromUrl = (url: string) => {
    try {
        const name = url.split('/').pop()?.split('-').slice(1).join('-') || 'Soubor';
        return decodeURIComponent(name);
    } catch { return 'Soubor'; }
};

export default function AttachmentUploader({ challengeId, initialFiles, onUploadComplete }: AttachmentUploaderProps) {
    const { user, showToast } = useAuth();
    const [files, setFiles] = useState<string[]>(initialFiles);
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!user || !challengeId) {
            showToast("Pro nahrání souborů musíte být přihlášeni a výzva musí být uložena.", "error");
            return;
        }
        setIsUploading(true);
        const uploadedUrls: string[] = [...files];

        for (const file of acceptedFiles) {
            const cleanFileName = sanitizeFileName(file.name);
            const filePath = `public/${challengeId}/${Date.now()}-${cleanFileName}`;

            const { data, error } = await supabase.storage
                .from('challenge-attachments')
                .upload(filePath, file);

            if (error) {
                showToast(`Nahrávání selhalo: ${error.message}`, 'error');
            } else {
                const { data: { publicUrl } } = supabase.storage
                    .from('challenge-attachments')
                    .getPublicUrl(data.path);
                uploadedUrls.push(publicUrl);
            }
        }
        setFiles(uploadedUrls);
        onUploadComplete(uploadedUrls);
        setIsUploading(false);

    }, [user, challengeId, showToast, files, onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/zip': ['.zip'] }
    });

    const removeFile = (urlToRemove: string) => {
        const newFiles = files.filter(url => url !== urlToRemove);
        setFiles(newFiles);
        onUploadComplete(newFiles);
    };

    return (
        <div>
            <div {...getRootProps()}
                className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-[var(--barva-primarni)] bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
            >
                <input {...getInputProps()} />
                <UploadCloud className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                {isUploading ? (
                    <p className="font-semibold text-gray-600">Nahrávám...</p>
                ) : (
                    <>
                        <p className="font-semibold text-gray-600">Přetáhněte ZIP soubor sem, nebo klikněte pro výběr</p>
                        <p className="text-sm text-gray-500 mt-1">Doporučujeme všechny podklady (loga, brandbook,...) sbalit do jednoho ZIP souboru.</p>
                    </>
                )}
            </div>
            {files.length > 0 && (
                <div className="mt-4 space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700">Nahrané soubory:</h4>
                    {files.map((url, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                            <div className="flex items-center gap-2">
                                <File className="w-5 h-5 text-gray-500" />
                                <span className="text-sm font-medium text-gray-800">{getFileNameFromUrl(url)}</span>
                            </div>
                            <button type="button" onClick={() => removeFile(url)}>
                                <X className="w-5 h-5 text-gray-400 hover:text-red-500" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}