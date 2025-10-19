"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ChevronRight, Users, Clock, AlertTriangle } from 'lucide-react';
import { differenceInCalendarDays } from 'date-fns';

export type RecommendedChallenge = {
    id: string;
    title: string;
    deadline: string | null;
    applicantCount: number;
    max_applicants: number | null;
    StartupProfile: {
        company_name: string;
        logo_url: string | null;
    } | null;
    matchingSkills: number;
    requiredSkills: number;
};

const InfoTag = ({ icon: Icon, text, colorClass, className }: { icon: React.ElementType, text: string | React.ReactNode, colorClass?: string, className?: string }) => (
    <div className={`flex items-center gap-1.5 text-xs 3xl:text-sm font-semibold ${colorClass || 'text-gray-600'} ${className}`}>
        <Icon size={14} className="flex-shrink-0" />
        <span>{text}</span>
    </div>
);

export default function RecommendedChallengeCard({ challenge }: { challenge: RecommendedChallenge }) {
    const daysRemaining = challenge.deadline ? differenceInCalendarDays(new Date(challenge.deadline), new Date()) : null;
    let deadlineText: string | null = null;
    let deadlineColor = 'text-gray-600';

    if (daysRemaining !== null) {
        if (daysRemaining < 0) {
            deadlineText = 'Ukončeno';
            deadlineColor = 'text-red-500';
        } else if (daysRemaining === 0) {
            deadlineText = 'Dnes končí!';
            deadlineColor = 'text-orange-500';
        } else if (daysRemaining === 1) {
            deadlineText = 'Zbývá 1 den';
            deadlineColor = 'text-orange-500';
        } else if (daysRemaining <= 4) {
            deadlineText = `Zbývají ${daysRemaining} dny`;
            deadlineColor = 'text-orange-500';
        } else if (daysRemaining <= 7) {
            deadlineText = `Zbývá ${daysRemaining} dní`;
            deadlineColor = 'text-orange-500';
        } else {
            deadlineText = `Zbývá ${daysRemaining} dní`;
        }
    }

    return (
        <Link href={`/challenges/${challenge.id}`} className="group block bg-white p-1 lg:p-2 2xl:p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:bg-blue-50 transition-all duration-300 h-full">
            <div className="flex flex-col justify-between h-full">
                <div className="flex items-start gap-4">
                    <Image 
                        src={challenge.StartupProfile?.logo_url || '/logo.svg'} 
                        alt="logo" 
                        width={48} 
                        height={48} 
                        className="rounded-lg w-10 h-10 3xl:w-12 3xl:h-12 object-cover flex-shrink-0" 
                    />
                    <div className="flex-grow min-w-0">
                        <p className="text-xs 3xl:text-sm font-semibold text-gray-500 truncate">{challenge.StartupProfile?.company_name}</p>
                        <h5 className="text-xs xl:text-sm 3xl:text-lg font-bold text-gray-800 break-words">{challenge.title}</h5>
                    </div>
                    <div className="hidden sm:block opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300 self-center">
                        <ChevronRight size={24} strokeWidth={2.5} className="text-blue-500" />
                    </div>
                </div>
                <div className="mt-4 3xl:pt-3 border-gray-100 flex flex-wrap items-center gap-x-6 gap-y-2 leading-none">
                    <div className='border-2 border-[var(--barva-primarni)]/90 px-3 py-1.5 3xl:px-4 3xl:py-2 rounded-3xl'>
                        <InfoTag 
                        icon={Sparkles} 
                        text={<>Shoda dovedností: <strong>{challenge.matchingSkills}/{challenge.requiredSkills}</strong></>}
                        colorClass="text-[var(--barva-primarni)]"
                        />
                    </div>
                    <InfoTag 
                        icon={Users} 
                        text={<>{challenge.applicantCount} / {challenge.max_applicants || '∞'}</>}
                        className="hidden sm:flex"
                    />
                    {deadlineText && <InfoTag icon={daysRemaining !== null && daysRemaining < 0 ? AlertTriangle : Clock} text={deadlineText} colorClass={deadlineColor} />}
                </div>
            </div>
        </Link>
    );
}