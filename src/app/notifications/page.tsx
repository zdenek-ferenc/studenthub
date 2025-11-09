import type { Metadata } from 'next'
import NotificationsView from './NotificationsView' 

export const metadata: Metadata = {
    title: 'Moje notifikace',
    description: 'Přehled všech vašich notifikací na platformě RiseHigh.',
}

export default function NotificationsPage() {
    return <NotificationsView />
}