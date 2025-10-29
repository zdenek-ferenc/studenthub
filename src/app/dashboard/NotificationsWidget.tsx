"use client";

import { useDashboard, Notification } from '../../contexts/DashboardContext';
import Link from 'next/link';
import { Bell, MessageSquareText, Trophy, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cs } from 'date-fns/locale';

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
    switch (type) {
        case 'new_submission':
            return <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-blue-100 to-blue-200 flex items-center justify-center"><Zap className="w-5 h-5 text-blue-500" /></div>;
        case 'submission_reviewed':
            return <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-green-100 to-green-200 flex items-center justify-center"><MessageSquareText className="w-5 h-5 text-green-500" /></div>;
        case 'submission_winner':
            return <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-amber-100 to-amber-200 flex items-center justify-center"><Trophy className="w-5 h-5 text-amber-500" /></div>;
        default:
            return <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center"><Bell className="w-5 h-5 text-blue-950" /></div>;
    }
};

export default function NotificationsWidget() {
    const { notifications, loading } = useDashboard();

    return (
        <div className="bg-white p-3 sm:p-4 3xl:p-6 rounded-2xl shadow-xs border-2 border-gray-100 h-full flex flex-col">
            <h3 className="3xl:text-xl font-semibold text-[var(--barva-tmava)] mb-4 flex justify-center md:justify-start">Notifikace</h3>
            {loading ? (
                <p className="text-sm text-gray-500">Načítám...</p>
            ) : notifications.length > 0 ? (
                <div className="space-y-3 flex-grow">
                    {notifications.map(notification => (
                        <Link href={notification.link_url} key={notification.id} className="block p-2 rounded-lg hover:bg-[var(--barva-svetle-pozadi)]/50 border shadow-xs border-gray-200 bg-gray-100/30 hover:border-[var(--barva-primarni)]/50 transition-all ease-in-out duration-200">
                            <div className="flex items-center gap-3">
                                <NotificationIcon type={notification.type} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-gray-800 leading-snug line-clamp-2">{notification.message}</p>
                                    <p className="text-xs text-gray-600">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: cs })}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center 3xl:py-6 flex-grow flex flex-col justify-center items-center">
                    <Bell className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                    <p className="text-sm md:font-base font-semibold text-gray-700">Žádné nové události</p>
                </div>
            )}
            <div className="mt-auto pt-4 text-center">
                <Link href="/notifications" className="text-xs md:text-sm font-semibold text-[var(--barva-primarni)] hover:text-[var(--barva-tmava)] transition-all ease-in-out duration-200">
                    Zobrazit všechny notifikace
                </Link>
            </div>
        </div>
    );
}