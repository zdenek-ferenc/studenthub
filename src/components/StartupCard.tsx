"use client";

import Image from 'next/image';
import { Briefcase, CheckCircle } from 'lucide-react';
import { Startup } from '../contexts/DataContext';
import Link from 'next/link';

type StartupCardProps = {
  startup: Startup;
};

const formatChallengeText = (count: number, type: 'active' | 'completed') => {
  const activeNouns = {
    one: 'aktivní výzva',
    few: 'aktivní výzvy',
    other: 'aktivních výzev',
  };

  const completedNouns = {
    one: 'hotová výzva',
    few: 'hotové výzvy',
    other: 'hotových výzev',
  };

  const nouns = type === 'active' ? activeNouns : completedNouns;

  if (count === 1) {
    return `${count} ${nouns.one}`;
  }
  if (count >= 2 && count <= 4) {
    return `${count} ${nouns.few}`;
  }
  return `${count} ${nouns.other}`;
};


export default function StartupCard({ startup }: StartupCardProps) {
  if (!startup || !startup.company_name) {
    return null;
  }

  const now = new Date();

  const activeChallenges = startup.Challenge?.filter(c => {
    const deadlineDate = new Date(c.deadline);
    return c.status === 'open' && deadlineDate >= now;
  }).length ?? 0;

  const completedChallenges = startup.Challenge?.filter(c => {
    const deadlineDate = new Date(c.deadline);
    return c.status === 'closed' || (c.status === 'open' && deadlineDate < now);
  }).length ?? 0;

  const websiteUrl = startup.website && (startup.website.startsWith('http') ? startup.website : `https://${startup.website}`);

  return (
      <Link href={`/profile/${startup.user_id}`} className="block group h-full">
        <div className="bg-white rounded-2xl shadow-xs p-3 sm:p-6 border border-gray-100 group-hover:shadow-sm group-hover:border-blue-200 transition-all duration-300 ease-in-out flex flex-col h-full">
          <div className="flex-grow">
            <div className="flex items-start gap-4 mb-4">
              {startup.logo_url ? (
                <Image 
                  src={startup.logo_url} 
                  alt={startup.company_name}
                  width={56}
                  height={56}
                  className="h-10 w-10 3xl:w-14 3xl:h-14 rounded-full object-cover" 
                />
              ) : (
                <div className="flex items-center justify-center h-10 w-10 3xl:w-14 3xl:h-14 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full text-xl font-bold text-indigo-600">
                  <span>{startup.company_name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div>
                <h3 className="3xl:text-lg font-bold text-gray-800">{startup.company_name}</h3>
                {websiteUrl && (
                  <span 
                    onClick={(e) => {
                    e.stopPropagation();
                    window.open(websiteUrl, '_blank');
                    }}
                    className="text-sm text-blue-500 hover:underline break-all relative z-10 cursor-pointer"
                    >
                    {startup.website}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 mb-5 text-xs md:text-sm font-medium text-gray-500">
              <div className='flex flex-col gap-2'>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="text-blue-500" size={18} />
                  <span>{formatChallengeText(activeChallenges, 'active')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="text-green-500" size={18} />
                  <span>{formatChallengeText(completedChallenges, 'completed')}</span>
                </div>
              </div>    
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {startup.StartupCategory?.slice(0, 3).map(({ Category }) => (
                Category && (
                  <span key={Category.id} className="flex items-center justify-center gap-1.5 bg-[var(--barva-svetle-pozadi)] leading-none text-[var(--barva-primarni)] border border-[var(--barva-primarni)] px-3 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors">
                    {Category.name}
                  </span>
                )
              ))}
              {startup.StartupCategory?.length > 3 && (
                <span className="text-[var(--barva-primarni)] text-xs sm:text-sm">
                  +{startup.StartupCategory.length - 3} další
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
  );
}