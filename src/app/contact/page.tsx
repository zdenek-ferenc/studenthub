    import { MailOpen } from 'lucide-react';
    import ConstructionView from '@/components/ConstructionView';

    export default function ContactPage() {
    return (
        <ConstructionView 
        title="Navazujeme spojení"
        description="Ladíme komunikační kanály, abychom tu pro vás byli nonstop. Zatím nás můžete zastihnout na našich sociálních sítích."
        badgeText="Coming Soon"
        icon={<MailOpen size={48} strokeWidth={1.5} />}
        gradient="bg-purple-300"
        />
    );
    }