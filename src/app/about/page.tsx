    import { Users } from 'lucide-react';
    import ConstructionView from '@/components/ConstructionView';

    export default function AboutPage() {
    return (
        <ConstructionView 
        title="Náš příběh se píše"
        description="Právě pro vás sepisujeme naši misi, vizi a historii. Chceme, aby každé slovo přesně vystihovalo to, proč RiseHigh existuje."
        badgeText="Připravujeme"
        icon={<Users size={48} strokeWidth={1.5} />}
        gradient="bg-blue-300"
        />
    );
    }