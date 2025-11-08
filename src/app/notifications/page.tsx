"use client";

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Bell, Handshake, Check, X, Loader2, Mail, Info, CheckCircle, MessageSquare, Trophy, Star, UserPlus, Briefcase, Clipboard, User, ChevronLeft, ChevronRight, Users, FileText } from 'lucide-react';
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
    type: 'new_submission' | 'submission_reviewed' | 'submission_winner' | 'contact_request' | 'contact_accepted' | 'new_applicant' | string;
    ContactRequest: ContactRequestData | null; 
};

const ITEMS_PER_PAGE = 7;

type FilterType = 'all' | 'contact' | 'applications' | 'submissions';

const FilterButton = ({ 
    label, 
    icon: Icon, 
    filter, 
    activeFilter, 
    onClick,
    count
}: { 
    label: string, 
    icon: React.ElementType, 
    filter: FilterType, 
    activeFilter: FilterType, 
    onClick: (filter: FilterType) => void,
    count: number
}) => {
    const isActive = activeFilter === filter;
    return (
        <button
            onClick={() => onClick(filter)}
            disabled={count === 0 && !isActive}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive
                    ? 'bg-[var(--barva-primarni)] text-white'
                    : 'bg-white cursor-pointer text-gray-600 hover:bg-gray-100'
            }`}
        >
            <Icon size={16} />
            <span>{label}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                isActive 
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
            }`}>
                {count}
            </span>
        </button>
    );
};


export default function NotificationsPage() {
    const { user, profile, showToast } = useAuth();
    const [allNotifications, setAllNotifications] = useState<NotificationWithRequest[]>([]); 
    const [loading, setLoading] = useState(true);

    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            if (allNotifications.length === 0) {
                setLoading(true);
            }

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
                if (allNotifications.length === 0) {
                    showToast('Nepodařilo se načíst notifikace.', 'error');
                } else {
                    showToast('Nepodařilo se aktualizovat notifikace.', 'error');
                }
            } else {
                const newNotifications = (data as NotificationWithRequest[] || []);
            
                const currentFirstId = allNotifications.length > 0 ? allNotifications[0].id : null;
                const newFirstId = newNotifications.length > 0 ? newNotifications[0].id : null;

                if (newNotifications.length !== allNotifications.length || currentFirstId !== newFirstId) {
                    setAllNotifications(newNotifications);
                }
            }
            
            setLoading(false);
        };

        fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, showToast]);

    const filterCounts = useMemo(() => {
        if (profile?.role !== 'startup') return { all: 0, contact: 0, applications: 0, submissions: 0 };
        return {
            all: allNotifications.length,
            contact: allNotifications.filter(n => n.type === 'contact_request' || n.type === 'contact_accepted').length,
            applications: allNotifications.filter(n => n.type === 'new_applicant').length,
            submissions: allNotifications.filter(n => n.type === 'new_submission').length,
        }
    }, [allNotifications, profile?.role]);

    const filteredNotifications = useMemo(() => {
        setCurrentPage(1); 
        if (profile?.role !== 'startup') return allNotifications;

        switch (activeFilter) {
            case 'contact':
                return allNotifications.filter(n => n.type === 'contact_request' || n.type === 'contact_accepted');
            case 'applications':
                return allNotifications.filter(n => n.type === 'new_applicant');
            case 'submissions':
                return allNotifications.filter(n => n.type === 'new_submission');
            case 'all':
            default:
                return allNotifications;
        }
    }, [allNotifications, activeFilter, profile?.role]);

    const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
    const displayedNotifications = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredNotifications.slice(startIndex, endIndex);
    }, [filteredNotifications, currentPage]);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const markAsRead = async (notificationId: string) => {
        setAllNotifications(prev => 
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

        setAllNotifications(prev => 
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

        setAllNotifications(prev =>
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

            {!loading && profile?.role === 'startup' && allNotifications.length > 0 && (
                <div className="mb-4 rounded-xl flex flex-wrap items-center gap-2">
                    <FilterButton 
                        label="Vše" 
                        icon={Bell} 
                        filter="all" 
                        activeFilter={activeFilter} 
                        onClick={setActiveFilter}
                        count={filterCounts.all}
                    />
                    <FilterButton 
                        label="Kontakty" 
                        icon={Handshake} 
                        filter="contact" 
                        activeFilter={activeFilter} 
                        onClick={setActiveFilter}
                        count={filterCounts.contact}
                    />
                    <FilterButton 
                        label="Přihlášky" 
                        icon={Users} 
                        filter="applications" 
                        activeFilter={activeFilter} 
                        onClick={setActiveFilter}
                        count={filterCounts.applications}
                    />
                    <FilterButton 
                        label="Odevzdání" 
                        icon={FileText} 
                        filter="submissions" 
                        activeFilter={activeFilter} 
                        onClick={setActiveFilter}
                        count={filterCounts.submissions}
                    />
                </div>
            )}


            {loading ? (
                <LoadingSpinner />
            ) : allNotifications.length === 0 ? ( 
                <div className="text-center py-16 bg-white rounded-2xl shadow-xs border border-gray-100">
                    <Bell size={48} className="mx-auto text-gray-300" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-500">Všechno máte přečtené</h3>
                    <p className="mt-1 text-sm text-gray-400">Nové notifikace se objeví zde.</p>
                </div>
            ) : (
                <>
                    {displayedNotifications.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-2xl shadow-xs border border-gray-100">
                            <Info size={48} className="mx-auto text-gray-300" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-500">Žádné notifikace v této kategorii</h3>
                            <p className="mt-1 text-sm text-gray-400">Zkuste změnit filtr.</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {displayedNotifications.map(notification => {
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

                            if (notification.type === 'contact_accepted') {
                                return (
                                    <StartupContactAcceptedCard 
                                        key={notification.id}
                                        notification={notification}
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

                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer text-sm font-semibold bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                                Předchozí
                            </button>
                            <span className="text-sm font-semibold text-gray-500">
                                Strana {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-2 px-4 cursor-pointer py-2 rounded-lg text-sm font-semibold bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Další
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </>
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

function StartupContactAcceptedCard({ notification }: { notification: NotificationWithRequest }) {
    const { showToast } = useAuth();
    const [copied, setCopied] = useState(false);

    const messageMatch = notification.message.match(/Student (.*) přijal vaši žádost. Kontaktujte ho na: (.*)\./);
    const studentName = messageMatch ? messageMatch[1] : 'Student';
    const studentEmail = messageMatch ? messageMatch[2] : null;

    const handleCopyEmail = () => {
        if (studentEmail) {
            navigator.clipboard.writeText(studentEmail);
            setCopied(true);
            showToast('E-mail zkopírován!', 'success');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border-2 border-gray-100">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <Handshake size={24} />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">
                        {studentName} přijal/a vaši žádost o kontakt!
                    </h4>
                    <p className="text-sm text-gray-600 mt-2">
                        Nyní můžete studenta kontaktovat napřímo.
                    </p>
                    
                    {studentEmail && studentEmail !== 'Email neuveden' && (
                        <div className="mt-4 flex flex-col sm:flex-row gap-2 items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <Mail size={16} className="text-gray-500 flex-shrink-0" />
                            <span className="font-mono text-sm text-gray-800 flex-1 truncate">{studentEmail}</span>
                            <button
                                onClick={handleCopyEmail}
                                className={`flex-shrink-0  cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                                    copied
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {copied ? <Check size={14} /> : <Clipboard size={14} />}
                                {copied ? 'Zkopírováno' : 'Kopírovat'}
                            </button>
                        </div>
                    )}

                    {notification.link_url && (
                        <div className="mt-4">
                            <Link 
                                href={notification.link_url}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white text-[var(--barva-primarni)] border-2 border-[var(--barva-primarni)] ease-in-out duration-200 font-semibold hover:bg-blue-50 transition-colors text-sm"
                            >
                                <User size={16} />
                                Zobrazit profil studenta
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


function RegularNotificationItem({ notification, onMarkAsRead }: { notification: NotificationWithRequest, onMarkAsRead: () => void }) {
    const isClickable = notification.link_url && notification.link_url !== '#';
    
    const getIcon = (type: string | null, isRead: boolean) => {
        const className = `flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${isRead ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600'}`;

        let icon;
        switch (type) {
            case 'submission_winner':
                icon = <Trophy size={24} />;
                break;
            case 'submission_reviewed':
                icon = <Star size={24} />;
                break;
            
            case 'new_applicant': 
                icon = <UserPlus size={24} />;
                break;
            case 'new_submission': 
                icon = <Briefcase size={24} />;
                break;
            
            case 'challenge_closed': 
                icon = <MessageSquare size={24} />;
                break;
            default:
                icon = <Bell size={24} />;
                break;
        }
        return <div className={className}>{icon}</div>;
    }

    const content = (
        <div className="flex items-center gap-4">
            {getIcon(notification.type, notification.is_read)} 
            <div className="flex-1 overflow-hidden">
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
                    className="w-8 h-8 rounded-full flex cursor-pointer items-center justify-center hover:bg-blue-100 transition-all ease-in-out duration-200 text-gray-400"
                >
                    <Check size={16} />
                </button>
            )}
        </div>
    );

    const commonClasses = "block p-4 sm:p-5 rounded-2xl shadow-xs border-2 transition-all";

    if (isClickable) {
        return (
            <Link 
                href={notification.link_url} 
                onClick={!notification.is_read ? onMarkAsRead : undefined}
                className={`${commonClasses} ${notification.is_read ? 'bg-white border-2 border-gray-100 hover:bg-gray-50' : 'bg-white border-2 border-[var(--barva-primarni)] hover:bg-gray-50'}`}
            >
                {content}
            </Link>
        );
    }

    return (
        <div className={`${commonClasses} ${notification.is_read ? 'bg-gray-100 border-2 border-[var(--barva-primarni)]' : 'bg-white'}`}>
            {content}
        </div>
    );
}