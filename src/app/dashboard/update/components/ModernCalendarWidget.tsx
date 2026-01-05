"use client";

import { useState, useMemo } from 'react';
import { useDashboard, CleanSubmission } from '../../../../contexts/DashboardContext';
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    isSameMonth, 
    isSameDay, 
    addMonths, 
    subMonths, 
    isToday
} from 'date-fns';
import { cs } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function ModernCalendarWidget() {
    const { submissions } = useDashboard(); 
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const activeChallenges = useMemo(() => {
        if (!submissions) return [];
        return submissions.filter(s => 
            ['applied', 'submitted'].includes(s.status) || 
            (s.status === 'reviewed' && s.Challenge?.status === 'open')
        );
    }, [submissions]);

    
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); 
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const dateFormat = "d";
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    const deadlines = activeChallenges
        .map((sub: CleanSubmission) => ({
            date: sub.Challenge?.deadline ? new Date(sub.Challenge.deadline) : null,
            title: sub.Challenge?.title || ''
        }))
        .filter((d): d is { date: Date; title: string } => d.date !== null);

    const hasDeadline = (date: Date) => {
        return deadlines.some(d => isSameDay(d.date, date));
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    return (
        <div className="bg-[#0B1623]/60 backdrop-blur-xl shadow-xl border border-white/5 rounded-3xl p-4 md:p-6 h-full min-h-[300px] flex flex-col">
            
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-sm md:text-base text-white flex items-center gap-2">
                    <CalendarIcon size={18} className="text-blue-400" /> 
                    Kalendář
                </h3>
                <div className="flex items-center gap-2 bg-[#001224] rounded-lg p-1 border border-white/5">
                    <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"><ChevronLeft size={16}/></button>
                    <span className="text-xs font-bold text-white min-w-[80px] text-center capitalize">
                        {format(currentMonth, 'MMMM yyyy', { locale: cs })}
                    </span>
                    <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"><ChevronRight size={16}/></button>
                </div>
            </div>

            <div className="grid grid-cols-7 mb-2">
                {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map((dayName) => (
                    <div key={dayName} className="text-center text-[10px] uppercase font-bold text-gray-600 py-1">
                        {dayName}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 flex-1 content-start">
                {allDays.map((date, i) => {
                    const isDeadline = hasDeadline(date);
                    const isCurrentMonth = isSameMonth(date, monthStart);
                    const isTodayDate = isToday(date);

                    let bgClass = 'hover:bg-white/5';
                    let textClass = !isCurrentMonth ? 'text-gray-700 opacity-30' : 'text-gray-400';
                    let borderClass = 'border border-transparent';

                    if (isTodayDate) {
                        bgClass = 'bg-blue-600 shadow-lg shadow-blue-900/30';
                        textClass = 'text-white font-bold';
                    } else if (isDeadline) {
                        
                        bgClass = 'bg-red-500/20';
                        textClass = 'text-red-200 font-bold';
                        borderClass = 'border border-red-500/50';
                    }
                    
                    if (isTodayDate && isDeadline) {
                        borderClass = 'border-2 border-red-400'; 
                    }
                    return (
                        <div 
                            key={i} 
                            className={`
                                relative h-8 sm:h-10 rounded-lg flex items-center justify-center text-xs font-medium transition-all group
                                ${bgClass} ${textClass} ${borderClass}
                            `}
                        >
                            {format(date, dateFormat)}
                            
                            {isDeadline && (
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-black/90 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 border border-white/10 truncate shadow-xl">
                                    {deadlines.find(d => isSameDay(d.date, date))?.title}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-wider">Nejbližší deadliny</p>
                <div className="space-y-2">
                    {deadlines
                        .filter(d => d.date >= new Date())
                        .sort((a, b) => a.date.getTime() - b.date.getTime())
                        .slice(0, 2)
                        .map((d, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                                <div className="w-2 h-2 rounded border border-red-500 bg-red-500/20"></div>
                                <span className="flex-1 truncate">{d.title}</span>
                                <span className="text-gray-500 text-[10px]">{format(d.date, 'd. M.', { locale: cs })}</span>
                            </div>
                        ))
                    }
                    {deadlines.filter(d => d.date >= new Date()).length === 0 && (
                        <p className="text-xs text-gray-600 italic">Žádné nadcházející deadliny.</p>
                    )}
                </div>
            </div>
        </div>
    );
}