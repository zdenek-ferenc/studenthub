    import { Suspense } from 'react';
    import ChallengePageClient from './ChallengePageClient';


    export default function ChallengePage({ params }: { params: { id: string } }) {
    const challengeId = params.id;

    return (
        <div className="min-h-screen bg-[var(--barva-svetle-pozadi)]">
        <Suspense fallback={<ChallengeLoadingState />}>
            <ChallengePageClient id={challengeId} />
        </Suspense>
        </div>
    );
    }

    function ChallengeLoadingState() {
    return (
        <div className="pt-32 pb-12 max-w-7xl mx-auto px-4 md:px-6 space-y-8">
        <div className="h-64 w-full bg-gray-100 rounded-3xl animate-pulse" />
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
            <div className="space-y-6">
                <div className="h-12 w-3/4 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-40 w-full bg-gray-100 rounded-2xl animate-pulse" />
            </div>
            <div className="hidden lg:block h-96 w-full bg-gray-100 rounded-2xl animate-pulse" />
        </div>
        </div>
    );
    }