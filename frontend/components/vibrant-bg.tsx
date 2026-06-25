export function VibrantBg({ className = '', variant = 'default' }: { className?: string; variant?: 'default' | 'subtle' | 'intense' }) {
  const variants = {
    default: 'bg-gradient-to-br from-primary-50/30 via-primary-50/20 to-orange-50/30 dark:from-primary-950/20 dark:via-gray-950/10 dark:to-primary-950/20',
    subtle: 'bg-gradient-to-br from-primary-50/20 via-white to-primary-50/20 dark:from-gray-900/20 dark:via-gray-950/10 dark:to-primary-950/20',
    intense: 'bg-gradient-to-br from-primary-100/40 via-primary-100/30 to-orange-100/40 dark:from-primary-950/30 dark:via-gray-900/20 dark:to-primary-950/30',
  };

  return (
    <div className={`absolute inset-0 ${variants[variant]} ${className}`}></div>
  );
}
