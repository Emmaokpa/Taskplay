"use client";

export const Skeleton = ({ className }: { className: string }) => {
  return (
    <div className={`relative overflow-hidden bg-white/5 rounded-2xl ${className}`}>
      <div 
         className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" 
         style={{ animation: 'shimmer 2s infinite' }}
      />
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="glass p-6 rounded-[2.5rem] border-white/5 space-y-4">
    <Skeleton className="h-40 w-full rounded-2xl" />
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="flex justify-between pt-4">
      <Skeleton className="h-10 w-24 rounded-xl" />
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
  </div>
);

export const ListSkeleton = () => (
  <div className="space-y-4 w-full">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="glass p-4 rounded-3xl flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
    ))}
  </div>
);

export const StatSkeleton = () => (
  <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-4">
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-12 w-32" />
    <Skeleton className="h-3 w-40" />
  </div>
);
