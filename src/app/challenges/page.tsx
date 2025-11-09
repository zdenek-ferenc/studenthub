import type { Metadata } from 'next'
import ChallengesView from './ChallengesView' 

export const metadata: Metadata = {
    title: 'Přehled výzev',
    description: 'Prohlížejte a filtrujte výzvy od startupů nebo spravujte své vlastní.',
}

export default function ChallengesPage() {
    return <ChallengesView />
}