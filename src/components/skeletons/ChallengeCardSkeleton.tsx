// src/components/skeletons/ChallengeCardSkeleton.tsx
import Skeleton from './Skeleton';

export default function ChallengeCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col h-full gap-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-lg" />
        <div className="flex-grow space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <div className="border-t border-gray-100 mt-4 pt-4 flex items-end justify-between">
        <div className="space-y-2 w-1/2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
    </div>
  );
}