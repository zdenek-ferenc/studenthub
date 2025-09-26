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
            StartupProfile: {
                company_name: string;
                logo_url: string | null;
            } | null;
        } | null;
    }
};

const ResultTag = ({ rating, position }: { rating: number | null, position: number | null }) => {
    if (position && position <= 3) {
        return (
            <div className="flex items-center gap-1.5 text-sm font-semibold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                <Trophy size={14} />
                <span>{position}. místo</span>
            </div>
        );
    }
    if (rating) {
        return (
            <div className="flex items-center gap-1.5 text-sm font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                <Star size={14} />
                <span>{rating} / 10</span>
            </div>
        );
    }
    return null;
};

export default function PortfolioCard({ submission }: PortfolioCardProps) {
    if (!submission.Challenge) return null;
    const { Challenge, rating, position } = submission;

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
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end">
                    <ResultTag rating={rating} position={position} />
                </div>
            </div>
        </Link>
    );
}