"use client";

import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Star, Trophy, ChevronRight } from 'lucide-react';

export type CompletedChallengeData = {
  Challenge: {
    id: string;
    title: string;
    StartupProfile: {
      company_name: string;
      logo_url: string | null;
    } | null;
  } | null;
  rating: number | null;
  position: number | null;
};

const ResultTag = ({ rating, position }: { rating: number | null, position: number | null }) => {
    if (position && position <= 3) {
        return (
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="items-center flex gap-1.5 text-sm font-semibold text-yellow-500">
                  <div className="items-center flex gap-1.5">
                    <Trophy size={16} />
                    <span className='leading-none bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent'>{position}. místo</span>
                </div>
            </div>
                {rating && (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--barva-primarni)]">
                        <Star size={16} />
                        <span className='leading-none'>{rating} / 10</span>
                    </div>
                )}
            </div>
        );
    }
    if (rating) {
        return (
            <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                <Star size={16} />
                <span>{rating} / 10</span>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">
            <CheckCircle size={16} />
            <span>Dokončeno</span>
        </div>
    );
};

export default function CompletedChallengeCard({ submission }: { submission: CompletedChallengeData }) {
  if (!submission || !submission.Challenge) {
    return null;
  }

  const { Challenge, rating, position } = submission;

  return (
    <Link href={`/challenges/${Challenge.id}`} className="block group">
      <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 shadow-xs hover:border-blue-200 hover:shadow-sm hover:bg-blue-50/50 transition-all duration-300 flex items-center gap-4">
        <Image 
            src={Challenge.StartupProfile?.logo_url || '/logo.svg'} 
            alt="logo" 
            width={56} 
            height={56} 
            className="rounded-xl w-14 h-14 object-cover flex-shrink-0" 
        />
        <div className="flex-grow min-w-0">
            <h4 className="text-md sm:text-lg font-bold text-[var(--barva-tmava)] truncate">{Challenge.title}</h4>
            <p className="text-sm font-semibold text-gray-500 truncate">{Challenge.StartupProfile?.company_name}</p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-4">
            <ResultTag rating={rating} position={position} />
            <div className="hidden sm:block opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300">
                <ChevronRight size={20} strokeWidth={2.5} className="text-blue-500" />
            </div>
        </div>
      </div>
    </Link>
  );
}