interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={`
        relative overflow-hidden bg-gray-100 rounded-xl
        before:absolute before:inset-0
        before:-translate-x-full
        before:animate-[shimmer_2s_infinite]
        before:bg-gradient-to-r
        before:from-transparent before:via-white/60 before:to-transparent
        ${className || ''} 
      `}
    />
  );
}