'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
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

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('title')}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">{t('subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="relative overflow-hidden">
                  {hasPhoto(member.image) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(member.image)} alt={member.name} className="w-full h-64 object-cover" />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                        {member.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">{member.name}</h3>
                  <p className="text-primary-600 font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">{member.bio}</p>
                  <div className="flex gap-3">
                    <a
                      href={member.linkedin || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-gray-100 hover:bg-primary-500 rounded-full flex items-center justify-center transition-colors group"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors duration-300" />
                    </a>
                    <a
                      href={member.github || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-gray-100 hover:bg-primary-500 rounded-full flex items-center justify-center transition-colors group"
                      aria-label="GitHub"
                    >
                      <Github className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors duration-300" />
                    </a>
                    <a
                      href={`mailto:${member.email}`}
                      className="w-8 h-8 bg-gray-100 hover:bg-primary-500 rounded-full flex items-center justify-center transition-colors group"
                      aria-label="Email"
                    >
                      <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors duration-300" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
