'use client';

import { motion } from 'framer-motion';
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

export function PartnersSection() {
  // Partenaires gérés dans l'admin (section "partners"), avec repli.
  const backend = usePublicList('partners');
  const partners: Partner[] =
    backend.length > 0
      ? backend.map((p) => ({ name: (p.name as string) || '', logo: (p.logo as string) || '', website: p.website as string }))
      : defaultPartners;

  const renderLogo = (partner: Partner, key: string) => (
    <div
      key={key}
      className="flex-shrink-0 w-32 h-32 mx-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-300 p-4"
    >
      {partner.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={resolveLogo(partner.logo)} alt={partner.name} className="object-contain max-w-full max-h-full" />
      ) : (
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">{partner.name}</span>
      )}
    </div>
  );

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 border-y dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            Ils nous font confiance
          </h2>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
            Plus de 200 entreprises et institutions partenaires
          </p>
        </motion.div>

        {/* Défilement automatique des partenaires */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll">
            {partners.map((partner, index) => renderLogo(partner, `p-${index}`))}
            {/* Duplication pour une boucle fluide */}
            {partners.map((partner, index) => renderLogo(partner, `dup-${index}`))}
          </div>

          {/* Dégradés latéraux */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
