"use client";

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import withAuth from '../../components/withAuth';

function TestNotificationsPage() {
    const { user, showToast } = useAuth();
    const [recipientId, setRecipientId] = useState(user?.id || '');
    const [isSending, setIsSending] = useState(false);

    const handleSendNotification = async () => {
        if (!recipientId) {
            showToast('Prosím, zadejte ID uživatele.', 'error');
            return;
        }
        
        setIsSending(true);

        const testMessage = `Toto je testovací notifikace odeslaná ${new Date().toLocaleTimeString('cs-CZ')}.`;
        const testLink = '/profile';

        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: recipientId,
                message: testMessage,
                link_url: testLink,
            });
        
        if (error) {
            showToast(`Chyba: ${error.message}`, 'error');
        } else {
            showToast('Testovací notifikace byla úspěšně odeslána!', 'success');
        }

        setIsSending(false);
    };

    return (
        <div className="container mx-auto py-20 px-4">
            <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border">
                <h1 className="text-2xl font-bold text-center text-[var(--barva-tmava)] mb-2">
                    Panel pro testování notifikací
                </h1>
                <p className="text-center text-gray-500 mb-6">
                    Tato stránka je pouze pro vývojářské účely.
                </p>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="recipientId" className="block mb-1 font-semibold text-gray-700">
                            ID Příjemce (user_id)
                        </label>
                        <input
                            id="recipientId"
                            type="text"
                            value={recipientId}
                            onChange={(e) => setRecipientId(e.target.value)}
                            placeholder="Vložte user_id ze Supabase"
                            className="input w-full"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Vaše ID je předvyplněno. Najděte jiné v Supabase &rarr; Authentication &rarr; Users.
                        </p>
                    </div>

                    <button
                        onClick={handleSendNotification}
                        disabled={isSending}
                        className="w-full px-6 py-3 rounded-lg bg-[var(--barva-primarni)] text-white font-semibold hover:opacity-90 transition-opacity disabled:bg-gray-400"
                    >
                        {isSending ? 'Odesílám...' : 'Odeslat testovací notifikaci'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default withAuth(TestNotificationsPage);