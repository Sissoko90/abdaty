'use client';

export function AnimatedBlobRed({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-4xl opacity-60 animate-blob ${className}`}></div>
  );
}
