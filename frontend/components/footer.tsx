'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Newsletter } from '@/components/newsletter';
import { usePublicSection, usePublicList } from '@/hooks/use-public-content';
import { resolveSocialIcon, socialLabel } from '@/lib/social-icons';
import { useBranding } from '@/hooks/use-branding';
import { useContactDetails } from '@/hooks/use-contact-details';

type Href = Parameters<typeof Link>[0]['href'];

export function Footer({ showNewsletter }: { showNewsletter?: boolean }) {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tServices = useTranslations('services');
  const locale = useLocale();
  const { logo } = useBranding();
  const contact = useContactDetails();

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

  // Services = mêmes entrées que le sous-menu de la navbar (section "services").
  const serviceItems = usePublicList('services');
  const serviceLinks =
    serviceItems.length > 0
      ? serviceItems
          .filter((s) => s.title)
          .slice(0, 6)
          .map((s) => ({ label: s.title as string, href: `/${locale}/services${s.slug ? `/${s.slug}` : ''}` }))
      : [
          { label: tServices('web.title'), href: `/${locale}/services/web-development` },
          { label: tServices('mobile.title'), href: `/${locale}/services/mobile-apps` },
          { label: tServices('design.title'), href: `/${locale}/services/ui-ux-design` },
          { label: tServices('security.title'), href: `/${locale}/services/cybersecurity` },
          { label: tServices('dataAi.title'), href: `/${locale}/services/data-ai` },
        ];

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

  const headingCls = 'mb-5 font-display text-base font-semibold text-white';
  const linkCls = 'text-gray-400 transition-colors hover:text-white';

  return (
    <>
      {shouldShowNewsletter && <Newsletter />}
      <div className="bogolan-band" />
      <footer className="bg-ink text-gray-400">
        <div className="site-container py-16">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-4">
              <Link href={`/${locale}`} className="mb-5 inline-flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element -- logo dynamique (CMS), ratio inconnu, non LCP */}
                <img src={logo} alt="Abdaty Tech" className="h-10 w-auto rounded-md bg-white p-1" />
                <span className="font-display text-xl font-bold text-white">Abdaty Technologie</span>
              </Link>
              <p className="mb-6 max-w-sm leading-relaxed">{cv('description', t('description'))}</p>
              <p className="mb-3 text-sm font-semibold text-white">{t('followUs')}</p>
              <div className="flex flex-wrap gap-2">
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
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-300 ring-1 ring-white/10 transition-colors hover:bg-primary-600 hover:text-white hover:ring-primary-600"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-2">
              <h3 className={headingCls}>{cv('quickLinks', t('quickLinks'))}</h3>
              <ul className="space-y-3">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={`/${locale}${l.href === '/' ? '' : l.href}` as Href} className={linkCls}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h3 className={headingCls}>{cv('services', t('services'))}</h3>
              <ul className="space-y-3">
                {serviceLinks.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href as Href} className={linkCls}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h3 className={headingCls}>{t('contact')}</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-ochre" />
                  <a href={contact.emailHref} className={`break-all ${linkCls}`}>{contact.email}</a>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-ochre" />
                  <a href={contact.phoneHref} className={linkCls}>{contact.phone}</a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-ochre" />
                  <span>{contact.address}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm md:flex-row md:items-center md:justify-between">
            <p>&copy; {new Date().getFullYear()} Abdaty Technologie. {cv('rights', t('rights'))}</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              <li>
                <Link href={`/${locale}/terms-of-service`} className={linkCls}>
                  {cv('termsOfService', t('termsOfService'))}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy-policy`} className={linkCls}>
                  {cv('privacyPolicy', t('privacyPolicy'))}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
