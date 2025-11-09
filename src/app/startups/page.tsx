import type { Metadata } from 'next'
import StartupCatalogView from './StartupCatalogView' 

export const metadata: Metadata = {
    title: 'Katalog startupů',
    description: 'Prohlédněte si inovativní firmy a startupy na naší platformě.',
}

export default function StartupCatalogPage() {
    return <StartupCatalogView />
}