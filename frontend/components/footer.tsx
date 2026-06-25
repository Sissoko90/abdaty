'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Newsletter } from '@/components/newsletter';
import { usePublicSection, usePublicList } from '@/hooks/use-public-content';
import { resolveSocialIcon, socialLabel } from '@/lib/social-icons';
import { useBranding } from '@/hooks/use-branding';

export function Footer({ showNewsletter }: { showNewsletter?: boolean }) {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const { logo } = useBranding();

  // Libellés gérés dans l'admin (section "footer"), avec repli i18n.
  const { cv } = usePublicSection('footer');

  // Liens rapides = mêmes entrées que le menu de navigation (section "navigation").
  const { items: navBlocks } = usePublicSection('navigation');
  const navLinks = (
    navBlocks.length > 0
      ? navBlocks
          .filter((b) => b.contentKey.startsWith('item-'))
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          .map((b) => {
            let d: { label?: { fr?: string; en?: string }; href?: string } = {};
            try { d = b.valueFr ? JSON.parse(b.valueFr) : {}; } catch { /* ignore */ }
            return { label: (locale === 'fr' ? d.label?.fr : d.label?.en) || '', href: d.href || '/' };
          })
      : [
          { label: tNav('home'), href: '/' },
          { label: tNav('services'), href: '/services' },
          { label: tNav('smsApi'), href: '/sms-api' },
          { label: tNav('docs'), href: '/docs' },
          { label: tNav('blog'), href: '/blog' },
          { label: tNav('about'), href: '/about' },
          { label: tNav('faq'), href: '/faq' },
          { label: tNav('contact'), href: '/contact' },
        ]
  ).filter((l) => l.label);
  
  // Réseaux sociaux gérés dans l'admin (section "socials", actifs uniquement).
  // Repli sur quelques réseaux par défaut si la section est vide.
  const socialItems = usePublicList('socials');
  const socials =
    socialItems.length > 0
      ? socialItems
          .filter((s) => s.url && s.platform)
          .map((s) => ({ platform: s.platform as string, url: s.url as string, label: (s.label as string) || '' }))
      : [
          { platform: 'facebook', url: 'https://facebook.com', label: '' },
          { platform: 'twitter', url: 'https://twitter.com', label: '' },
          { platform: 'linkedin', url: 'https://linkedin.com', label: '' },
          { platform: 'instagram', url: 'https://instagram.com', label: '' },
          { platform: 'youtube', url: 'https://youtube.com', label: '' },
        ];

  // Le newsletter n'est plus affiché automatiquement dans le footer :
  // il n'apparaît que là où il est explicitement demandé (page d'accueil).
  const shouldShowNewsletter = showNewsletter === true;

  return (
    <>
      {shouldShowNewsletter && <Newsletter />}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- logo dynamique (CMS), ratio inconnu, non LCP */}
              <img src={logo} alt="Abdaty Tech" className="h-10 w-auto" />
              <span className="font-bold text-xl text-white">Abdaty Technologie</span>
            </div>
            <p className="text-gray-400 mb-4">{cv('description', t('description'))}</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary-500" />
                <a href="mailto:contact@abdatytch.com" className="hover:text-white transition-colors">
                  contact@abdatytch.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary-500" />
                <a href="tel:+243000000000" className="hover:text-white transition-colors">
                  +223 76 71 41 42
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary-500" />
                <span>Bamako, Mali</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{cv('quickLinks', t('quickLinks'))}</h3>
            <ul className="space-y-2">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={`/${locale}${l.href === '/' ? '' : l.href}` as Parameters<typeof Link>[0]['href']}
                    className="hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{cv('services', t('services'))}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/services/web-development`} className="hover:text-white transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/services/mobile-apps`} className="hover:text-white transition-colors">
                  Mobile Apps
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/services/ui-ux-design`} className="hover:text-white transition-colors">
                  UI/UX Design
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/services/cybersecurity`} className="hover:text-white transition-colors">
                  Cybersecurity
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/services/data-ai`} className="hover:text-white transition-colors">
                  Data & AI
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{cv('legal', t('legal'))}</h3>
            <ul className="flex gap-4">
              <li>
                <Link href={`/${locale}/terms-of-service`} className="hover:text-white transition-colors whitespace-nowrap">
                  {cv('termsOfService', t('termsOfService'))}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy-policy`} className="hover:text-white transition-colors whitespace-nowrap">
                  {cv('privacyPolicy', t('privacyPolicy'))}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} Abdaty Technologie. {cv('rights', t('rights'))}</p>
            <div className="flex space-x-4">
              {socials.map((s, i) => {
                const Icon = resolveSocialIcon(s.platform);
                return (
                  <a
                    key={`${s.platform}-${i}`}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label || socialLabel(s.platform)}
                    title={s.label || socialLabel(s.platform)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
