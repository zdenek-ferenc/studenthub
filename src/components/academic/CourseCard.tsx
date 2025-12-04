"use client";

import { AcademicRequest } from '../../types/academic';
import { Users, Copy, Check, Edit, Eye, Download } from 'lucide-react';
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

    const statusColors = {
        open: 'bg-emerald-100 text-emerald-700',
        matched: 'bg-blue-100 text-blue-700',
        closed: 'bg-gray-100 text-gray-700'
    };

    const statusLabels = {
        open: 'Otevřeno',
        matched: 'Propojeno',
        closed: 'Uzavřeno'
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm duration-300 border-2 border-gray-100 overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                <div className="flex justify-between items-start mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[request.status]}`}>
                        {statusLabels[request.status]}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{request.semester}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 line-clamp-1" title={request.subject_name}>
                    {request.subject_name}
                </h3>
            </div>

            {/* Body */}
            <div className="p-5 flex-grow">
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Users size={18} className="text-gray-400" />
                    <span className="font-medium">{request.student_count} studentů</span>
                </div>
                
                <div className="bg-indigo-50 rounded-xl p-3 flex items-center justify-between group">
                    <div className="flex flex-col">
                        <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Kód předmětu</span>
                        <span className="text-indigo-900 font-mono font-bold text-lg">{request.join_code}</span>
                    </div>
                    <button 
                        onClick={handleCopyCode}
                        className="p-2 rounded-lg cursor-pointer hover:bg-indigo-100 text-indigo-600 transition-colors focus:outline-none"
                        title="Zkopírovat kód"
                    >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                </div>
            </div>
            <div className="p-3 bg-gray-50 border-t border-gray-100 grid grid-cols-3 gap-1">
                <button className="flex cursor-pointer flex-col items-center justify-center p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-500 hover:text-[var(--barva-primarni)] text-xs gap-1">
                    <Edit size={16} />
                    <span>Upravit</span>
                </button>   
                <button className="flex cursor-pointer flex-col items-center justify-center p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-500 hover:text-[var(--barva-primarni)] text-xs gap-1">
                    <Eye size={16} />
                    <span>Studenti</span>
                </button>
                <button className="flex cursor-pointer flex-col items-center justify-center p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-500 hover:text-[var(--barva-primarni)] text-xs gap-1">
                    <Download size={16} />
                    <span>Export</span>
                </button>
            </div>
        </div>
    );
}
