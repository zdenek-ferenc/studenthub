import React from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, PlusCircle } from 'lucide-react';
import { StudentProfile } from '../types';

const RecruitmentStatusTag = ({ status, isOwner, viewerRole }: { status: StudentProfile['recruitment_status'], isOwner: boolean, viewerRole: 'student' | 'startup' | 'admin' | null }) => {
    if (status === 'open_to_work') {
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs sm:text-sm font-semibold border border-green-200">
                <CheckCircle size={14} />
                Otevřený nabídkám
            </div>
        );
    }

    if (status === 'not_looking' && (isOwner || viewerRole === 'startup' || viewerRole === 'admin')) {
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs sm:text-sm font-semibold border border-gray-200">
                <XCircle size={14} />
                Momentálně nehledá
            </div>
        );
    }

    if (status === null && isOwner) {
        return (
            <Link href="/profile/edit?tab=personal" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-500 text-xs sm:text-sm font-medium border border-gray-200 hover:border-gray-400 transition-colors">
                <PlusCircle size={14} />
                Nastavit pracovní status
            </Link>
        );
    }
    return null;
}

export default RecruitmentStatusTag;
