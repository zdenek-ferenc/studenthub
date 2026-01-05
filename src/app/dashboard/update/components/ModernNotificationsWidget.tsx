"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../contexts/AuthContext';
import { Bell, Trophy, Star, Handshake } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { cs } from 'date-fns/locale';

type Notification = { id: string; message: string; link_url: string; created_at: string; is_read: boolean; type: string; };

const getIcon = (type: string) => {
    switch(type) {
        case 'submission_winner': return <Trophy size={16} className="text-yellow-400"/>;
        case 'submission_reviewed': return <Star size={16} className="text-blue-400"/>;
        case 'contact_request': return <Handshake size={16} className="text-green-400"/>;
        default: return <Bell size={16} className="text-gray-400"/>;
    }
};

export default function ModernNotificationsWidget() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifs = useCallback(async () => {
        if (!user) return;
        const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(4);
        setNotifications(data || []);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchNotifs();
        const sub = supabase.channel(`notifs:${user?.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user?.id}` }, (pl) => {
            setNotifications(prev => [pl.new as Notification, ...prev.slice(0, 3)]);
        }).subscribe();
        return () => { supabase.removeChannel(sub); };
    }, [user, fetchNotifs]);

    return (
        <div className="bg-[#0B1623]/60 backdrop-blur-xl shadow-xl border border-white/5 rounded-3xl p-4 md:p-6">
            <div className="flex items-center gap-3 mb-5 px-1">
                
                <h3 className="font-bold text-sm md:text-base text-white flex items-center gap-2">
                    <Bell size={18} className="text-red-400"/> 
                    Notifikace
                </h3>
            </div>
            
            <div className="space-y-3">
                {loading ? <p className="text-gray-500 text-sm">Načítám...</p> : notifications.length === 0 ? (
                    <div className="text-center text-gray-500 py-4 text-sm">Žádné notifikace. 🔕</div>
                ) : (
                    notifications.map(n => (
                        <Link href={n.link_url || '#'} key={n.id} className={`flex items-start gap-3 py-2 md:p-3 rounded-xl border border-transparent hover:bg-white/5 hover:border-white/5 transition-all ${!n.is_read ? 'bg-white/[0.02]' : ''}`}>
                            <div className="mt-1 p-1.5 rounded-lg bg-white/5 border border-white/5">
                                {getIcon(n.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs md:text-sm ${!n.is_read ? 'text-white font-semibold' : 'text-gray-400'} truncate`}>{n.message}</p>
                                <p className="text-[10px] md:text-xs text-gray-600 mt-0.5">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: cs })}</p>
                            </div>
                            {!n.is_read && <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></div>}
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}