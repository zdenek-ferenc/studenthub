import type { Metadata } from 'next'
import RecruitmentView from './RecruitmentView' 

export const metadata: Metadata = {
    title: 'Centrum pro nábor',
    description: 'Spravujte svůj náborový proces a komunikaci s talenty.',
}

export default function RecruitmentHubPage() {
    return <RecruitmentView />
}