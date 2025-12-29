"use client";

import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Star, Trophy, ArrowRight } from 'lucide-react';
import { CleanSubmission } from '../../../../contexts/DashboardContext';

const getInitials = (name: string) => name?.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';

export default function ModernCompletedChallengeCard({ submission }: { submission: CleanSubmission }) {
    if (!submission || !submission.Challenge) return null;
    const { Challenge, rating, position } = submission;

    return (
        <Link href={`/challenges/${Challenge.id}`} className="block group h-full">
            <div className="bg-[#0B1623]/40 border border-white/5 rounded-2xl p-4 md:p-5 hover:bg-[#0B1623]/60 hover:border-white/10 transition-all h-full flex flex-col md:flex-row md:items-center gap-1">
                
                <div className="flex items-start md:items-center gap-4 flex-grow min-w-0">
                    <div className="hidden md:flex w-12 h-12 shrink-0 rounded-full overflow-hidden bg-white/5 border border-white/10 items-center justify-center">
                        {Challenge.StartupProfile?.logo_url ? (
                            <Image src={Challenge.StartupProfile.logo_url} alt="logo" width={48} height={48} className="object-cover w-full h-full" />
                        ) : (
                            <span className="text-gray-500 font-bold">{getInitials(Challenge.StartupProfile?.company_name || '')}</span>
                        )}
                    </div>

                    <div className="flex-grow min-w-0">
                        <h4 className="text-base md:text-lg font-bold text-white leading-tight mb-1 group-hover:text-blue-400 transition-colors line-clamp-2 md:line-clamp-1">
                            {Challenge.title}
                        </h4>
                        
                        <p className="text-xs md:text-sm text-gray-500 font-medium truncate">
                            {Challenge.StartupProfile?.company_name}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 mt-2 pt-3 border-t border-white/5 md:mt-0 md:pt-0 md:border-0 shrink-0">
                    
                    <div className="flex-shrink-0">
                        {position && position <= 3 ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs md:text-sm font-bold">
                                <Trophy size={14} /> 
                                <span>{position}. místo</span>
                            </div>
                        ) : rating ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs md:text-sm font-bold">
                                <Star size={14} /> 
                                <span>{rating}/10</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-500/10 border border-gray-500/20 text-gray-400 text-xs md:text-sm font-medium">
                                <CheckCircle size={14} /> 
                                <span>Hotovo</span>
                            </div>
                        )}
                    </div>
                    <ArrowRight size={18} className="text-gray-600 group-hover:text-white transition-colors transform group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
}