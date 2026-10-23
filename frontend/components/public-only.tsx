'use client';

import { usePathname } from 'next/navigation';

/** N'affiche ses enfants que sur le site public (pas dans le panel admin). */
export function PublicOnly({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.includes('/admin')) return null;
  return <>{children}</>;
}
