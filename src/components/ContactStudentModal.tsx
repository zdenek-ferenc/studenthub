"use client";

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Send, Loader2 } from 'lucide-react';

type ContactModalProps = {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
    challengeId: string | null;
    onSuccess: () => void;
    startupCompanyName: string;
};

export default function ContactStudentModal({
    isOpen,
    onClose,
    studentId,
    studentName,
    challengeId,
    onSuccess,
    startupCompanyName,
}: ContactModalProps) {
    const { user, showToast } = useAuth();
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim()) return;
    setIsSubmitting(true);

    try {
        const { data: requestData, error: requestError } = await supabase
        .from('ContactRequest')
        .insert({
            startup_id: user.id,
            student_id: studentId,
            message: message,
            originating_challenge_id: challengeId,
            status: 'pending',
        })
        .select('id')
        .single();

    if (requestError) throw requestError;
        const notificationMessage = `Startup ${startupCompanyName || 'Startup'} vás chce kontaktovat.`;
        const { error: notifyError } = await supabase.from('notifications').insert({
        user_id: studentId,
        message: notificationMessage,
        link_url: '/notifications',
        type: 'contact_request',
        related_contact_request_id: requestData.id,
    });

    if (notifyError) throw notifyError;
    showToast('Žádost o kontakt byla úspěšně odeslána!', 'success');
    onSuccess();
    } catch (error) {
        console.error('Chyba při odesílání žádosti:', error);
        if (error instanceof Error) {
        showToast(`Chyba: ${error.message}`, 'error');
        } else {
        showToast('Došlo k neznámé chybě.', 'error');
}
} finally {
    setIsSubmitting(false);
    }
};

return (
    <Transition appear show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-[var(--barva-tmava)]">
                    Kontaktovat talent: {studentName}
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                            Vaše osobní zpráva
                        </label>
                            <p className="text-xs text-gray-500 mb-2">
                                Tato zpráva se studentovi zobrazí jako první. Buďte konkrétní (např. zmiňte výzvu, která vás zaujala).
                            </p>
                                <textarea
                                    id="message"
                                    rows={5}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                    maxLength={500}
                                    className="input !font-normal"
                                    placeholder="Ahoj, tvoje řešení naší výzvy bylo skvělé..."
                                />
                        <p className="text-right text-xs text-gray-400 mt-1">{message.length} / 500</p>
                    </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        className="px-5 py-2 rounded-full cursor-pointer transition-all ease-in-out font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
                        onClick={onClose}
                    >
                        Zrušit
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !message.trim()}
                        className="flex items-center cursor-pointer transition-all ease-in-out duration-200 gap-2 px-5 py-2 rounded-full font-semibold text-white bg-[var(--barva-primarni)] hover:opacity-90 disabled:bg-gray-400"
                    >
                        {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            Odesílám...
                        </>
                    ) : (
                        <>
                        <Send size={18} />
                        Odeslat žádost
                        </>
                    )}
                    </button>
                </div>
                </form>
            </Dialog.Panel>
            </Transition.Child>
        </div>
        </div>
    </Dialog>
    </Transition>
);
}