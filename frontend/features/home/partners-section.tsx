'use client';

import { useTranslations } from 'next-intl';
import { usePublicList } from '@/hooks/use-public-content';
import { mediaUrl } from '@/services/content.service';

interface Partner {
  name: string;
  logo: string;
  website?: string;
}

/** Partenaires par défaut (repli si la base est vide). */
const defaultPartners: Partner[] = [
  { name: 'Orange Mali', logo: '/api.png' },
  { name: 'Moov Africa', logo: '/moov.jpg' },
  { name: 'Malitel', logo: '/chapchap.png' },
  { name: 'Bank of Africa', logo: '/aua.jpg' },
  { name: 'Ecobank', logo: '/ecobank.png' },
];

/** Résout l'URL du logo : image uploadée (/uploads) -> backend ; asset public -> tel quel. */
function resolveLogo(logo: string): string {
  if (!logo) return '';
  return logo.startsWith('/uploads') || logo.startsWith('http') ? mediaUrl(logo) : logo;
}

// Fondu sur les bords du défilement, compatible avec n'importe quel fond (clair/sombre).
const EDGE_FADE = 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)';

export function PartnersSection() {
  const t = useTranslations('partners');

  // Partenaires gérés dans l'admin (section "partners"), avec repli.
  const backend = usePublicList('partners');
  const partners: Partner[] =
    backend.length > 0
      ? backend.map((p) => ({ name: (p.name as string) || '', logo: (p.logo as string) || '', website: p.website as string }))
      : defaultPartners;

  // Assez de logos pour remplir les grands écrans, puis duplication pour la boucle.
  const row = partners.length < 6 ? [...partners, ...partners] : partners;

  const renderLogo = (partner: Partner, key: string, hidden = false) => (
    <div
      key={key}
      aria-hidden={hidden || undefined}
      className="mx-3 flex h-20 w-40 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/90"
    >
      {partner.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolveLogo(partner.logo)}
          alt={hidden ? '' : partner.name}
          className="max-h-full max-w-full object-contain opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
        />
      ) : (
        <span className="text-center text-sm font-semibold text-gray-700">{partner.name}</span>
      )}
    </div>
  );

  return (
    <section className="border-b border-gray-200 bg-white py-12 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="site-container flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
        <div className="lg:w-64 lg:shrink-0">
          <h2 className="mb-1 text-xl font-bold text-ink dark:text-white">{t('title')}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden" style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}>
          <div className="flex w-max animate-scroll motion-reduce:animate-none">
            {row.map((partner, index) => renderLogo(partner, `p-${index}`))}
            {/* Duplication pour une boucle fluide */}
            {row.map((partner, index) => renderLogo(partner, `dup-${index}`, true))}
          </div>
        </div>
      </div>
    </section>
  );
}
