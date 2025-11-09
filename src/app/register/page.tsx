import type { Metadata } from 'next'
import RegisterChoiceView from './RegisterChoiceView' 

export const metadata: Metadata = {
    title: 'Registrace',
    description: 'Zaregistrujte se na RiseHigh jako talent nebo jako startup.',
}

export default function RegisterChoicePage() {
    return <RegisterChoiceView />
}