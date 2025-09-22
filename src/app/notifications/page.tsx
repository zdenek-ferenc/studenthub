"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import withAuth from '../../components/withAuth';
import Link from 'next/link';
import { Bell, CheckCheck, MessageSquareText, Trophy, Zap } from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { cs } from 'date-fns/locale';
import LoadingSpinner from '../../components/LoadingSpinner'

// Typ pro jednu notifikaci
type Notification = {
    id: string;
    message: string;
    link_url: string;
    is_read: boolean;
    created_at: string;
    type: 'new_submission' | 'submission_reviewed' | 'submission_winner' | null;
};

// Ikonky pro různé typy notifikací
const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
    switch (type) {
        case 'new_submission':
            return <Zap className="w-6 h-6 text-blue-500" />;
        case 'submission_reviewed':
            return <MessageSquareText className="w-6 h-6 text-green-500" />;
        case 'submission_winner':
            return <Trophy className="w-6 h-6 text-amber-500" />;
        default:
            return <Bell className="w-6 h-6 text-gray-400" />;
    }
};

// Formátování data pro hezčí zobrazení
const formatDateGroup = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Dnes';
    if (isYesterday(date)) return 'Včera';
    return format(date, 'd. MMMM yyyy', { locale: cs });
};

function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Chyba při načítání notifikací:", error);
            } else {
                setNotifications(data as Notification[]);
            }
            setLoading(false);
        };

        fetchNotifications();
    }, [user]);

    const markAllAsRead = async () => {
        if (!user) return;
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        
        if (unreadIds.length === 0) return;

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', unreadIds);

        if (!error) {
            // Lokální aktualizace pro okamžitou vizuální změnu
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            // Poznámka: Po této akci se počítadlo v Headeru samo neaktualizuje.
            // Aktualizuje se až při příštím načtení Headeru (změna stránky, refresh).
            // Pro plnou synchronizaci by bylo potřeba spravovat stav v AuthContextu.
        }
    };

    // Seskupení notifikací podle data
    const groupedNotifications = notifications.reduce((acc, notification) => {
        const dateGroup = formatDateGroup(notification.created_at);
        if (!acc[dateGroup]) {
            acc[dateGroup] = [];
        }
        acc[dateGroup].push(notification);
        return acc;
    }, {} as Record<string, Notification[]>);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-[var(--barva-tmava)]">Notifikace</h1>
                    <button 
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[var(--barva-primarni)] transition-colors"
                    >
                        <CheckCheck size={16} />
                        Označit vše jako přečtené
                    </button>
                </div>

                {Object.keys(groupedNotifications).length > 0 ? (
                    <div className="space-y-8">
                        {Object.entries(groupedNotifications).map(([date, notifs]) => (
                            <div key={date}>
                                <h2 className="font-bold text-gray-500 mb-4">{date}</h2>
                                <div className="space-y-3">
                                    {notifs.map(notification => (
                                        <Link href={notification.link_url} key={notification.id} className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${notification.is_read ? 'bg-white' : 'bg-blue-50 border-l-4 border-blue-400'}`}>
                                            <div className="flex-shrink-0 mt-1">
                                                <NotificationIcon type={notification.type} />
                                            </div>
                                            <div>
                                                <p className="text-gray-800">{notification.message}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {format(parseISO(notification.created_at), 'HH:mm')}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-white p-12 rounded-2xl">
                        <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-bold text-gray-700">Zatím žádné novinky</h2>
                        <p className="text-gray-500 mt-2">Až se něco stane, dáme vám vědět zde.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default withAuth(NotificationsPage);

