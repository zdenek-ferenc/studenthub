    import { CreditCard } from 'lucide-react';
    import ConstructionView from '@/components/ConstructionView';

    export default function PricingPage() {
    return (
        <ConstructionView 
        title="Cenová strategie se nastavuje"
        description="Právě propočítáváme ty nejférovější podmínky pro startupy. Chceme, aby každá investice do talentů na RiseHigh přinesla maximální návratnost."
        badgeText="Business Model"
        icon={<CreditCard size={48} strokeWidth={1.5} />}
        gradient="bg-emerald-300"
        />
    );
    }