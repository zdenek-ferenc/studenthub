"use client";

import { useEffect, useState } from 'react';

type DeadlineTagProps = {
  deadline: string | null;
  className?: string;
};

type TagStyle = {
  text: string;
  bgColor: string;
  textColor: string;
  pulse?: boolean;
};

// Funkce pro výpočet zbývajícího času a určení stylu
const getDeadlineInfo = (deadline: string | null): TagStyle | null => {
  if (!deadline) return null;

  const now = new Date();
  const deadlineDate = new Date(deadline);

  // Nastavíme čas na začátek dne pro spravedlivé porovnání kalendářních dnů
  now.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return null; // Termín již vypršel
  }

  if (diffDays === 0) {
    return {
      text: 'Končí dnes!',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      pulse: true,
    };
  }

  if (diffDays === 1) {
    return {
      text: 'Končí zítra !',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
    };
  }
  
  if (diffDays <= 4) {
    return {
      text: `Zbývají ${diffDays} dny`,
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-700',
    };
  }
  
  if (diffDays <= 7) {
    return {
      text: 'Blíží se termín',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
    };
  }

  return null; // Více než 7 dní do konce
};


export default function DeadlineTag({ deadline, className }: DeadlineTagProps) {
  const [tagStyle, setTagStyle] = useState<TagStyle | null>(null);

  useEffect(() => {
    // Přidáme timeout, aby se předešlo hydratačním chybám v Next.js
    const timer = setTimeout(() => {
      setTagStyle(getDeadlineInfo(deadline));
    }, 1);
    return () => clearTimeout(timer);
  }, [deadline]);

  if (!tagStyle) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${tagStyle.bgColor} ${tagStyle.textColor} ${className}`}>
      {tagStyle.pulse && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>}
      <span>{tagStyle.text}</span>
    </div>
  );
}