"use client";

import Link from 'next/link';
import { ReactNode } from 'react';
import DeadlineTag from '../../../../components/DeadlineTag';
import { Users, CheckCircle, AlertTriangle} from 'lucide-react';
import { Challenge } from '../StartupChallengesView'; // OPRAVA: Importujeme správný typ

const StatItem = ({ icon: Icon, text, colorClass }: { icon: React.ElementType, text: ReactNode, colorClass?: string }) => (
    <div className={`flex items-center gap-2 text-sm font-medium ${colorClass || 'text-gray-500'}`}>
        <Icon size={16} className="flex-shrink-0" />
        <span>{text}</span>
    </div>
);

export default function ChallengeCard({ challenge }: { challenge: Challenge }) {
    // Zajistíme, že i když data chybí, komponenta nespadne
    const applicantCount = challenge.Submission?.length || 0;
    // OPRAVA: Explicitně typujeme 's', abychom předešli chybě
    const unreviewedCount = challenge.Submission?.filter((s: { status: string }) => s.status === 'applied' || s.status === 'submitted').length || 0;
    const progress = challenge.max_applicants ? (applicantCount / challenge.max_applicants) * 100 : 0;
    
    const isPastDeadline = challenge.deadline ? new Date() > new Date(challenge.deadline) : false;
    const needsAttention = isPastDeadline && unreviewedCount > 0;

    const getAction = () => {
        if (needsAttention) return { href: `/challenges/${challenge.id}`, text: 'Vybrat vítěze', priority: true };
        if (unreviewedCount > 0) return { href: `/challenges/${challenge.id}`, text: `Ohodnotit (${unreviewedCount})`, priority: true };
        return { href: `/challenges/${challenge.id}`, text: 'Zobrazit detail', priority: false };
    };
    const action = getAction();

    return (
        <div className={`bg-white p-6 rounded-2xl shadow-sm flex flex-col h-full hover:shadow-md transition-all duration-300
            ${needsAttention ? 'border-2 border-red-500' : 'border border-gray-100'}`}>
            
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl text-[var(--barva-tmava)] pr-2 line-clamp-2">{challenge.title}</h3>
                <div className="flex-shrink-0">
                    {needsAttention ? (
                         <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-red-100 text-red-700">
                            <AlertTriangle size={14} />
                            <span>Vyžaduje akci</span>
                        </div>
                    ) : (
                        <DeadlineTag deadline={challenge.deadline} />
                    )}
                </div>
            </div>

            <p className="text-gray-500 text-base min-h-[40px] line-clamp-2 my-4 flex-grow">{challenge.short_description}</p>        

            {/* UPRAVENÁ SEKCE PRO STATISTIKY */}
            <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                    <StatItem icon={Users} text={`${applicantCount} / ${challenge.max_applicants || '∞'} přihlášeno`} />
                    {challenge.max_applicants && <span className="text-xs font-semibold text-gray-400">{Math.round(progress)}%</span>}
                </div>
                
                {unreviewedCount > 0 && <StatItem icon={CheckCircle} text={`${unreviewedCount} neohodnocených řešení`} colorClass="text-blue-600 font-bold" />}

                {challenge.max_applicants && (
                     <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div className="bg-[var(--barva-primarni)] h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                )}
            </div>

            <div className="mt-auto border-t-2 border-[var(--barva-svetle-pozadi)] pt-4 flex justify-between items-center">
                <div className="text-xs text-gray-400 space-y-1">
                    <p>Vytvořeno: {new Date(challenge.created_at).toLocaleDateString('cs-CZ')}</p>
                    {challenge.deadline && <p>Konec: {new Date(challenge.deadline).toLocaleDateString('cs-CZ')}</p>}
                </div>
                <Link 
                    href={action.href} 
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300
                        ${action.priority 
                            ? 'bg-[var(--barva-primarni)] text-white hover:bg-blue-700' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                >
                    {action.text}
                </Link>
            </div>
        </div>
    );
}

