"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Bell, Handshake, Check, X, Loader2, Mail, Info, CheckCircle, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cs } from 'date-fns/locale';
import Image from 'next/image';
import Link from 'next/link';

type StartupProfileInfo = {
    company_name: string;
    logo_url: string | null;
    contact_email: string; 
};
type ContactRequestData = {
    id: string;
    message: string;
    status: 'pending' | 'accepted' | 'declined';
    User: { 
        StartupProfile: StartupProfileInfo | null;
    } | null;
    startup_id: string; 
};
type NotificationWithRequest = {
    id: string;
    created_at: string;
    message: string;
    link_url: string;
    is_read: boolean;
    type: string;
    ContactRequest: ContactRequestData | null; 
};


export default function NotificationsPage() {
    const { user, profile, showToast } = useAuth();
    const [notifications, setNotifications] = useState<NotificationWithRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('notifications')
                .select(`
                    *,
                    ContactRequest (
                        *,
                        User!ContactRequest_startup_id_fkey (
                            StartupProfile (
                                company_name,
                                logo_url,
                                contact_email
                            )
                        )
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching notifications:', error);
                showToast('Nepodařilo se načíst notifikace.', 'error');
            } else {
                setNotifications(data as NotificationWithRequest[] || []);
            }
            setLoading(false);
        };

        fetchNotifications();
    }, [user, showToast]);

    const markAsRead = async (notificationId: string) => {
        setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);
    };

    const handleAcceptRequest = async (
        notification: NotificationWithRequest,
        request: ContactRequestData
    ) => {
        if (!user || !profile || profile.role !== 'student' || !request.User?.StartupProfile) {
            console.error("Chybí data studenta pro přijetí žádosti.");
            return;
        }

        const { error: updateError } = await supabase
            .from('ContactRequest')
            .update({ status: 'accepted' })
            .eq('id', request.id);

        if (updateError) {
            showToast('Chyba: Nepodařilo se přijmout žádost.', 'error');
            return;
        }

        const studentFullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Student';
        const studentEmail = user.email || 'Email neuveden'; 

        const { error: notifyError } = await supabase
            .from('notifications')
            .insert({
                user_id: request.startup_id,
                message: `Student ${studentFullName} přijal vaši žádost. Kontaktujte ho na: ${studentEmail}.`,
                link_url: `/profile/${user.id}`,
                type: 'contact_accepted'
            });
        
        if (notifyError) {
            console.error("Chyba při odesílání notifikace startupu:", notifyError);
        }

        await markAsRead(notification.id);

        setNotifications(prev => 
            prev.map(n => n.id === notification.id 
                ? { ...n, is_read: true, ContactRequest: { ...n.ContactRequest!, status: 'accepted' } } 
                : n
            )
        );
        showToast('Žádost přijata! Startup byl informován.', 'success');
    };

    const handleDeclineRequest = async (
        notification: NotificationWithRequest,
        request: ContactRequestData
    ) => {
        
        const { error: updateError } = await supabase
            .from('ContactRequest')
            .update({ status: 'declined' })
            .eq('id', request.id);

        if (updateError) {
            showToast('Chyba: Nepodařilo se odmítnout žádost.', 'error');
            return;
        }

        await markAsRead(notification.id);

        setNotifications(prev => 
            prev.map(n => n.id === notification.id 
                ? { ...n, is_read: true, ContactRequest: { ...n.ContactRequest!, status: 'declined' } } 
                : n
            )
        );
        showToast('Žádost odmítnuta.', 'success');
    };


    return (
        <div className="h-full flex flex-col sm:max-w-3xl mx-auto px-4 py-4 sm:py-8 md:py-28 3xl:py-32">
            <h1 className="text-3xl font-bold text-[var(--barva-tmava)] mb-6 sm:mb-8">
                Notifikační centrum
            </h1>

            {loading ? (
                <LoadingSpinner />
            ) : notifications.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-xs border border-gray-100">
                    <Bell size={48} className="mx-auto text-gray-300" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-500">Všechno máte přečtené</h3>
                    <p className="mt-1 text-sm text-gray-400">Nové notifikace se objeví zde.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map(notification => {
                        const request = notification.ContactRequest;
                        if (notification.type === 'contact_request' && request && request.status === 'pending') {
                            return (
                                <ContactRequestCard 
                                    key={notification.id} 
                                    notification={notification}
                                    request={request}
                                    onAccept={() => handleAcceptRequest(notification, request)}
                                    onDecline={() => handleDeclineRequest(notification, request)}
                                />
                            );
                        }
                        
                        if (notification.type === 'contact_request' && request && request.status === 'accepted') {
                            return (
                                <AcceptedRequestCard 
                                    key={notification.id}
                                    request={request}
                                />
                            );
                        }
                        if (request?.status !== 'declined') {
                            return (
                                <RegularNotificationItem 
                                    key={notification.id} 
                                    notification={notification} 
                                    onMarkAsRead={() => markAsRead(notification.id)}
                                />
                            );
                        }
                        
                        return null; 
                    })}
                </div>
            )}
        </div>
    );
}

function ContactRequestCard({ 
    notification, 
    request, 
    onAccept, 
    onDecline 
}: { 
    notification: NotificationWithRequest, 
    request: ContactRequestData, 
    onAccept: () => void, 
    onDecline: () => void 
}) {
    const [isAccepting, setIsAccepting] = useState(false);
    const [isDeclining, setIsDeclining] = useState(false);
    const profile = request.User?.StartupProfile;

    const handleAccept = async () => {
        setIsAccepting(true);
        await onAccept();
        setIsAccepting(false);
    };

    const handleDecline = async () => {
        setIsDeclining(true);
        await onDecline();
        setIsDeclining(false);
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border-2 border-gray-100 transition-all shadow-sm">
            <div className="flex items-start gap-4">
                {profile?.logo_url ? (
                    <Image src={profile.logo_url} alt="Logo startupu" width={48} height={48} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-gray-100" />
                ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <Handshake size={24} />
                    </div>
                )}
                <div className="flex-1">
                    <h4 className="font-semibold text-[var(--barva-tmava)]">
                        {profile?.company_name || 'Startup'} vás chce kontaktovat
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: cs })}
                    </p>
                    
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap italic">
                            {request.message}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        <button
                            onClick={handleAccept}
                            disabled={isAccepting || isDeclining}
                            className="btn-primary w-full cursor-pointer border-2 text-[var(--barva-primarni)] hover:bg-[var(--barva-primarni)]/10 transition-all ease-in-out duration-200 border-[var(--barva-primarni)] px-4 rounded-full py-2 sm:w-auto text-sm justify-center flex items-center gap-2"
                        >
                            {isAccepting ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                            Přijmout a sdílet e-mail
                        </button>
                        <button
                            onClick={handleDecline}
                            disabled={isAccepting || isDeclining}
                            className="px-4 rounded-full py-2 border-2 text-red-500 cursor-pointer hover:bg-red-500/5 transition-all ease-in-out duration-200 border-red-400 btn-secondary w-full sm:w-auto text-sm justify-center flex items-center gap-2"
                        >
                            {isDeclining ? <Loader2 className="animate-spin" size={16} /> : <X size={16} />}
                            Odmítnout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AcceptedRequestCard({ request }: { request: ContactRequestData }) {
    const profile = request.User?.StartupProfile;

    return (
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 opacity-80">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <CheckCircle size={24} />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">
                        Kontakt navázán se startupem {profile?.company_name || 'Startup'}
                    </h4>
                    <p className="text-sm text-gray-600 mt-2">
                        Tento startup nyní vidí váš e-mail a může vás kontaktovat.
                    </p>
                    {profile?.contact_email && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                            <Mail size={14} /> E-mail startupu: 
                            <a href={`mailto:${profile.contact_email}`} className="font-semibold text-gray-700 hover:underline">
                                {profile.contact_email}
                            </a>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function RegularNotificationItem({ notification, onMarkAsRead }: { notification: NotificationWithRequest, onMarkAsRead: () => void }) {
    const isClickable = notification.link_url && notification.link_url !== '#';
    
    const content = (
        <div className="flex items-center gap-4">
            <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${notification.is_read ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600'}`}>
                {notification.type === 'challenge_closed' ? <MessageSquare size={24} /> : <Bell size={24} />}
            </div>
            <div className="flex-1">
                <p className={`text-sm ${notification.is_read ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                    {notification.message}
                </p>
                <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: cs })}
                </p>
            </div>
            {!notification.is_read && (
                <button 
                    title="Označit jako přečtené"
                    onClick={(e) => {
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        onMarkAsRead();
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400"
                >
                    <Info size={16} />
                </button>
            )}
        </div>
    );

    const commonClasses = "block p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 transition-all";

    if (isClickable) {
        return (
            <Link 
                href={notification.link_url} 
                onClick={!notification.is_read ? onMarkAsRead : undefined}
                className={`${commonClasses} ${notification.is_read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'}`}
            >
                {content}
            </Link>
        );
    }

    return (
        <div className={`${commonClasses} ${notification.is_read ? 'bg-white' : 'bg-blue-50'}`}>
            {content}
        </div>
    );
}