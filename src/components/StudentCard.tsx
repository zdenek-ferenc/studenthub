"use client";

import { CheckCircle, Trophy } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState, useEffect } from 'react'; 
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient'; 

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
};

type StudentCardProps = {
  student: Student;
};

const getInitials = (firstName: string, lastName:string) => {
  return `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
};

const formatChallengeText = (count: number, type: 'completed' | 'won') => {
    const nouns = {
      completed: { one: 'hotová výzva', few: 'hotové výzvy', other: 'hotových výzev' },
      won: { one: 'vyhraná výzva', few: 'vyhrané výzvy', other: 'vyhraných výzev' },
    };
    
    const selectedNouns = nouns[type];

    if (count === 1) return `${count} ${selectedNouns.one}`;
    if (count >= 2 && count <= 4) return `${count} ${selectedNouns.few}`;
    return `${count} ${selectedNouns.other}`;
};


export default function StudentCard({ student }: StudentCardProps) {
  const [stats, setStats] = useState<{ completed: number; won: number } | null>(null);

  const sortedSkills = useMemo(() => {
    if (!student?.StudentSkill) return [];
    return [...student.StudentSkill].sort((a, b) => a.Skill.name.length - b.Skill.name.length);
  }, [student?.StudentSkill]);
  

  useEffect(() => {
    const fetchChallengeStats = async () => {
        if (!student.user_id) return;

        const { data, error } = await supabase
            .from('Submission')
            .select('position, Challenge!inner(status)')
            .eq('student_id', student.user_id)
            .eq('Challenge.status', 'closed');
        
        if (error) {
            console.error(`Error fetching stats for student ${student.user_id}:`, error);
            setStats({ completed: 0, won: 0 }); 
            return;
        }

        const completedCount = data.length;
        const wonCount = data.filter(sub => sub.position !== null && sub.position <= 3).length;

        setStats({ completed: completedCount, won: wonCount });
    };

    fetchChallengeStats();
  }, [student.user_id]);


  if (!student) {
    return null;
  }

  return (
      <Link href={`/profile/${student.user_id}`} className="block group">
        <div className="bg-white rounded-2xl shadow-xs p-4 3xl:p-6 border border-gray-100 group-hover:shadow-md transition-all duration-300 ease-in-out flex flex-col h-full">
          <div className="flex items-center gap-4 mb-4">
            {student.profile_picture_url ? (
              <Image 
                src={student.profile_picture_url} 
                alt={`${student.first_name} ${student.last_name}`}
                width={56}
                height={56}
                className="w-10 h-10 3xl:w-14 3xl:h-14 rounded-full object-cover" 
              />
            ) : (
              <div className="flex items-center justify-center w-10 h-10 3xl:w-14 3xl:h-14 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full text-xs lg:text-[14px] 3xl:text-lg font-bold text-[var(--barva-primarni)]">
                <span>{getInitials(student.first_name, student.last_name)}</span>
              </div>
            )}
            <div>
              <h3 className="text-sm 3xl:text-lg font-bold text-gray-800">{student.first_name} {student.last_name}</h3>
              <p className="text-xs 3xl:text-sm text-gray-500">@{student.username}</p>
            </div>
          </div>

          <div className="relative 2xl:h-[30px] 3xl:h-[60px] mb-5">
              <p className="text-gray-600 text-xs 3xl:text-sm line-clamp-3">
                  {student.bio || 'Tento uživatel zatím nepřidal žádný popis.'}
              </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 mb-5 text-[12px] 3xl:text-sm font-medium text-gray-500">
            {stats ? (
              <div className='pt-2 flex flex-col gap-2 3xl:gap-4'>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="text-green-500 w-3.5 3xl:w-6" size={18} />
                  <span>{formatChallengeText(stats.completed, 'completed')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy className="text-amber-500 w-3.5 3xl:w-6" size={18} />
                  <span>{formatChallengeText(stats.won, 'won')}</span>
                </div>
              </div>
            ) : (
              <div className="h-5 bg-gray-200 rounded-md animate-pulse w-3/4"></div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center content-start gap-2 h-auto overflow-hidden">
            {(!sortedSkills || sortedSkills.length === 0) && (
              <span className="bg-gray-100 text-gray-500 px-3 py-1.5 3xl:px-3 3xl:py-2 rounded-full text-[11px] 3xl:text-sm font-medium">
                Uživatel nepřidal žádné dovednosti
              </span>
            )}
            {sortedSkills.slice(0, 4).map(({ Skill }) => (
              Skill && (
                <span key={Skill.id} className="flex items-center justify-center gap-1.5 bg-[var(--barva-svetle-pozadi)] leading-none text-[var(--barva-primarni)] border border-[var(--barva-primarni)] px-2 py-1.5 3xl:px-3 3xl:py-2 rounded-full text-[11px] 3xl:text-sm 3xl:font-semibold transition-colors">
                  {Skill.name}
                </span>
              )
            ))}
            {sortedSkills.length > 4 && (
              <span className="flex items-center gap-2 whitespace-nowrap self-center">
                {sortedSkills[4]?.Skill && (
                  <span key={sortedSkills[4].Skill.id} className="flex items-center justify-center gap-1.5 bg-[var(--barva-svetle-pozadi)] leading-none text-[var(--barva-primarni)] border border-[var(--barva-primarni)] px-2 py-1.5 3xl:px-3 3xl:py-2 rounded-full text-[11px] 3xl:text-sm 3xl:font-semibold transition-colors">
                    {sortedSkills[4].Skill.name}
                  </span>
                )}
                {sortedSkills.length > 5 && (
                  <span className="text-[var(--barva-primarni)] text-[11px] 3xl:text-sm self-center">
                    +{sortedSkills.length - 5}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      </Link>
  );
}