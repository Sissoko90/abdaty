'use client';

import { usePathname } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { PromoBar } from '@/components/promo-bar';
import { PromoCorner } from '@/components/promo-corner';

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.includes('/admin');

  if (isAdmin) {
    return (
      <>
        <main>
          {children}
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      {/* Bannière pub (sous la navbar) + carte promo en coin — gérées dans l'admin. */}
      <PromoBar />
      <main>
        {children}
      </main>
      <PromoCorner />
      <Footer />
    </>
  );
}
