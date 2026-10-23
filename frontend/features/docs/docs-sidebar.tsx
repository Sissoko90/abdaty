'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';

const sections = [
  {
    key: 'getting-started',
    items: ['introduction', 'installation', 'quickstart'],
  },
  {
    key: 'api-reference',
    items: ['authentication', 'endpoints', 'errors'],
  },
  {
    key: 'guides',
    items: ['sms-api', 'webhooks', 'best-practices'],
  },
  {
    key: 'examples',
    items: ['nodejs', 'python', 'php', 'java'],
  },
];

const ALL_ITEMS = sections.flatMap((s) => s.items);

export function DocsSidebar() {
  const t = useTranslations('docs.sidebar');
  const [openSections, setOpenSections] = useState<string[]>(['getting-started', 'api-reference']);
  const [active, setActive] = useState<string>('introduction');

  // Surligne la section visible (suivi du défilement sur les ancres présentes).
  useEffect(() => {
    const targets = ALL_ITEMS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (targets.length === 0) return;
    const onScroll = () => {
      let current = targets[0].id;
      for (const el of targets) {
        if (el.getBoundingClientRect().top <= 140) current = el.id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleSection = (key: string) => {
    setOpenSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <nav aria-label={t('title')} className="lg:sticky lg:top-28">
      <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
        <p className="px-3 pb-2 pt-2 text-sm font-semibold text-gray-500 dark:text-gray-400">{t('title')}</p>
        <div className="space-y-1">
          {sections.map((section) => {
            const open = openSections.includes(section.key);
            return (
              <div key={section.key}>
                <button
                  type="button"
                  onClick={() => toggleSection(section.key)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left font-semibold text-ink transition-colors hover:bg-gray-50 dark:text-white dark:hover:bg-white/5"
                >
                  {t(`${section.key}.title`)}
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? '' : '-rotate-90'}`} />
                </button>
                {open && (
                  <ul className="mb-2 ml-3 mt-1 space-y-0.5 border-l border-gray-200 pl-3 dark:border-white/10">
                    {section.items.map((item) => {
                      const selected = active === item;
                      return (
                        <li key={item}>
                          <a
                            href={`#${item}`}
                            onClick={() => setActive(item)}
                            aria-current={selected ? 'location' : undefined}
                            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                              selected
                                ? 'bg-primary-50 font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-300'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-ink dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                            }`}
                          >
                            {t(`${section.key}.${item}`)}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
