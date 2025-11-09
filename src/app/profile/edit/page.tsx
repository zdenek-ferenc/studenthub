import type { Metadata } from 'next'
import EditProfileView from './EditProfileView'

export const metadata: Metadata = {
    title: 'Upravit profil',
}

export default function EditProfilePage() {
    return <EditProfileView />
}