"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star, Trophy } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext'; 

type PortfolioCardProps = {
    submission: {
        rating: number | null;
        position: number | null;
        Challenge: {
            id: string;
            title: string;
            startup_id: string;
            ChallengeSkill: { Skill: { name: string } }[];
            StartupProfile: {
                company_name: string;
                logo_url: string | null;
            } | null;
        } | null;
    }
};


const ResultTag = ({ rating, position }: { rating: number | null, position: number | null }) => {
    return (
        <div className="flex items-center gap-2">
            {position && position <= 3 && (
                <div className="flex items-center gap-1.5 text-sm font-semibold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                    <Trophy size={14} />
                    <span>{position}. místo</span>
                </div>
            )}
            {rating && (
                <div className="flex items-center gap-1.5 text-sm font-semibold bg-[var(--barva-primarni)] text-white px-3 py-1 rounded-full">
                    <Star size={14} />
                    <span>{rating} / 10</span>
                </div>
            )}
        </div>
    );
};


export default function ProfilePortfolioCard({ submission }: PortfolioCardProps) {
    const { user, profile } = useAuth();

    if (!submission.Challenge) return null;
    const { Challenge, rating, position } = submission;

    const isStudent = profile?.role === 'student';
    const isOwnerOfChallenge = user?.id === Challenge.startup_id;
    const canClick = isStudent || isOwnerOfChallenge;

    const skills = Challenge.ChallengeSkill.map(cs => cs.Skill.name);

    const cardContent = (
        <div className={`bg-white rounded-2xl p-6 border border-gray-100 ${canClick ? 'group-hover:shadow-lg group-hover:border-blue-200' : 'shadow-none'} transition-all duration-300 h-full flex flex-col`}>
            <div className="flex items-center gap-4 mb-4">
                <Image
                    src={Challenge.StartupProfile?.logo_url || '/logo.svg'}
                    alt={Challenge.StartupProfile?.company_name || 'Logo'}
                    width={48}
                    height={48}
                    className="rounded-lg w-12 h-12 object-cover"
                />
                <div>
                    <h4 className="font-bold text-lg text-[var(--barva-tmava)] line-clamp-2">{Challenge.title}</h4>
                    <p className="text-sm text-gray-500 font-medium">{Challenge.StartupProfile?.company_name}</p>
                </div>
            </div>

            <div className="flex-grow mb-4">
                <div className="flex flex-wrap gap-2">
                    {skills.slice(0, 3).map(skillName => (
                        <span key={skillName} className="px-2.5 py-1 bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)] rounded-md text-xs font-medium">
                            {skillName}
                        </span>
                    ))}
                    {skills.length > 3 && (
                        <span className="px-1 py-1 text-[var(--barva-primarni)] rounded-md text-xs">
                            +{skills.length - 3}
                        </span>
                    )}
                </div>
            </div>
            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end">
                <ResultTag rating={rating} position={position} />
            </div>
        </div>
    );

    if (canClick) {
        return (
            <Link href={`/challenges/${Challenge.id}`} className="block group">
                {cardContent}
            </Link>
        );
    }

    return (
        <div className="block">
            {cardContent}
        </div>
    );
}