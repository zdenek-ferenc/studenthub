"use client";

import { CheckCircle, Trophy } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState, useEffect } from 'react'; // Přidán import
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient'; // Přidán import

// Původní, jednoduchý typ pro studenta
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

// Funkce pro správné skloňování
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
  // --- ZMĚNA ZDE: Nový stav pro ukládání statistik ---
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
        <div className="bg-white rounded-2xl shadow-xs p-6 border border-gray-100 group-hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col h-full">
          <div className="flex items-center gap-4 mb-4">
            {student.profile_picture_url ? (
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

          <div className="relative h-[60px] mb-5">
              <p className="text-gray-600 text-sm line-clamp-3">
                  {student.bio || 'Tento uživatel zatím nepřidal žádný popis.'}
              </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 mb-5 text-sm font-medium text-gray-500">
            {/* --- ZMĚNA ZDE: Zobrazení statistik ze stavu --- */}
            {stats ? (
              <>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="text-green-500" size={18} />
                  <span>{formatChallengeText(stats.completed, 'completed')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy className="text-amber-500" size={18} />
                  <span>{formatChallengeText(stats.won, 'won')}</span>
                </div>
              </>
            ) : (
              // Placeholder během načítání
              <div className="h-5 bg-gray-200 rounded-md animate-pulse w-3/4"></div>
            )}
          </div>
          
          <div className="flex flex-wrap items-start content-start gap-2 mb-6 h-auto overflow-hidden">
            {sortedSkills.slice(0, 5).map(({ Skill }) => (
              Skill && (
                <span key={Skill.id} className="flex items-center justify-center gap-1.5 bg-[var(--barva-svetle-pozadi)] leading-none text-[var(--barva-primarni)] border border-[var(--barva-primarni)] px-3 py-2 rounded-full text-sm font-semibold transition-colors">
                  {Skill.name}
                </span>
              )
            ))}
            {sortedSkills.length > 5 && (
              <span className="text-[var(--barva-primarni)] text-sm self-center pt-2">
                +{sortedSkills.length - 5}
              </span>
            )}
          </div>
          
          <div className="mt-auto pt-4 border-t border-gray-100 flex justify-center">
            <div className="flex justify-between items-center bg-[var(--barva-primarni)] text-white font-bold py-2 px-5 rounded-2xl group-hover:opacity-90 transition-opacity">
              Profil studenta
            </div>
          </div>
        </div>
      </Link>
  );
}