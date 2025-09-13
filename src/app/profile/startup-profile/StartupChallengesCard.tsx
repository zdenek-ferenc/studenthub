"use client";

import Link from 'next/link';
import DeadlineTag from '../../../components/DeadlineTag';

// ZMĚNA ZDE: Upravíme typ, aby odpovídal datům z rodiče
type ChallengeData = {
  id: string;
  title: string;
  deadline: string | null;
  Submission: { status: string }[]; // <-- PŘIDÁNO
  StartupProfile: {
    company_name: string;
    logo_url: string | null;
  } | null;
};

export default function StartupChallengeCard({ challenge }: { challenge: ChallengeData }) {
  // --- PŘIDANÁ LOGIKA PRO UPOZORNĚNÍ ---
  const isPastDeadline = challenge.deadline ? new Date() > new Date(challenge.deadline) : false;
  const hasUnreviewedSubmissions = challenge.Submission?.some(
      s => s.status === 'applied' || s.status === 'submitted'
  );
  const needsAttention = isPastDeadline && hasUnreviewedSubmissions;

  return (
    // Zabalíme vše do divu, na který aplikujeme podmíněný styl
    <div 
        className={`relative p-0.5 rounded-[16px] transition-all duration-300 
            ${needsAttention ? 'bg-red-500' : 'bg-transparent'}`}
    >
        <Link 
          href={`/challenges/${challenge.id}`}
          className="flex items-center gap-4 p-4 rounded-[14px] bg-[var(--barva-svetle-pozadi)] hover:bg-white transition-all duration-100 ease-in-out"
        >
            <div className="flex-grow">
              <h4 className="font-semibold text-[var(--barva-tmava)]">{challenge.title}</h4>
            </div>
            
            {/* Tag se zobrazí vpravo uvnitř karty */}
            <div className="flex-shrink-0">
                {needsAttention ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-red-100 text-red-700">
                        <span>Vyhodnoťte výzvu</span>
                    </div>
                ) : (
                    <DeadlineTag deadline={challenge.deadline} />
                )}
            </div>
        </Link>
    </div>
  );
}