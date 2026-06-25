'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Smartphone, Monitor, Palette, Network, Shield, CheckCircle2, Zap, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { AnimatedBlobRed } from '@/components/animated-blob-red';

const serviceData: Record<string, {
  icon: typeof Code;
  color: string;
  key: string;
  benefits: string[];
  process: string[];
  technologies: string[];
}> = {
  'web-development': {
    icon: Code,
    color: 'from-blue-500 to-cyan-500',
    key: 'web',
    benefits: ['Scalable architecture', 'SEO optimized', 'Fast loading times', 'Secure by design'],
    process: ['Requirements analysis', 'UI/UX design', 'Development & testing', 'Deployment & maintenance'],
    technologies: ['React', 'Next.js', 'Node.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'],
  },
  'mobile-apps': {
    icon: Smartphone,
    color: 'from-purple-500 to-pink-500',
    key: 'mobile',
    benefits: ['Native performance', 'Offline capabilities', 'Push notifications', 'App store optimization'],
    process: ['Concept & strategy', 'Design & prototyping', 'Development', 'Testing & launch'],
    technologies: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'Redux'],
  },
  'desktop-apps': {
    icon: Monitor,
    color: 'from-green-500 to-emerald-500',
    key: 'desktop',
    benefits: ['Cross-platform compatibility', 'High performance', 'Offline functionality', 'System integration'],
    process: ['Requirements gathering', 'Architecture design', 'Implementation', 'Quality assurance'],
    technologies: ['Electron', 'Tauri', 'Qt', 'C++', 'Python', '.NET'],
  },
  'ui-ux-design': {
    icon: Palette,
    color: 'from-orange-500 to-primary-500',
    key: 'design',
    benefits: ['User-centered design', 'Increased conversions', 'Brand consistency', 'Accessibility compliance'],
    process: ['Research & discovery', 'Wireframing', 'Visual design', 'Prototyping & testing'],
    technologies: ['Figma', 'Adobe XD', 'Sketch', 'InVision', 'Principle', 'Framer'],
  },
  'network-infrastructure': {
    icon: Network,
    color: 'from-indigo-500 to-blue-500',
    key: 'network',
    benefits: ['High availability', 'Scalable infrastructure', 'Disaster recovery', 'Performance monitoring'],
    process: ['Network assessment', 'Design & planning', 'Implementation', 'Monitoring & support'],
    technologies: ['Cisco', 'VMware', 'Docker', 'Kubernetes', 'AWS', 'Azure'],
  },
  'cybersecurity': {
    icon: Shield,
    color: 'from-primary-500 to-rose-500',
    key: 'security',
    benefits: ['Threat protection', 'Compliance assurance', 'Data encryption', '24/7 monitoring'],
    process: ['Security audit', 'Vulnerability assessment', 'Implementation', 'Continuous monitoring'],
    technologies: ['Firewall', 'IDS/IPS', 'SIEM', 'Encryption', 'Penetration testing', 'SOC'],
  },
};

interface ServiceDetailProps {
  slug: string;
}

export function ServiceDetail({ slug }: ServiceDetailProps) {
  const t = useTranslations('services');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  
  const service = serviceData[slug];
  
  if (!service) {
    return <div>Service not found</div>;
  }

  const Icon = service.icon;

  return (
    <div className="pt-24 pb-20">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors duration-300 overflow-hidden">
        <AnimatedBlobRed className="top-10 right-10 opacity-30" />
        <AnimatedBlobRed className="bottom-10 left-10 opacity-20 animation-delay-2000" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className={`w-24 h-24 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
              <Icon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
              {t(`${service.key}.title`)}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
              {t(`${service.key}.description`)}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center transition-colors duration-300">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[0, 1, 2, 3].map((i, index) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <CheckCircle2 className="w-8 h-8 text-primary-600 mb-4" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                      {t(`${service.key}.features.${i}`)}
                    </h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Benefits</h2>
              <div className="space-y-4">
                {service.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Zap className="w-4 h-4 text-primary-600" />
                    </div>
                    <p className="text-lg text-gray-700 dark:text-gray-300 transition-colors duration-300">{benefit}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white border-0">
                <CardContent className="p-8">
                  <Target className="w-12 h-12 mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                  <p className="text-primary-100 mb-6">
                    Let's discuss how we can help you achieve your goals with our {t(`${service.key}.title`).toLowerCase()} services.
                  </p>
                  <Link href={`/${locale}/contact`}>
                    <Button size="lg" variant="secondary" className="w-full">
                      {tCommon('getStarted')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center transition-colors duration-300">Our Process</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {service.process.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Card className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                      {index + 1}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">{step}</h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center transition-colors duration-300">Technologies We Use</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {service.technologies.map((tech, index) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="px-6 py-3 bg-white dark:bg-gray-800 rounded-full border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-colors">
                  <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{tech}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <TrendingUp className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">
              Transform Your Business Today
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join hundreds of satisfied clients who have achieved their goals with our expertise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/${locale}/contact`}>
                <Button size="lg" variant="secondary">
                  Get a Free Consultation
                </Button>
              </Link>
              <Link href={`/${locale}/services`}>
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-primary-600">
                  View All Services
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
