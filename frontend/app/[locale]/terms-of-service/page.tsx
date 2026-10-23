'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { usePublicSection } from '@/hooks/use-public-content';
import { PageHero } from '@/components/page-hero';

/** Section du document : titre, paragraphe, puces et lien optionnels. */
interface LegalSection {
  id: string;
  title: string;
  content: string;
  points?: string[];
  link?: { href: string; label: string };
}

export default function TermsOfServicePage() {
  const t = useTranslations('legal.termsOfService');
  const tLegal = useTranslations('legal');
  const locale = useLocale();

  // Contenu géré dans l'admin (section "legal", clés terms.*).
  const { cv } = usePublicSection('legal');
  const baseTitle = cv('terms.title');
  const baseContent = cv('terms.content');
  const baseUpdated = cv('terms.lastUpdated');
  const hasBase = baseContent.trim().length > 0;

  const s = (id: string, points?: string[], link?: LegalSection['link']): LegalSection => ({
    id,
    title: t(`${id}.title`),
    content: t(`${id}.content`),
    points: points?.map((p) => t(`${id}.points.${p}`)),
    link,
  });

  const sections: LegalSection[] = [
    s('acceptance'),
    s('services'),
    s('userAccount', ['accuracy', 'security', 'responsibility']),
    s('payment'),
    s('cancellation'),
    s('limitation'),
    s('intellectual'),
    s('privacy', undefined, { href: `/${locale}/privacy-policy`, label: t('privacy.link') }),
    s('modifications'),
    s('contact', undefined, { href: `/${locale}/contact`, label: t('contact.link') }),
  ];

  const updated = baseUpdated
    ? `${locale === 'fr' ? 'Dernière mise à jour' : 'Last updated'} : ${baseUpdated}`
    : t('lastUpdated');

  return (
    <main>
      <PageHero title={baseTitle || t('title')} subtitle={updated} />
      <LegalBody sections={hasBase ? [] : sections} rawContent={hasBase ? baseContent : ''} tocLabel={tLegal('onThisPage')} />
    </main>
  );
}

/** Corps commun : sommaire collant (desktop) + colonne de lecture. */
function LegalBody({ sections, rawContent, tocLabel }: { sections: LegalSection[]; rawContent: string; tocLabel: string }) {
  return (
    <section className="py-16 lg:py-24">
      <div className="site-container grid gap-12 lg:grid-cols-12">
        {sections.length > 0 && (
          <aside className="hidden lg:col-span-4 lg:block xl:col-span-3">
            <nav aria-label={tocLabel} className="sticky top-28">
              <p className="mb-4 text-sm font-semibold text-ink dark:text-white">{tocLabel}</p>
              <ol className="space-y-1 border-l border-gray-200 dark:border-white/10">
                {sections.map((sec) => (
                  <li key={sec.id}>
                    <a
                      href={`#${sec.id}`}
                      className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-gray-600 transition-colors hover:border-primary-500 hover:text-ink dark:text-gray-400 dark:hover:text-white"
                    >
                      {sec.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
        )}

        <article className={`max-w-3xl ${sections.length > 0 ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'}`}>
          {rawContent ? (
            <div className="whitespace-pre-line text-lg leading-8 text-gray-700 dark:text-gray-300">{rawContent}</div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-white/10">
              {sections.map((sec) => (
                <section key={sec.id} id={sec.id} className="scroll-mt-28 py-10 first:pt-0">
                  <h2 className="mb-4 text-2xl font-bold text-ink dark:text-white">{sec.title}</h2>
                  <p className="leading-8 text-gray-700 dark:text-gray-300">{sec.content}</p>
                  {sec.points && (
                    <ul className="mt-5 space-y-3">
                      {sec.points.map((p) => (
                        <li key={p} className="flex gap-3 leading-7 text-gray-700 dark:text-gray-300">
                          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ochre" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                  {sec.link && (
                    <Link href={sec.link.href as Parameters<typeof Link>[0]['href']} className="mt-5 inline-block font-semibold text-primary-600 hover:underline dark:text-primary-400">
                      {sec.link.label}
                    </Link>
                  )}
                </section>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
