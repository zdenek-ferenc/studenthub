import type { Metadata } from 'next'
import DashboardClientView from './DashboardClientView'

export const metadata: Metadata = {
    title: 'Můj Přehled', 
    description: 'Přehled mých aktivit, výzev a růstu na platformě RiseHigh.',
}

export default function DashboardPage() {
    return <DashboardClientView />
}