"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import { Bell, MessageSquareText, Trophy, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cs } from 'date-fns/locale';

type Notification = {
    id: string;
    message: string;
    link_url: string;
    created_at: string;
    type: 'new_submission' | 'submission_reviewed' | 'submission_winner' | null;
};

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
    switch (type) {
        case 'new_submission':
            return <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-blue-100 to-blue-200 flex items-center justify-center"><Zap className="w-5 h-5 text-blue-500" /></div>;
        case 'submission_reviewed':
            return <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-green-100 to-green-200 flex items-center justify-center"><MessageSquareText className="w-5 h-5 text-green-500" /></div>;
        case 'submission_winner':
            return <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-amber-100 to-amber-200 flex items-center justify-center"><Trophy className="w-5 h-5 text-amber-500" /></div>;
        default:
            return <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center"><Bell className="w-5 h-5 text-gray-400" /></div>;
    }
};


export default function NotificationsWidget() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    // --- ZMĚNA ZDE: Přidána "pojistka" i sem ---
    const [hasFetched, setHasFetched] = useState(false);

    useEffect(() => {
        if (user && !hasFetched) {
            const fetchNotifications = async () => {
                setLoading(true);
                const { data, error } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(4); 

                if (error) {
                    console.error("Chyba při načítání notifikací:", error);
                } else {
                    setNotifications(data as Notification[]);
                }
                setLoading(false);
                // --- ZMĚNA ZDE: Označíme, že máme načteno ---
                setHasFetched(true);
            };

            fetchNotifications();
        }
    }, [user, hasFetched]);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <h3 className="text-xl font-bold text-[var(--barva-tmava)] mb-4 flex justify-center md:justify-start">Nejnovější události</h3>
            {loading && !hasFetched ? (
                <p className="text-sm text-gray-500">Načítám...</p>
            ) : notifications.length > 0 ? (
                <div className="space-y-3 flex-grow">
                    {notifications.map(notification => (
                        <Link href={notification.link_url} key={notification.id} className="block p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-3">
                                <NotificationIcon type={notification.type} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-gray-800 leading-snug line-clamp-2">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: cs })}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6 flex-grow flex flex-col justify-center items-center">
                    <Bell className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                    <p className="font-semibold text-gray-700">Žádné nové události</p>
                    <p className="text-sm text-gray-500 mt-1">Vše je v klidu.</p>
                </div>
            )}
            <div className="mt-auto pt-4 text-center">
                <Link href="/notifications" className="text-sm font-semibold text-[var(--barva-primarni)]">
                    Zobrazit všechny notifikace
                </Link>
            </div>
        </div>
    );
}