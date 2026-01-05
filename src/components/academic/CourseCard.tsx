"use client";

import { AcademicRequest, AcademicRequestStatus } from '../../types/academic';
import { Users, Copy, Check, Edit, Eye, Download, FileText } from 'lucide-react';
import { useState } from 'react';

interface CourseCardProps {
    request: AcademicRequest;
}

export default function CourseCard({ request }: CourseCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(request.join_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Explicitně řekneme TypeScriptu, že toto jsou barvy pro všechny možné statusy
    const statusColors: Record<AcademicRequestStatus, string> = {
        open: 'bg-emerald-100 text-emerald-700',
        matched: 'bg-blue-100 text-blue-700',
        closed: 'bg-gray-100 text-gray-700',
        draft: 'bg-amber-100 text-amber-700' // Nová barva pro koncept
    };

    const statusLabels: Record<AcademicRequestStatus, string> = {
        open: 'Otevřeno pro startupy',
        matched: 'Propojeno',
        closed: 'Uzavřeno',
        draft: 'Koncept (Nezveřejněno)' // Nový popisek
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md duration-300 border-2 border-gray-100 overflow-hidden flex flex-col h-full group/card transition-all">
            {/* Header */}
            <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                <div className="flex justify-between items-start mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[request.status] || 'bg-gray-100 text-gray-500'}`}>
                        {statusLabels[request.status]}
                    </span>
                    <span className="text-xs text-gray-400 font-medium bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                        {request.semester}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover/card:text-[var(--barva-primarni)] transition-colors" title={request.subject_name}>
                    {request.subject_name}
                </h3>
            </div>

            {/* Body */}
            <div className="p-5 flex-grow flex flex-col gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Users size={16} />
                    </div>
                    <span className="font-medium text-sm">{request.student_count} studentů</span>
                </div>

                {/* Zobrazení typu projektu pokud existuje */}
                {request.project_types && request.project_types.length > 0 && (
                     <div className="flex items-center gap-2 text-gray-600">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <FileText size={16} />
                        </div>
                        <span className="font-medium text-sm line-clamp-1" title={request.project_types[0].title}>
                            {request.project_types[0].title}
                        </span>
                    </div>
                )}
                
                <div className="mt-auto bg-gray-50 rounded-xl p-3 flex items-center justify-between group/code border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Kód pro studenty</span>
                        <span className="text-gray-900 font-mono font-bold text-lg tracking-wide">{request.join_code}</span>
                    </div>
                    <button 
                        onClick={handleCopyCode}
                        className="p-2.5 rounded-xl cursor-pointer bg-white text-gray-400 hover:text-[var(--barva-primarni)] hover:shadow-sm border border-transparent hover:border-gray-100 transition-all focus:outline-none active:scale-95"
                        title="Zkopírovat kód"
                    >
                        {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                    </button>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-2 bg-gray-50/80 border-t border-gray-100 grid grid-cols-3 gap-1">
                <button className="flex cursor-pointer flex-col items-center justify-center p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-500 hover:text-[var(--barva-primarni)] text-[10px] font-medium gap-1.5 group/btn">
                    <Edit size={16} className="group-hover/btn:scale-110 transition-transform" />
                    <span>Upravit</span>
                </button>   
                <button className="flex cursor-pointer flex-col items-center justify-center p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-500 hover:text-[var(--barva-primarni)] text-[10px] font-medium gap-1.5 group/btn">
                    <Eye size={16} className="group-hover/btn:scale-110 transition-transform" />
                    <span>Detail</span>
                </button>
                <button className="flex cursor-pointer flex-col items-center justify-center p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-500 hover:text-[var(--barva-primarni)] text-[10px] font-medium gap-1.5 group/btn">
                    <Download size={16} className="group-hover/btn:scale-110 transition-transform" />
                    <span>Export</span>
                </button>
            </div>
        </div>
    );
}