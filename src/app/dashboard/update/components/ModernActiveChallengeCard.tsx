"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Clock, Edit3, CalendarPlus } from 'lucide-react';
import { differenceInCalendarDays } from 'date-fns';
import { type CleanSubmission } from '../../../../contexts/DashboardContext'; // Používáme typ z kontextu
import { generateGoogleCalendarUrl, generateIcsFile } from '../../../../lib/utils/calendar';

const getInitials = (name: string) => name?.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';

export default function ModernActiveChallengeCard({ submission }: { submission: CleanSubmission }) {
    const [showCalendarMenu, setShowCalendarMenu] = useState(false);

    if (!submission || !submission.Challenge) return null;

    const { Challenge } = submission;
    
    const expectedOutputs = Challenge.expected_outputs || "";
    const totalOutputs = expectedOutputs.split('\n').filter(line => line.trim() !== '').length;
    const completedCount = submission.completed_outputs?.length || 0;
    
    const progressPercent = totalOutputs > 0 ? (completedCount / totalOutputs) * 100 : 0;
    
    const daysRemaining = Challenge.deadline ? differenceInCalendarDays(new Date(Challenge.deadline), new Date()) : null;
    
    let statusText = '';
    let statusColor = 'text-gray-400';
    if (submission.status === 'applied') { statusText = 'Řešení rozpracováno'; statusColor = 'text-blue-400'; }
    else if (submission.status === 'submitted') { statusText = 'Odevzdáno'; statusColor = 'text-amber-400'; }
    else if (submission.status === 'reviewed') { statusText = 'Vyhodnoceno'; statusColor = 'text-green-400'; }

    const handleAddToCalendar = (type: 'google' | 'ics') => {
        if (!Challenge.deadline) return;
        
        const event = {
            title: `Deadline: ${Challenge.title}`,
            description: `Odevzdat řešení pro výzvu na RiseHigh.`,
            startTime: Challenge.deadline, 
            location: 'RiseHigh.io'
        };

        if (type === 'google') {
            window.open(generateGoogleCalendarUrl(event), '_blank');
        } else {
            const url = generateIcsFile(event);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'deadline.ics';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        setShowCalendarMenu(false);
    };

    return (
        <div className="relative group block h-full"> 
            <div className="bg-[#0B1623]/80 cursor-pointerbackdrop-blur-xl border border-blue-500/30 rounded-3xl p-3 md:p-5 hover:border-blue-500/70 transition-all duration-300 relative overflow-visible flex flex-col h-full">
                <div className="flex flex-col md:flex-row gap-5 items-start md:items-center flex-1">
                    <Link href={`/challenges/${Challenge.id}`} className="flex flex-1 gap-4 w-full group/link min-w-0">                        
                        <div className="hidden md:block shrink-0 pt-1 md:pt-0">
                            {Challenge.StartupProfile?.logo_url ? (
                                <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden bg-white/5 border border-white/10 shadow-sm transition-transform">
                                    <Image src={Challenge.StartupProfile.logo_url} alt="logo" fill className="object-cover" />
                                </div>
                            ) : (
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 font-bold text-lg transition-transform">
                                    {getInitials(Challenge.StartupProfile?.company_name || '')}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col flex-1 min-w-0 justify-center">
                            <div className="mb-1 flex flex-col gap-1">
                                <span className="text-[10px] md:text-xs text-blue-400 font-bold uppercase group-hover/link:text-white transition-all ease-in-out duration-300 tracking-wider block mb-0.5 truncate">
                                    {Challenge.StartupProfile?.company_name}
                                </span>
                                <h4 className="text-sm md:text-lg mb-1 font-bold text-white group-hover/link:text-blue-400 transition-all ease-in-out duration-300 leading-tight line-clamp-2 break-words">
                                    {Challenge.title}
                                </h4>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className={`inline-flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg text-[10px] md:text-xs font-medium ${statusColor} whitespace-nowrap`}>
                                    <Edit3 size={12} /> {statusText}
                                </span>
                                {daysRemaining !== null && (
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 text-[10px] md:text-xs font-medium whitespace-nowrap ${daysRemaining <= 3 ? 'text-red-400' : 'text-gray-400'}`}>
                                        <Clock size={12} /> 
                                        {daysRemaining < 0 ? 'Po termínu' : `${daysRemaining} dní`}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>

                    <div className="w-full md:w-auto flex items-stretch gap-3 md:gap-2">
                        <div className="hidden md:block w-full md:w-48 bg-[#001224]/50 rounded-xl p-2.5 border border-white/5 shrink-0">
                            <div className="flex justify-between text-[10px] text-gray-400 mb-1.5">
                                <span>Výstupy</span>
                                <span className="text-white font-bold">{completedCount} / {totalOutputs}</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1">
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end w-full gap-2">
                            {Challenge.deadline && daysRemaining !== null && daysRemaining >= 0 && (
                                <div className="relative">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setShowCalendarMenu(!showCalendarMenu); }}
                                        className={`h-9 px-3 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold border ${
                                            showCalendarMenu 
                                            ? 'bg-blue-600 text-white border-blue-500' 
                                            : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/10'
                                        }`}
                                    >
                                        <CalendarPlus size={14} /> 
                                        <span className="inline">Deadline</span>
                                    </button>
                                    {showCalendarMenu && (
                                        <div className="absolute z-50 left-full top-0 ml-2 md:ml-0 md:left-auto md:right-0 md:top-full md:mt-2 w-48 bg-[#0B1623] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-fade-in-up">
                                            <div className="p-1 space-y-0.5">
                                                <button onClick={(e) => { e.stopPropagation(); handleAddToCalendar('google'); }} className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2 transition-colors">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span> Google Kalendář
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {showCalendarMenu && <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowCalendarMenu(false); }}></div>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}