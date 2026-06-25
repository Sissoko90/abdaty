import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import { Chatbot } from '@/components/chatbot';
import { CookieBanner } from '@/components/cookie-banner';
import { SkipLink } from '@/components/skip-link';
import { StructuredData } from '@/components/structured-data';
import { MainLayoutWrapper } from '@/components/main-layout-wrapper';
import { BrandingStyle } from '@/components/branding-style';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { getSectionContent } from '@/services/content.service';
import '@/app/globals.css';

/** Valeurs SEO par défaut (repli si la section "seo" est vide / backend indisponible). */
const SEO_DEFAULTS = {
  title: { fr: 'Abdaty Technologie - Solutions Digitales Innovantes', en: 'Abdaty Technologie - Innovative Digital Solutions' },
  description: {
    fr: 'Expert en développement web, mobile, UI/UX design, cybersécurité et intelligence artificielle au Mali. Transformez votre entreprise avec nos solutions technologiques.',
    en: 'Expert in web/mobile development, UI/UX design, cybersecurity and AI in Mali.',
  },
  keywords: 'développement web, développement mobile, UI/UX design, cybersécurité, intelligence artificielle, Mali, Afrique',
  ogImage: '/og-image.jpg',
};

/**
 * Métadonnées dynamiques : lues depuis la section "seo" gérée dans l'admin
 * (titre, description, mots-clés, image de partage), avec repli sur les valeurs
 * par défaut. Toutes les URLs utilisent SITE_URL (configurable via env).
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const cv: Record<string, { fr?: string; en?: string }> = {};
  try {
    const blocks = await getSectionContent('seo');
    blocks.forEach((b) => {
      cv[b.contentKey] = { fr: b.valueFr ?? undefined, en: b.valueEn ?? undefined };
    });
  } catch {
    /* backend indisponible : valeurs par défaut */
  }
  const pick = (key: string, def: string) => {
    const v = cv[key];
    if (!v) return def;
    return (locale === 'en' ? v.en : v.fr) || v.fr || def;
  };

  const title = pick('metaTitle', locale === 'en' ? SEO_DEFAULTS.title.en : SEO_DEFAULTS.title.fr);
  const description = pick('metaDescription', locale === 'en' ? SEO_DEFAULTS.description.en : SEO_DEFAULTS.description.fr);
  const keywords = pick('keywords', SEO_DEFAULTS.keywords).split(',').map((s) => s.trim()).filter(Boolean);
  const ogImage = pick('ogImage', SEO_DEFAULTS.ogImage);
  const ogLocale = locale === 'en' ? 'en_US' : 'fr_FR';

  return {
    title,
    description,
    keywords,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    formatDetection: { email: false, address: false, telephone: false },
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: { 'fr-FR': `${SITE_URL}/fr`, 'en-US': `${SITE_URL}/en` },
    },
    openGraph: {
      type: 'website',
      locale: ogLocale,
      alternateLocale: locale === 'en' ? ['fr_FR'] : ['en_US'],
      url: `${SITE_URL}/${locale}`,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage], creator: '@abdatytech' },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as never)) {
    notFound();
  }

  const messages = await getMessages();

  // Mode d'apparence par défaut géré dans l'admin (section "branding").
  let defaultMode = 'system';
  try {
    const branding = await getSectionContent('branding');
    const m = branding.find((b) => b.contentKey === 'defaultMode')?.valueFr;
    if (m === 'light' || m === 'dark' || m === 'system') defaultMode = m;
  } catch {
    /* repli : system */
  }

  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var savedTheme = localStorage.getItem('theme');
                var defaultMode = ${JSON.stringify(defaultMode)};
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                var dark;
                if (savedTheme) { dark = savedTheme === 'dark'; }
                else if (defaultMode === 'dark') { dark = true; }
                else if (defaultMode === 'light') { dark = false; }
                else { dark = prefersDark; }
                if (dark) { document.documentElement.classList.add('dark'); }
              })();
            `,
          }}
        />
        <StructuredData type="Organization" />
        <StructuredData type="WebSite" />
        <StructuredData type="LocalBusiness" />
      </head>
      <body className="bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-950 dark:to-primary-950 text-foreground transition-colors duration-300">
        <NextIntlClientProvider messages={messages}>
          <BrandingStyle />
          <SkipLink />
          <div id="main-content">
            <MainLayoutWrapper>{children}</MainLayoutWrapper>
          </div>
          <Chatbot />
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
