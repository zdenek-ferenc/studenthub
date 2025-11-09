import type { Metadata } from 'next'
import CreateChallengeView from './CreateChallengeView' 

export const metadata: Metadata = {
    title: 'Vytvořit novou výzvu',
    description: 'Zadejte novou výzvu pro studenty a talenty na platformě RiseHigh.',
}

export default function CreateChallengePage() {
    return <CreateChallengeView />
}