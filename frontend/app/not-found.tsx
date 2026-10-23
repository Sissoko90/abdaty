import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, MessageSquare } from 'lucide-react';
import { fontVariables } from '@/lib/fonts';

/**
 * 404 hors locale (pas de fournisseur i18n ici) : textes en français,
 * même composition que la 404 localisée.
 */
export default function RootNotFound() {
  const suggestions = [
    { href: '/fr/services', label: 'Nos services' },
    { href: '/fr/about', label: 'À propos' },
    { href: '/fr/blog', label: 'Blog' },
    { href: '/fr/sms-api', label: 'API SMS' },
  ];

  return (
    // Hors du layout localisé : on expose ici les polices du site.
    <main className={`min-h-screen bg-paper font-sans ${fontVariables}`}>
      <section className="py-20 lg:py-28">
        <div className="site-container grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h1 className="mb-6 font-display text-5xl font-extrabold leading-[1.05] text-ink dark:text-white md:text-6xl">Page non trouvée</h1>
            <p className="mb-9 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              La page que vous recherchez n&apos;existe pas ou a été déplacée.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/fr">
                <Button size="lg" className="w-full gap-2 sm:w-auto">
                  <Home className="h-5 w-5" />
                  Retour à l&apos;accueil
                </Button>
              </Link>
              <Link href="/fr/contact">
                <Button size="lg" variant="outline" className="w-full gap-2 border-gray-300 bg-white sm:w-auto">
                  <MessageSquare className="h-5 w-5" />
                  Contactez-nous
                </Button>
              </Link>
            </div>
            <div className="mt-12 border-t border-gray-200 pt-8">
              <p className="mb-4 text-sm font-medium text-gray-600">Vous cherchez peut-être :</p>
              <ul className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <li key={s.href}>
                    <Link
                      href={s.href as Parameters<typeof Link>[0]['href']}
                      className="inline-block rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-primary-300 hover:text-primary-700"
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="lg:col-span-5" aria-hidden="true">
            <div className="bogolan-texture flex aspect-square items-center justify-center rounded-3xl bg-ink">
              <span className="font-display text-[8rem] font-extrabold leading-none text-ochre sm:text-[10rem]">404</span>
            </div>
          </div>
        </div>
      </section>
      <div className="bogolan-band" />
    </main>
  );
}
