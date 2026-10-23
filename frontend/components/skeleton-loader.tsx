'use client';


import { motion } from 'framer-motion';

export function SkeletonLoader({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`rounded-lg bg-gray-200 dark:bg-white/10 ${className}`}
      animate={{
        opacity: [0.4, 1, 0.4],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]">
      <SkeletonLoader className="h-4 w-3/4 mb-4" />
      <SkeletonLoader className="h-3 w-full mb-2" />
      <SkeletonLoader className="h-3 w-5/6 mb-4" />
      <SkeletonLoader className="h-8 w-24" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <SkeletonLoader className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader className="h-4 w-3/4" />
            <SkeletonLoader className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
