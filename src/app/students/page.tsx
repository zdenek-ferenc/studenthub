import type { Metadata } from 'next'
import StudentCatalogView from './StudentCatalogView' 

export const metadata: Metadata = {
    title: 'Katalog talentů',
    description: 'Objevte a filtrujte talentované studenty připravené na výzvy.',
}

export default function StudentCatalogPage() {
    return <StudentCatalogView />
}