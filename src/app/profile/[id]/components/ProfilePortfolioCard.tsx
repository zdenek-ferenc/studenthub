"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star, Trophy } from 'lucide-react';

type PortfolioCardProps = {
    submission: {
        rating: number | null;
        position: number | null;
        Challenge: {
            id: string;
            title: string;
            ChallengeSkill: { Skill: { name: string } }[];
            StartupProfile: {
                company_name: string;
                logo_url: string | null;
            } | null;
        } | null;
    }
};

// --- ZDE JE TA OPRAVA ---
// Komponenta nyní zobrazí oba tagy, pokud existují.
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
                <div className="flex items-center gap-1.5 text-sm font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    <Star size={14} />
                    <span>{rating} / 10</span>
                </div>
            )}
        </div>
    );
};


export default function ProfilePortfolioCard({ submission }: PortfolioCardProps) {
    if (!submission.Challenge) return null;
    const { Challenge, rating, position } = submission;

    const skills = Challenge.ChallengeSkill.map(cs => cs.Skill.name);

    return (
        <Link href={`/challenges/${Challenge.id}`} className="block group">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 h-full flex flex-col">
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
                            <span key={skillName} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                                {skillName}
                            </span>
                        ))}
                        {skills.length > 3 && (
                            <span className="px-2.5 py-1 bg-gray-200 text-gray-800 rounded-md text-xs font-bold">
                                +{skills.length - 3}
                            </span>
                        )}
                    </div>
                </div>
                
                {/* Upravili jsme layout, aby se tagy zobrazovaly vedle sebe */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end">
                    <ResultTag rating={rating} position={position} />
                </div>
            </div>
        </Link>
    );
}