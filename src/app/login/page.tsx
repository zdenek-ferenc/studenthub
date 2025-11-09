import type { Metadata } from 'next'
import LoginView from './LoginView' 

export const metadata: Metadata = {
    title: 'Přihlášení',
    description: 'Přihlaste se do svého RiseHigh účtu.',
}

export default function LoginPage() {
    return <LoginView />
}