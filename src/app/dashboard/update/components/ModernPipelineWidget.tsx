"use client";

import { useMemo } from 'react';
import { useDashboard } from '../../../../contexts/DashboardContext';
import { Wallet, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

const getStatusStep = (status: string) => {
    switch (status) {
        case 'applied': return 1; 
        case 'submitted': return 2; 
        case 'reviewed': return 3;
        case 'winner': return 4; 
        case 'rejected': return 4; 
        default: return 1;
    }
};

const StatusBar = ({ status }: { status: string }) => {
    const currentStep = getStatusStep(status);

    return (
        <div className="flex items-center gap-1 w-24">
            {[1, 2, 3].map((step) => {
                const isActive = step <= currentStep;
                const isCurrent = step === currentStep;
                
                return (
                    <div key={step} className="flex-1 flex flex-col gap-1">
                        <div className={`h-1.5 rounded-full w-full transition-all duration-500 ${
                            isActive 
                                ? (status === 'winner' ? 'bg-yellow-400' : 'bg-blue-500') 
                                : 'bg-white/10'
                        } ${isCurrent && status !== 'winner' ? 'animate-pulse' : ''}`}></div>
                    </div>
                );
            })}
        </div>
    );
};

export default function ModernPipelineWidget() {
    const { submissions, loading } = useDashboard();

    const activePipeline = useMemo(() => {
        if (!submissions) return [];
        return submissions.filter(s => 
            ['applied', 'submitted', 'reviewed'].includes(s.status) && 
            s.Challenge?.status !== 'archived'
        ).slice(0, 5); 
    }, [submissions]);

    const potentialEarnings = useMemo(() => {
        return activePipeline.reduce((acc, sub) => {
            const reward = (sub.Challenge as Record<string, unknown>)?.reward_first_place as number ?? 0;
            return acc + reward;
        }, 0);
    }, [activePipeline]);

    if (loading) return null; 

    if (activePipeline.length === 0) return (
        <div className="bg-[#0B1623]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 h-full flex flex-col items-center justify-center text-center min-h-[200px]">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3 text-gray-500">
                <Wallet size={20} />
            </div>
            <h3 className="text-white font-bold text-sm">Žádné aktivní projekty</h3>
            <p className="text-gray-500 text-xs mt-1 mb-4">Přihlas se do výzvy a sleduj svůj postup zde.</p>
            <Link href="/challenges" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors">
                Katalog výzev
            </Link>
        </div>
    );

    return (
        <div className="bg-[#0B1623]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 h-full flex flex-col">
            <div className="flex justify-between items-end mb-6 pb-4 border-b border-white/5">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Potenciál ve hře</span>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 tabular-nums">
                        {potentialEarnings.toLocaleString('cs-CZ')} Kč
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-white leading-none">{activePipeline.length}</span>
                    <span className="text-[10px] text-gray-500 block uppercase font-bold mt-1">Aktivních</span>
                </div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
                {activePipeline.map((item) => (
                    <Link href={`/challenges/${item.Challenge?.id}`} key={item.id} className="block group">
                        <div className="flex items-center justify-between gap-4 p-2 rounded-xl hover:bg-white/5 transition-colors">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-xs font-bold text-gray-200 truncate group-hover:text-blue-400 transition-colors">
                                        {item.Challenge?.title}
                                    </h4>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                    <span className="truncate max-w-[80px]">{item.Challenge?.StartupProfile?.company_name}</span>
                                    <span>•</span>
                                    <span className={item.status === 'submitted' ? 'text-amber-400' : 'text-gray-400'}>
                                        {item.status === 'applied' && 'Rozpracováno'}
                                        {item.status === 'submitted' && 'Čeká na hodnocení'}
                                        {item.status === 'reviewed' && 'Vyhodnoceno'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                <StatusBar status={item.status} />
                                <ChevronRight size={14} className="text-gray-600 group-hover:text-white transition-colors mt-1" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-gray-500 flex items-center gap-2">
                <Loader2 size={10} className="animate-spin text-blue-500"/>
                <span>Data se aktualizují v reálném čase.</span>
            </div>
        </div>
    );
}