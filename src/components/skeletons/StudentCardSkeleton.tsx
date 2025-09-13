// src/components/skeletons/StudentCardSkeleton.tsx
import Skeleton from './Skeleton';

export default function StudentCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col h-full gap-4">
        <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-full" />
            <div className="flex-grow space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
        </div>
        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-center">
            <Skeleton className="h-10 w-32 rounded-2xl" />
        </div>
    </div>
  );
}