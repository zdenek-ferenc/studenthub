    import { Feather } from 'lucide-react';
    import ConstructionView from '@/components/ConstructionView';

    export default function BlogPage() {
    return (
        <ConstructionView 
        title="Vědomosti se načítají"
        description="Připravujeme pro vás články nabité know-how ze světa startupů a kariérního růstu. Bude to stát za to čtení."
        badgeText="Redakce pracuje"
        icon={<Feather size={48} strokeWidth={1.5} />}
        gradient="bg-orange-200"
        />
    );
    }