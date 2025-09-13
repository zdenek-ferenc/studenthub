import { CheckCircle, Trophy } from 'lucide-react';
import Image from 'next/image'; // Importujeme Image z Next.js

type Skill = {
  id: string;
  name: string;
};

type Student = {
  user_id: string;
  first_name: string;
  last_name: string;
  username: string;
  profile_picture_url: string | null;
  bio: string | null;
  StudentSkill: { Skill: Skill }[];
  completed_challenges_count?: number; 
  won_challenges_count?: number;
};

type StudentCardProps = {
  student: Student;
};

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
};

export default function StudentCard({ student }: StudentCardProps) {
  if (!student) {
    return null;
  }

  const completedChallenges = student.completed_challenges_count ?? 3;
  const wonChallenges = student.won_challenges_count ?? 1;

  return (
      <div className="bg-white rounded-2xl shadow-xs p-6 border border-gray-100 hover:shadow-none  transition-all duration-300 flex flex-col h-full">
        
        {/* Hlavička s fotkou a jménem */}
        <div className="flex items-center gap-4 mb-4">
          {student.profile_picture_url ? (
            // OPRAVA: Používáme optimalizovanou komponentu Image
            <Image 
              src={student.profile_picture_url} 
              alt={`${student.first_name} ${student.last_name}`}
              width={56}
              height={56}
              className="w-14 h-14 rounded-full object-cover" 
            />
          ) : (
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full text-xl font-bold text-[var(--barva-primarni)]">
              <span>{getInitials(student.first_name, student.last_name)}</span>
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-gray-800">{student.first_name} {student.last_name}</h3>
            <p className="text-sm text-gray-500">@{student.username}</p>
          </div>
        </div>

        {/* Krátké bio */}
        <p className="text-gray-600 text-sm mb-5 flex-grow min-h-10 max-h-10">
          {student.bio || 'Tento uživatel zatím nepřidal žádný popis.'}
        </p>

        {/* Statistiky o výzvách */}
        <div className="flex items-center gap-6 mb-5 text-sm font-medium text-gray-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="text-green-500" size={18} />
            <span>{completedChallenges} hotové výzvy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Trophy className="text-amber-500" size={18} />
            <span>{wonChallenges} vyhraná výzva</span>
          </div>
        </div>

        {/* Seznam dovedností (tagy) */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {student.StudentSkill?.slice(0, 4).map(({ Skill }) => (
            Skill && (
              <span key={Skill.id} className="flex items-center justify-center gap-1.5 bg-[var(--barva-svetle-pozadi)] leading-none text-[var(--barva-primarni)] border border-[var(--barva-primarni)] px-3 py-2 rounded-full text-sm font-semibold transition-colors">
                {Skill.name}
              </span>
            )
          ))}
          {student.StudentSkill?.length > 4 && (
             <span className="text-[var(--barva-primarni)] text-sm">
               +{student.StudentSkill.length - 4}
             </span>
          )}
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-center">
          <button className="flex justify-between items-center bg-[var(--barva-primarni)] text-white font-bold py-2 px-5 rounded-2xl hover:opacity-90 transition-opacity cursor-pointer">
            Profil studenta
          </button>
        </div>
      </div>
  );
}
