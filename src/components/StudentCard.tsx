"use client";

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ExternalLink, Trophy, Briefcase } from 'lucide-react';

type Skill = {
id: string;
name: string;
};

type StudentSkill = {
Skill: Skill;
};

type Submission = {
id: string;
is_winner?: boolean; 
};

type Student = {
id?: string;       
user_id?: string;  
first_name: string | null;
last_name: string | null;
profile_picture_url: string | null;
bio: string | null;
StudentSkill?: StudentSkill[];
university?: string;
faculty?: string;
Submission?: Submission[]; 
wins_count?: number;
};

export default function StudentCard({ student }: { student: Student }) {

const profileId = student.user_id || student.id;

const getInitials = (first: string | null, last: string | null) => {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase() || '?';
};

const displayName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Neznámý student';
const skills = student.StudentSkill?.map(s => s.Skill) || [];

const participationCount = student.Submission?.length || 0;
const winsCount = student.wins_count ?? (student.Submission?.filter(s => s.is_winner).length || 0);

const CardContent = (
    <div 
        className="
            relative bg-white rounded-[20px] h-full flex flex-col
            border border-gray-100 shadow-sm
            transition-all duration-300 ease-in-out
            hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--barva-primarni)]/20
            active:scale-[0.99]
        "
    >
        {profileId && (
            <div className="absolute top-5 right-5 text-gray-300 group-hover:text-[var(--barva-primarni)] transition-colors duration-300">
                <ExternalLink size={18} />
            </div>
        )}

        <div className="p-5 sm:p-6 flex-grow flex flex-col">
            <div className="flex items-center gap-4 mb-4">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-full overflow-hidden border border-gray-100 bg-gray-50 group-hover:border-[var(--barva-primarni)]/10 transition-colors">
                    {student.profile_picture_url ? (
                        <Image 
                            src={student.profile_picture_url} 
                            alt={displayName}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--barva-primarni)] bg-[var(--barva-svetle-pozadi)] font-bold text-xl">
                            {getInitials(student.first_name, student.last_name)}
                        </div>
                    )}
                </div>
                
                <div className="flex-1 min-w-0 pr-6">
                    <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-[var(--barva-primarni)] transition-colors">
                        {displayName}
                    </h3>
                    {(student.university || student.faculty) && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5 truncate">
                            <MapPin size={12} />
                            <span>{student.university} {student.faculty ? `• ${student.faculty}` : ''}</span>
                        </div>
                    )}
                </div>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
                {student.bio || "Student zatím nevyplnil biografie."}
            </p>

            {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto">
                    {skills.slice(0, 3).map((skill) => (
                        <span 
                            key={skill.id}
                            className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--barva-svetle-pozadi)] text-[var(--barva-primarni)] border border-[var(--barva-primarni)] transition-colors"
                        >
                            {skill.name}
                        </span>
                    ))}
                    {skills.length > 3 && (
                        <span className="px-2 py-1 text-[11px] text-gray-400 font-medium">
                            +{skills.length - 3}
                        </span>
                    )}
                </div>
            )}
        </div>

        <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/30 rounded-b-[20px] flex items-center justify-between">
            <div className="flex items-center gap-2" title="Počet zapojených výzev">
                <div className="p-1.5 rounded-full bg-blue-50 text-blue-500">
                    <Briefcase size={14} />
                </div>
                <div className="flex flex-col leading-none">
                    <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Účast</span>
                    <span className="text-sm font-bold text-gray-700">{participationCount}x</span>
                </div>
            </div>

            <div className="flex items-center gap-2" title="Počet vyhraných výzev">
                <div className="p-1.5 rounded-full bg-amber-50 text-amber-500">
                    <Trophy size={14} />
                </div>
                <div className="flex flex-col leading-none">
                    <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Výhry</span>
                    <span className="text-sm font-bold text-gray-700">{winsCount}x</span>
                </div>
            </div>
        </div>
    </div>
);

if (profileId) {
    return (
        <Link href={`/profile/${profileId}`} className="block h-full group outline-none">
            {CardContent}
        </Link>
    );
}

console.warn(`StudentCard: Chybí ID pro studenta ${displayName}`);
return <div className="block h-full group outline-none cursor-default">{CardContent}</div>;
}