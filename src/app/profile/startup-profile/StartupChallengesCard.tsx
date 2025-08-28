"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

// Typ pro data, která komponenta přijímá
type ChallengeData = {
  id: string;
  title: string;
  deadline: string | null;
  StartupProfile: {
    company_name: string;
    logo_url: string | null;
  } | null;
};

// Funkce pro výpočet zbývajících dní
const calculateDaysLeft = (deadline: string | null): string => {
  if (!deadline) return '';
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Ukončeno';
  if (diffDays === 0) return 'Dnes končí';
  if (diffDays === 1) return 'Zbývá 1 den';
  if (diffDays <= 4) return `Zbývají ${diffDays} dny`;
  return `Zbývá ${diffDays} dní`;
};

export default function StartupChallengeCard({ challenge }: { challenge: ChallengeData }) {
  const [daysLeft, setDaysLeft] = useState('');

  useEffect(() => {
    setDaysLeft(calculateDaysLeft(challenge.deadline));
  }, [challenge.deadline]);

  return (
    <Link 
      href={`/challenges/${challenge.id}`}
      className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border"
    >
      <div className="flex items-center gap-4">
        <div>
          <h4 className="font-bold text-[var(--barva-tmava)]">{challenge.title}</h4>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-500">{daysLeft}</span>
        <span className="w-3 h-3 bg-green-400 rounded-full"></span>
      </div>
    </Link>
  );
}
