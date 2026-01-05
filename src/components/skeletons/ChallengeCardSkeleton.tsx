import Skeleton from './Skeleton';

export default function ChallengeCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col h-full gap-5 shadow-sm">
      {/* Header: Logo + Název */}
      <div className="flex items-start gap-4">
        <Skeleton className="w-14 h-14 !rounded-xl flex-shrink-0" /> {/* Logo */}
        <div className="flex-grow space-y-2.5 py-1">
          <Skeleton className="h-5 w-2/3" /> {/* Název firmy */}
          <Skeleton className="h-7 w-full" /> {/* Název výzvy */}
        </div>
      </div>

      {/* Popis */}
      <div className="space-y-2 mt-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      {/* Tagy (Skills) */}
      <div className="flex flex-wrap gap-2 mt-auto pt-4">
        <Skeleton className="h-8 w-24 !rounded-full" />
        <Skeleton className="h-8 w-20 !rounded-full" />
        <Skeleton className="h-8 w-28 !rounded-full" />
      </div>

      {/* Footer: Cena + Button */}
      <div className="border-t border-gray-50 mt-2 pt-4 flex items-center justify-between gap-4">
        <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" /> {/* Label "Odměna" */}
            <Skeleton className="h-6 w-24" /> {/* Částka */}
        </div>
        <Skeleton className="h-11 w-32 !rounded-xl" /> {/* Tlačítko */}
      </div>
    </div>
  );
}