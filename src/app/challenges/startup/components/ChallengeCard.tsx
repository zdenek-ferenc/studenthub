"use client";

import Link from 'next/link';
import { ReactNode } from 'react';
import DeadlineTag from '../../../../components/DeadlineTag';
import { Users, CheckCircle, AlertTriangle, Edit3, Award, Archive } from 'lucide-react';
import { Challenge } from '../StartupChallengesView'; 

type ActionPriority = 'critical' | 'urgent' | 'default';

const StatItem = ({ icon: Icon, text, colorClass }: { icon: React.ElementType, text: ReactNode, colorClass?: string }) => (
    <div className={`flex items-center gap-2 text-sm font-medium ${colorClass || 'text-gray-500'}`}>
        <Icon size={16} className="flex-shrink-0" />
        <span>{text}</span>
    </div>
);

export default function ChallengeCard({ challenge }: { challenge: Challenge }) {
    const applicantCount = challenge.Submission?.length || 0;
    const submittedCount = challenge.Submission?.filter(s => s.status === 'submitted' || s.status === 'reviewed').length || 0;
    const unreviewedCount = challenge.Submission?.filter((s: { status: string }) => s.status === 'submitted').length || 0;
    const progress = challenge.max_applicants ? (applicantCount / challenge.max_applicants) * 100 : 0;
    
    const isPastDeadline = challenge.deadline ? new Date() > new Date(challenge.deadline) : false;
    const isDraft = challenge.status === 'draft';
    const isCompleted = challenge.status === 'closed' || challenge.status === 'archived';

    const isCritical = isPastDeadline && !isDraft && !isCompleted;
    const isFull = challenge.max_applicants ? applicantCount >= challenge.max_applicants : false;
    const allAppliedHaveSubmitted = isFull && submittedCount === applicantCount;
    const isUrgent = !isCritical && allAppliedHaveSubmitted && unreviewedCount > 0;
    
    const allSubmittedAreRated = submittedCount > 0 && unreviewedCount === 0;

    const getAction = () => {
        if (isCompleted) {
            return {
                text: 'Zobrazit výsledky',
                href: `/challenges/${challenge.id}`,
                icon: Archive,
                priority: 'default' as ActionPriority,
                tag: null 
            };
        }
        
        if (isDraft) {
            return {
                text: 'Dokončit koncept',
                href: `/challenges/create?draft_id=${challenge.id}`,
                icon: Edit3,
                priority: 'urgent' as ActionPriority,
                tag: { text: 'Koncept', icon: Edit3, color: 'yellow' }
            };
        }

        if (isCritical) {
            if (!allSubmittedAreRated) {
                return {
                    text: `Ohodnotit (${unreviewedCount})`,
                    href: `/challenges/${challenge.id}`,
                    icon: CheckCircle,
                    priority: 'critical' as ActionPriority,
                    tag: { text: 'Vyžaduje hodnocení', icon: AlertTriangle, color: 'red' }
                };
            }
            return {
                text: 'Vybrat vítěze',
                href: `/challenges/${challenge.id}`,
                icon: Award,
                priority: 'critical' as ActionPriority,
                tag: { text: 'Vyberte vítěze', icon: Award, color: 'red' }
            };
        }
        
        if (isUrgent) {
            return {
                text: `Ohodnotit (${unreviewedCount})`,
                href: `/challenges/${challenge.id}`,
                icon: CheckCircle,
                priority: 'urgent' as ActionPriority,
                tag: { text: 'Připraveno k hodnocení', icon: AlertTriangle, color: 'yellow' }
            };
        }

        return {
            text: 'Zobrazit detail',
            href: `/challenges/${challenge.id}`,
            icon: null,
            priority: 'default' as ActionPriority,
            tag: null
        };
    };

    const action = getAction();

    const borderClasses = {
        critical: 'border-2 border-red-500',
        urgent: 'border-2 border-yellow-400',
        default: 'border border-gray-100 shadow-sm'
    };
    
    const tagColors = {
        red: 'bg-red-100 text-red-700',
        yellow: 'bg-yellow-100 text-yellow-800',
        green: 'bg-green-100 text-green-700'
    };

    return (
        <div className={`bg-white p-6 rounded-2xl flex flex-col h-full hover:shadow-md transition-all duration-300 ${borderClasses[action.priority]}`}>
            
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl text-[var(--barva-tmava)] pr-2 line-clamp-2">{challenge.title}</h3>
                <div className="flex-shrink-0">
                    {action.tag ? (
                        <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${tagColors[action.tag.color as keyof typeof tagColors]}`}>
                            <action.tag.icon size={14} />
                            <span>{action.tag.text}</span>
                        </div>
                    ) : (
                        <DeadlineTag deadline={challenge.deadline} />
                    )}
                </div>
            </div>
            <p className="text-gray-500 text-base min-h-[40px] line-clamp-2 my-4 flex-grow">
                {challenge.short_description || <span className="italic text-gray-400">Zatím bez popisu...</span>}
            </p>        
            <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                    <StatItem icon={Users} text={`${applicantCount} / ${challenge.max_applicants || '∞'} přihlášeno`} />
                    {challenge.max_applicants && <span className="text-xs font-semibold text-gray-400">{Math.round(progress)}%</span>}
                </div>                
                {unreviewedCount > 0 && !isCompleted && <StatItem icon={CheckCircle} text={`${unreviewedCount} neohodnocených řešení`} colorClass="text-blue-600 font-bold" />}
                {challenge.max_applicants && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div className="bg-[var(--barva-primarni)] h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                )}
            </div>
            <div className="mt-auto border-t-2 border-[var(--barva-svetle-pozadi)] pt-4 flex justify-between items-center">
                <div className="text-xs text-gray-400 space-y-1">
                    <p>Vytvořeno: {new Date(challenge.created_at).toLocaleDateString('cs-CZ')}</p>
                    {challenge.deadline && (
                        <p className={isPastDeadline && !isCompleted ? 'text-red-500 font-semibold' : ''}>
                            Konec: {new Date(challenge.deadline).toLocaleDateString('cs-CZ')}
                        </p>
                    )}

                </div>
                <Link 
                    href={action.href} 
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2
                        ${action.priority !== 'default'
                            ? 'bg-[var(--barva-primarni)] text-white hover:opacity-90' 
                            : 'text-[var(--barva-primarni)]'
                        }`}
                >
                    {action.icon && <action.icon size={16} />}
                    {action.text}
                </Link>
            </div>
        </div>
    );
}