'use client';

import { useTranslations } from 'next-intl';
import { Linkedin, Github, Mail } from 'lucide-react';
import { usePublicList } from '@/hooks/use-public-content';
import { mediaUrl } from '@/services/content.service';

interface Member {
  name: string;
  role: string;
  bio: string;
  email: string;
  image: string;
  linkedin: string;
  github: string;
}

/** N'affiche une photo que pour une image uploadée (/uploads) ou une URL absolue. */
function hasPhoto(image: string): boolean {
  return !!image && (image.startsWith('/uploads') || image.startsWith('http'));
}

/** Un lien social n'est affiché que s'il pointe réellement quelque part. */
function isRealLink(url: string): boolean {
  return !!url && url !== '#';
}

// Couleurs des initiales en alternance (encre, ocre, primaire).
const INITIAL_STYLES = ['bg-ink text-white', 'bg-ochre text-ink', 'bg-primary-600 text-white'];

export function TeamSection() {
  const t = useTranslations('about.team');

  // Équipe gérée dans l'admin (section "about-team"), avec repli i18n.
  const backend = usePublicList('about-team');
  const team: Member[] =
    backend.length > 0
      ? backend.map((m) => ({
          name: m.name as string,
          role: m.role as string,
          bio: m.bio as string,
          email: (m.email as string) || '',
          image: (m.image as string) || '',
          linkedin: (m.linkedin as string) || '#',
          github: (m.github as string) || '#',
        }))
      : [
          { name: 'Abdoulaye Diarra', role: 'CEO & Founder', bio: t('ceo.bio'), email: 'abdoulaye@abdaty-tech.com', image: '', linkedin: '#', github: '#' },
          { name: 'Fatoumata Touré', role: 'CTO', bio: t('cto.bio'), email: 'fatoumata@abdaty-tech.com', image: '', linkedin: '#', github: '#' },
          { name: 'Mamadou Keita', role: 'Lead Developer', bio: t('leadDev.bio'), email: 'mamadou@abdaty-tech.com', image: '', linkedin: '#', github: '#' },
          { name: 'Aminata Coulibaly', role: 'UI/UX Designer', bio: t('designer.bio'), email: 'aminata@abdaty-tech.com', image: '', linkedin: '#', github: '#' },
        ];

  const socialCls =
    'flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-primary-600 hover:text-white dark:bg-white/5 dark:text-gray-300';

  return (
    <section className="bg-white py-20 dark:bg-white/[0.02] lg:py-28">
      <div className="site-container">
        <div className="mb-12">
          <h2 className="mb-4 text-4xl font-bold text-ink dark:text-white md:text-5xl">{t('title')}</h2>
          <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-300">{t('subtitle')}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, index) => (
            <article
              key={member.name}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]"
            >
              {hasPhoto(member.image) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(member.image)} alt={member.name} className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-paper dark:bg-white/[0.04]">
                  <span
                    className={`flex h-24 w-24 items-center justify-center rounded-full font-display text-3xl font-bold ${INITIAL_STYLES[index % INITIAL_STYLES.length]}`}
                  >
                    {member.name
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join('')}
                  </span>
                </div>
              )}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="mb-1 text-xl font-bold text-ink dark:text-white">{member.name}</h3>
                <p className="mb-3 text-sm font-semibold text-primary-600 dark:text-primary-400">{member.role}</p>
                <p className="mb-5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{member.bio}</p>
                <div className="mt-auto flex gap-2">
                  {isRealLink(member.linkedin) && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className={socialCls} aria-label={`LinkedIn ${member.name}`}>
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {isRealLink(member.github) && (
                    <a href={member.github} target="_blank" rel="noopener noreferrer" className={socialCls} aria-label={`GitHub ${member.name}`}>
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                  {member.email && (
                    <a href={`mailto:${member.email}`} className={socialCls} aria-label={`Email ${member.name}`}>
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
