"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Briefcase, Handshake, ChevronRight, Trophy, Star, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { cs } from 'date-fns/locale';
import Skeleton from '../../components/skeletons/Skeleton';

type Notification = {
    id: string;
    message: string;
    link_url: string;
    created_at: string;
    is_read: boolean;
    type: string;
};

const NotificationIcon = ({ type, isRead }: { type: string; isRead: boolean }) => {
    const className = `flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isRead ? 'bg-gray-100 text-gray-400' : 'bg-[var(--barva-primarni-light)] text-[var(--barva-primarni)]'}`;

    let icon;
    switch (type) {
        case 'submission_winner':
            icon = <Trophy size={16} />; 
            break;
        case 'submission_reviewed':
            icon = <Star size={16} />; 
            break;
        case 'contact_request':
            icon = <Handshake size={16} />; 
            break;
        case 'new_applicant': 
            icon = <UserPlus size={16} />; 
            break;
        case 'new_submission': 
            icon = <Briefcase size={16} />; 
            break;
        case 'contact_accepted': 
            icon = <Handshake size={16} />; 
            break;
        default:
            icon = <Bell size={16} />;
            break;
    }

    return <div className={className}>{icon}</div>;
};

export default function NotificationsWidget() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async (isBackgroundRefresh = false) => {
        if (!user) return;


        if (!isBackgroundRefresh) {
            setLoading(true);
        }

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(4);

        if (error) {
            console.error('Error fetching notifications:', error);
        } else {
            setNotifications(data || []);
        }
        
        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (!user) return;

        fetchNotifications(false);

        const channel = supabase
            .channel(`notifications:user_id=eq.${user.id}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'notifications', 
                filter: `user_id=eq.${user.id}` 
            }, (payload) => {
                setNotifications(prev => [payload.new as Notification, ...prev.slice(0, 3)]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, fetchNotifications]);

    useEffect(() => {
        const handleRefetchOnFocus = () => {
            if (document.visibilityState === 'visible') {
                fetchNotifications(true);
            }
        };

        window.addEventListener('focus', handleRefetchOnFocus);
        document.addEventListener('visibilitychange', handleRefetchOnFocus);

        return () => {
            window.removeEventListener('focus', handleRefetchOnFocus);
            document.removeEventListener('visibilitychange', handleRefetchOnFocus);
        };
    }, [fetchNotifications]);

    const showSkeleton = loading && notifications.length === 0;

    return (
        <div className="bg-white p-4 sm:p-6 mb-12 sm:mb-0 rounded-2xl shadow-xs border-2 border-gray-100 h-full">
            <div className="flex justify-between items-center sm:mb-2">
                <div className="flex items-center gap-2 sm:mb-4 mb-3">
                    <div className="h-6 w-1 bg-[var(--barva-primarni)] rounded-full"></div>
                    <h3 className="font-bold sm:text-lg text-[var(--barva-tmava)]">Notifikace</h3>
                </div>
            </div>
            <div className="space-y-4">
                {showSkeleton ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="w-8 h-8 rounded-full" />
                            <div className='flex-1'>
                                <Skeleton className="w-3/4 h-4 mb-1" />
                                <Skeleton className="w-1/4 h-3" />
                            </div>
                        </div>
                    ))
                ) : notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Zatím tu nic není. 🔔</p>
                ) : (
                    notifications.map(notif => (
                        <Link href={notif.link_url || '#'} key={notif.id} className={`block p-3 rounded-xl border-2 border-gray-100 transition-colors ${notif.is_read ? 'hover:bg-[var(--barva-primarni)]/5 hover:border-[var(--barva-primarni)]/5' : 'hover:bg-[var(--barva-primarni)]/5 hover:border-[var(--barva-primarni)]/5'}`}>
                            <div className="flex items-center gap-3">
                                <NotificationIcon type={notif.type} isRead={notif.is_read} />
                                <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                                    <p className={`text-xs sm:text-sm sm:truncate ${notif.is_read ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                                        {notif.message}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: cs })}
                                    </p>
                                </div>
                                {!notif.is_read && <div className="w-2 h-2 rounded-full bg-[var(--barva-primarni)] flex-shrink-0"></div>}
                            </div>
                        </Link>
                    ))
                )}
            </div>
            {notifications.length > 0 && (
                <Link
                    href="/notifications"
                    className="group flex items-center justify-center gap-1 text-xs sm:text-sm font-semibold text-[var(--barva-primarni)] sm:pt-6 pt-4"
                    >
                    Zobrazit všechny notifikace
                <ChevronRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                />
                </Link>
            )}
        </div>
    );
}