'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Smartphone, Monitor, Palette, Network, Shield, Zap, Target, TrendingUp, ArrowRight, Sparkles, Layers, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { AnimatedBlobRed } from '@/components/animated-blob-red';
import { usePublicList } from '@/hooks/use-public-content';
import { resolveServiceIcon } from '@/lib/service-icons';

/** Icônes utilisables dans les sous-sections riches gérées en base (avantages…). */
const DETAIL_ICON_MAP: Record<string, typeof Code> = {
  Code, Smartphone, Monitor, Palette, Network, Shield, Zap, Target, TrendingUp, Sparkles, Layers, Users,
};
/** Résout un nom d'icône vers un composant (repli sur le vocabulaire services). */
function detailIcon(name?: string): typeof Code {
  return (name && DETAIL_ICON_MAP[name]) || resolveServiceIcon(name);
}

const serviceData: Record<string, {
  icon: typeof Code;
  color: string;
  gradient: string;
  key: string;
  benefits: { icon: typeof Zap; title: string; description: string }[];
  process: { icon: typeof Target; title: string; description: string }[];
  technologies: { name: string; category: string; color: string }[];
  stats: { value: string; label: string }[];
  illustration: string;
}> = {
  'web-development': {
    icon: Code,
    color: 'from-primary-500 to-primary-700',
    gradient: 'from-primary-50 to-primary-50',
    key: 'web',
    illustration: '',
    stats: [
      { value: '50+', label: 'Web Apps Built' },
      { value: '99.9%', label: 'Uptime' },
      { value: '3s', label: 'Avg Load Time' },
      { value: '100%', label: 'Mobile Ready' },
    ],
    benefits: [
      { icon: Zap, title: 'Lightning Fast', description: 'Optimized performance with Next.js and modern frameworks' },
      { icon: Layers, title: 'Scalable Architecture', description: 'Built to grow with your business needs' },
      { icon: Shield, title: 'Secure by Design', description: 'Enterprise-grade security standards' },
      { icon: Users, title: 'User-Centric', description: 'Beautiful interfaces that users love' },
    ],
    process: [
      { icon: Target, title: 'Discovery & Planning', description: 'We analyze your requirements and create a detailed roadmap' },
      { icon: Palette, title: 'Design & Prototyping', description: 'Interactive prototypes to visualize your app' },
      { icon: Code, title: 'Development', description: 'Clean, maintainable code following best practices' },
      { icon: Sparkles, title: 'Launch & Support', description: 'Smooth deployment and ongoing maintenance' },
    ],
    technologies: [
      { name: 'React', category: 'Frontend', color: 'bg-primary-500' },
      { name: 'Next.js', category: 'Framework', color: 'bg-primary-600' },
      { name: 'TypeScript', category: 'Language', color: 'bg-primary-700' },
      { name: 'Tailwind CSS', category: 'Styling', color: 'bg-primary-400' },
      { name: 'Node.js', category: 'Backend', color: 'bg-primary-600' },
      { name: 'Java', category: 'Backend', color: 'bg-primary-700' },
      { name: 'Spring Boot', category: 'Framework', color: 'bg-primary-500' },
      { name: 'PHP', category: 'Backend', color: 'bg-primary-600' },
      { name: 'Laravel', category: 'Framework', color: 'bg-primary-500' },
      { name: 'Python', category: 'Backend', color: 'bg-primary-700' },
      { name: 'Django', category: 'Framework', color: 'bg-primary-600' },
      { name: 'Flask', category: 'Framework', color: 'bg-primary-500' },
      { name: 'PostgreSQL', category: 'Database', color: 'bg-primary-700' },
      { name: 'MySQL', category: 'Database', color: 'bg-primary-600' },
      { name: 'GraphQL', category: 'API', color: 'bg-primary-500' },
      { name: 'Docker', category: 'DevOps', color: 'bg-primary-600' },
    ],
  },
  'mobile-apps': {
    icon: Smartphone,
    color: 'from-primary-500 to-primary-700',
    gradient: 'from-primary-50 to-primary-50',
    key: 'mobile',
    illustration: '',
    stats: [
      { value: '30+', label: 'Apps Published' },
      { value: '4.8★', label: 'Avg Rating' },
      { value: '1M+', label: 'Downloads' },
      { value: 'iOS+Android', label: 'Platforms' },
    ],
    benefits: [
      { icon: Zap, title: 'Native Performance', description: 'Smooth 60fps animations and instant response' },
      { icon: Layers, title: 'Cross-Platform', description: 'One codebase for iOS and Android' },
      { icon: Shield, title: 'Offline First', description: 'Works seamlessly without internet' },
      { icon: Users, title: 'Push Notifications', description: 'Engage users with timely updates' },
    ],
    process: [
      { icon: Target, title: 'Strategy & Research', description: 'Market analysis and user persona definition' },
      { icon: Palette, title: 'UI/UX Design', description: 'Platform-specific design guidelines' },
      { icon: Code, title: 'Native Development', description: 'React Native or Flutter implementation' },
      { icon: Sparkles, title: 'App Store Launch', description: 'Submission and optimization for stores' },
    ],
    technologies: [
      { name: 'React Native', category: 'Framework', color: 'bg-primary-500' },
      { name: 'Flutter', category: 'Framework', color: 'bg-primary-600' },
      { name: 'Swift', category: 'iOS', color: 'bg-primary-700' },
      { name: 'Kotlin', category: 'Android', color: 'bg-primary-600' },
      { name: 'Java', category: 'Android', color: 'bg-primary-700' },
      { name: 'Firebase', category: 'Backend', color: 'bg-primary-500' },
      { name: 'Redux', category: 'State', color: 'bg-primary-600' },
      { name: 'Expo', category: 'Tools', color: 'bg-primary-700' },
      { name: 'Jest', category: 'Testing', color: 'bg-primary-600' },
    ],
  },
  'desktop-apps': {
    icon: Monitor,
    color: 'from-primary-500 to-primary-700',
    gradient: 'from-primary-50 to-primary-50',
    key: 'desktop',
    illustration: '',
    stats: [
      { value: '20+', label: 'Desktop Apps' },
      { value: '3', label: 'Platforms' },
      { value: '99%', label: 'Reliability' },
      { value: '24/7', label: 'Support' },
    ],
    benefits: [
      { icon: Zap, title: 'High Performance', description: 'Native speed with optimized resource usage' },
      { icon: Layers, title: 'Cross-Platform', description: 'Windows, macOS, and Linux support' },
      { icon: Shield, title: 'System Integration', description: 'Deep OS integration and automation' },
      { icon: Users, title: 'Offline Capable', description: 'Full functionality without internet' },
    ],
    process: [
      { icon: Target, title: 'Requirements Analysis', description: 'Understanding your workflow and needs' },
      { icon: Palette, title: 'Architecture Design', description: 'Scalable and maintainable structure' },
      { icon: Code, title: 'Implementation', description: 'Modern frameworks like Electron or Tauri' },
      { icon: Sparkles, title: 'Deployment', description: 'Auto-updates and distribution setup' },
    ],
    technologies: [
      { name: 'Electron', category: 'Framework', color: 'bg-primary-500' },
      { name: 'Tauri', category: 'Framework', color: 'bg-primary-600' },
      { name: 'Qt', category: 'Framework', color: 'bg-primary-700' },
      { name: 'C++', category: 'Language', color: 'bg-primary-600' },
      { name: 'Java', category: 'Language', color: 'bg-primary-700' },
      { name: 'JavaFX', category: 'Framework', color: 'bg-primary-600' },
      { name: 'Python', category: 'Language', color: 'bg-primary-500' },
      { name: 'PyQt', category: 'Framework', color: 'bg-primary-600' },
      { name: '.NET', category: 'Framework', color: 'bg-primary-700' },
      { name: 'SQLite', category: 'Database', color: 'bg-primary-600' },
      { name: 'Rust', category: 'Language', color: 'bg-primary-500' },
    ],
  },
  'ui-ux-design': {
    icon: Palette,
    color: 'from-primary-500 to-primary-700',
    gradient: 'from-primary-50 to-primary-50',
    key: 'design',
    illustration: '',
    stats: [
      { value: '100+', label: 'Designs Created' },
      { value: '95%', label: 'Client Satisfaction' },
      { value: '50%', label: 'Conversion Boost' },
      { value: 'WCAG', label: 'Accessible' },
    ],
    benefits: [
      { icon: Zap, title: 'User-Centered', description: 'Research-driven design decisions' },
      { icon: Layers, title: 'Brand Consistency', description: 'Cohesive design systems' },
      { icon: Shield, title: 'Accessibility', description: 'WCAG 2.1 AA compliance' },
      { icon: Users, title: 'Conversion Focused', description: 'Designs that drive results' },
    ],
    process: [
      { icon: Target, title: 'Research & Discovery', description: 'User interviews and competitive analysis' },
      { icon: Palette, title: 'Wireframing', description: 'Low-fidelity layouts and user flows' },
      { icon: Code, title: 'Visual Design', description: 'High-fidelity mockups and prototypes' },
      { icon: Sparkles, title: 'Testing & Iteration', description: 'User testing and refinement' },
    ],
    technologies: [
      { name: 'Figma', category: 'Design', color: 'bg-primary-500' },
      { name: 'Adobe XD', category: 'Design', color: 'bg-primary-600' },
      { name: 'Sketch', category: 'Design', color: 'bg-primary-700' },
      { name: 'InVision', category: 'Prototype', color: 'bg-primary-500' },
      { name: 'Principle', category: 'Animation', color: 'bg-primary-600' },
      { name: 'Framer', category: 'Prototype', color: 'bg-primary-700' },
      { name: 'Miro', category: 'Collaboration', color: 'bg-primary-600' },
      { name: 'Maze', category: 'Testing', color: 'bg-primary-500' },
    ],
  },
  'network-infrastructure': {
    icon: Network,
    color: 'from-primary-500 to-primary-700',
    gradient: 'from-primary-50 to-primary-50',
    key: 'network',
    illustration: '',
    stats: [
      { value: '99.99%', label: 'Uptime SLA' },
      { value: '50+', label: 'Networks Built' },
      { value: '<5ms', label: 'Latency' },
      { value: '24/7', label: 'Monitoring' },
    ],
    benefits: [
      { icon: Zap, title: 'High Availability', description: 'Redundant systems for zero downtime' },
      { icon: Layers, title: 'Scalable', description: 'Grows with your business needs' },
      { icon: Shield, title: 'Secure', description: 'Multi-layer security architecture' },
      { icon: Users, title: 'Monitored', description: 'Real-time performance tracking' },
    ],
    process: [
      { icon: Target, title: 'Network Assessment', description: 'Current infrastructure evaluation' },
      { icon: Palette, title: 'Design & Planning', description: 'Topology and capacity planning' },
      { icon: Code, title: 'Implementation', description: 'Hardware and software deployment' },
      { icon: Sparkles, title: 'Monitoring & Support', description: 'Proactive maintenance and optimization' },
    ],
    technologies: [
      { name: 'Cisco', category: 'Hardware', color: 'bg-primary-600' },
      { name: 'VMware', category: 'Virtualization', color: 'bg-primary-500' },
      { name: 'Docker', category: 'Containers', color: 'bg-primary-600' },
      { name: 'Kubernetes', category: 'Orchestration', color: 'bg-primary-700' },
      { name: 'AWS', category: 'Cloud', color: 'bg-primary-500' },
      { name: 'Azure', category: 'Cloud', color: 'bg-primary-600' },
      { name: 'Terraform', category: 'IaC', color: 'bg-primary-700' },
      { name: 'Ansible', category: 'Automation', color: 'bg-primary-600' },
    ],
  },
  'cybersecurity': {
    icon: Shield,
    color: 'from-primary-500 to-primary-700',
    gradient: 'from-primary-50 to-primary-50',
    key: 'security',
    illustration: '',
    stats: [
      { value: '0', label: 'Breaches' },
      { value: '100+', label: 'Audits Done' },
      { value: '24/7', label: 'Threat Monitor' },
      { value: 'ISO 27001', label: 'Certified' },
    ],
    benefits: [
      { icon: Zap, title: 'Threat Protection', description: 'Advanced threat detection and prevention' },
      { icon: Layers, title: 'Compliance', description: 'GDPR, ISO 27001, SOC 2 ready' },
      { icon: Shield, title: 'Encryption', description: 'End-to-end data encryption' },
      { icon: Users, title: '24/7 SOC', description: 'Security Operations Center monitoring' },
    ],
    process: [
      { icon: Target, title: 'Security Audit', description: 'Comprehensive vulnerability assessment' },
      { icon: Palette, title: 'Risk Analysis', description: 'Identify and prioritize threats' },
      { icon: Code, title: 'Implementation', description: 'Deploy security controls and tools' },
      { icon: Sparkles, title: 'Continuous Monitoring', description: 'Real-time threat detection' },
    ],
    technologies: [
      { name: 'Firewall', category: 'Network', color: 'bg-primary-600' },
      { name: 'IDS/IPS', category: 'Detection', color: 'bg-primary-700' },
      { name: 'SIEM', category: 'Monitoring', color: 'bg-primary-600' },
      { name: 'Encryption', category: 'Data', color: 'bg-primary-500' },
      { name: 'Penetration Testing', category: 'Testing', color: 'bg-primary-700' },
      { name: 'SOC', category: 'Operations', color: 'bg-primary-600' },
      { name: 'WAF', category: 'Web', color: 'bg-primary-500' },
      { name: 'Zero Trust', category: 'Architecture', color: 'bg-primary-700' },
    ],
  },
  'data-ai': {
    icon: TrendingUp,
    color: 'from-primary-500 to-primary-700',
    gradient: 'from-primary-50 to-primary-50',
    key: 'dataAi',
    illustration: '',
    stats: [
      { value: '40+', label: 'AI Projects' },
      { value: '95%', label: 'Accuracy' },
      { value: '10TB+', label: 'Data Processed' },
      { value: '24/7', label: 'ML Models' },
    ],
    benefits: [
      { icon: Zap, title: 'Predictive Analytics', description: 'AI-powered insights for better decision making' },
      { icon: Layers, title: 'Big Data Processing', description: 'Handle massive datasets with ease' },
      { icon: Shield, title: 'Data Security', description: 'Enterprise-grade data protection' },
      { icon: Users, title: 'Custom ML Models', description: 'Tailored machine learning solutions' },
    ],
    process: [
      { icon: Target, title: 'Data Collection', description: 'Gather and clean your data sources' },
      { icon: Palette, title: 'Analysis & Modeling', description: 'Build and train ML models' },
      { icon: Code, title: 'Implementation', description: 'Deploy AI solutions to production' },
      { icon: Sparkles, title: 'Optimization', description: 'Continuous model improvement' },
    ],
    technologies: [
      { name: 'Python', category: 'Language', color: 'bg-primary-600' },
      { name: 'TensorFlow', category: 'ML Framework', color: 'bg-primary-700' },
      { name: 'PyTorch', category: 'ML Framework', color: 'bg-primary-600' },
      { name: 'Scikit-learn', category: 'ML Library', color: 'bg-primary-500' },
      { name: 'Pandas', category: 'Data Analysis', color: 'bg-primary-600' },
      { name: 'NumPy', category: 'Computing', color: 'bg-primary-700' },
      { name: 'Jupyter', category: 'Notebook', color: 'bg-primary-500' },
      { name: 'Apache Spark', category: 'Big Data', color: 'bg-primary-600' },
      { name: 'Hadoop', category: 'Big Data', color: 'bg-primary-700' },
      { name: 'Tableau', category: 'Visualization', color: 'bg-primary-600' },
      { name: 'Power BI', category: 'Visualization', color: 'bg-primary-500' },
      { name: 'OpenAI API', category: 'AI Service', color: 'bg-primary-700' },
      { name: 'Hugging Face', category: 'NLP', color: 'bg-primary-600' },
      { name: 'MLflow', category: 'MLOps', color: 'bg-primary-500' },
      { name: 'Keras', category: 'Deep Learning', color: 'bg-primary-600' },
      { name: 'MongoDB', category: 'Database', color: 'bg-primary-700' },
    ],
  },
};

interface ServiceDetailProps {
  slug: string;
}

export function ServiceDetailEnhanced({ slug }: ServiceDetailProps) {
  const t = useTranslations('services');
  const tServiceDetails = useTranslations('serviceDetails');
  const locale = useLocale();

  const service = serviceData[slug];

  // Service correspondant en base (slug géré dans l'admin). Permet d'afficher
  // un service personnalisé même s'il n'a pas de « template riche » statique,
  // et de refléter le titre/description édités sur les services connus.
  const dbServices = usePublicList('services');
  const dbService = dbServices.find((s) => s.slug === slug);

  // Aucun template statique ET aucun service en base → vraiment introuvable.
  if (!service && !dbService) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Service not found</h1>
          <Link href={`/${locale}/services`}>
            <Button>{tServiceDetails('common.viewAllServices')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Cas service géré uniquement en base (pas de template riche) : rendu épuré
  // mais complet (héros + bénéfices/atouts issus des « features » + CTA).
  if (!service && dbService) {
    const DbIcon = resolveServiceIcon(dbService.icon);
    const features: string[] = Array.isArray(dbService.features) ? dbService.features.filter(Boolean) : [];
    // Sous-sections riches gérées dans l'admin (peuvent être vides).
    const dbStats: { value: string; label: string }[] = Array.isArray(dbService.stats) ? dbService.stats : [];
    const dbBenefits: { icon: string; title: string; description: string }[] = Array.isArray(dbService.benefits) ? dbService.benefits : [];
    const dbProcess: { title: string; description: string }[] = Array.isArray(dbService.process) ? dbService.process : [];
    const dbTech: { name: string; category: string }[] = Array.isArray(dbService.technologies) ? dbService.technologies : [];
    return (
      <div className="pt-20 pb-20">
        <section className="px-4 sm:px-6 lg:px-8 py-24 bg-gradient-to-br from-primary-50 to-primary-50 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden transition-colors duration-300">
          <div className="absolute inset-0 overflow-hidden">
            <AnimatedBlobRed className="top-10 right-20 w-96 h-96 opacity-30 animation-delay-1000" />
            <AnimatedBlobRed className="bottom-10 left-20 w-80 h-80 opacity-25 animation-delay-3000" />
          </div>
          <div className="max-w-5xl mx-auto relative z-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
              <DbIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
              {dbService.title}
            </h1>
            {dbService.subtitle && (
              <p className="text-2xl text-primary-600 dark:text-primary-400 mb-4 font-medium">{dbService.subtitle}</p>
            )}
            {dbService.description && (
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto transition-colors duration-300">
                {dbService.description}
              </p>
            )}
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href={`/${locale}/contact`}>
                <Button size="lg" className="bg-gradient-to-r from-primary-500 to-primary-700 hover:opacity-90">
                  {tServiceDetails('common.getStarted')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href={`/${locale}/services`}>
                <Button size="lg" variant="outline">{tServiceDetails('common.viewAllServices')}</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Statistiques (gérées en base) */}
        {dbStats.length > 0 && (
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
              {dbStats.map((stat, i) => (
                <Card key={i} className="bg-white/80 dark:bg-gray-800/80 border-2 hover:border-primary-300 transition-all hover:shadow-xl">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Avantages (gérés en base) — sinon repli sur les features simples */}
        {dbBenefits.length > 0 ? (
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center transition-colors duration-300">
                {tServiceDetails('common.whyChoose')} {dbService.title}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dbBenefits.map((b, i) => {
                  const BIcon = detailIcon(b.icon);
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                      <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary-200 group">
                        <CardContent className="p-6">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <BIcon className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{b.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{b.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : features.length > 0 && (
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center transition-colors duration-300">
                {tServiceDetails('common.whyChoose')} {dbService.title}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary-200">
                      <CardContent className="p-6 flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-lg transition-colors duration-300">{feature}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Processus (géré en base) */}
        {dbProcess.length > 0 && (
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center transition-colors duration-300">
                {tServiceDetails('common.ourProcess')}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {dbProcess.map((step, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                    <Card className="h-full bg-white dark:bg-gray-800 hover:shadow-xl transition-all">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg mb-4">
                          {i + 1}
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{step.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{step.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Technologies (gérées en base) */}
        {dbTech.length > 0 && (
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center transition-colors duration-300">
                {tServiceDetails('common.technologiesWeMaster')}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dbTech.map((tech, i) => (
                  <Card key={i} className="overflow-hidden hover:shadow-lg transition-all border-2 hover:border-primary-200">
                    <CardContent className="p-0">
                      <div className="bg-primary-600 h-2"></div>
                      <div className="p-4 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 dark:text-white">{tech.name}</h3>
                        {tech.category && (
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                            {tech.category}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-500 to-primary-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <Sparkles className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{tServiceDetails('common.getStarted')}</h2>
            <Link href={`/${locale}/contact`}>
              <Button size="lg" variant="secondary" className="group">
                {tServiceDetails('common.getStarted')}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const Icon = service.icon;
  // Titre/description issus de la base si le service existe aussi côté admin,
  // sinon repli i18n. Permet de refléter les éditions de l'admin.
  const heroTitle = dbService?.title ?? t(`${service.key}.title`);
  const heroDescription = dbService?.description ?? t(`${service.key}.description`);

  // Get translated stats
  const getTranslatedStats = () => {
    // Priorité aux statistiques gérées dans l'admin.
    if (dbService && Array.isArray(dbService.stats) && dbService.stats.length > 0) {
      return (dbService.stats as { value: string; label: string }[]).map((s) => ({ value: s.value, label: s.label }));
    }
    const statsKeys: Record<string, string[]> = {
      'web': ['apps', 'uptime', 'loadTime', 'mobile'],
      'mobile': ['apps', 'users', 'rating', 'retention'],
      'desktop': ['apps', 'reliability', 'support', 'platforms'],
      'design': ['projects', 'wireframes', 'prototypes', 'satisfaction'],
      'network': ['networks', 'latency', 'monitoring', 'uptimeSLA'],
      'security': ['audits', 'threats', 'compliance', 'response'],
      'dataAi': ['projects', 'accuracy', 'data', 'models'],
    };
    const keys = statsKeys[service.key] || [];
    return service.stats.map((stat, index) => ({
      value: stat.value,
      label: keys[index] ? t(`${service.key}.stats.${keys[index]}`) : stat.label
    }));
  };

  // Get translated benefits
  const getTranslatedBenefits = () => {
    // Priorité aux avantages gérés dans l'admin.
    if (dbService && Array.isArray(dbService.benefits) && dbService.benefits.length > 0) {
      return (dbService.benefits as { icon: string; title: string; description: string }[]).map((b) => ({
        icon: detailIcon(b.icon),
        title: b.title,
        description: b.description,
      }));
    }
    const benefitKeys: Record<string, string[]> = {
      'web': ['fast', 'scalable', 'secure', 'user'],
      'mobile': ['cross', 'native', 'offline', 'push'],
      'desktop': ['high', 'integration', 'offline', 'updates'],
      'design': ['user', 'modern', 'accessible', 'consistent'],
      'network': ['high', 'scalable', 'monitored', 'secure'],
      'security': ['audit', 'monitoring', 'compliance', 'response'],
      'dataAi': ['predictive', 'bigdata', 'security', 'custom'],
    };
    const keys = benefitKeys[service.key] || [];
    return service.benefits.map((benefit, index) => ({
      icon: benefit.icon,
      title: keys[index] ? t(`${service.key}.benefits.${keys[index]}`) : benefit.title,
      description: keys[index] ? t(`${service.key}.benefits.${keys[index]}Desc`) : benefit.description
    }));
  };

  // Get translated process
  const getTranslatedProcess = () => {
    // Priorité au processus géré dans l'admin.
    if (dbService && Array.isArray(dbService.process) && dbService.process.length > 0) {
      return (dbService.process as { title: string; description: string }[]).map((p) => ({
        icon: Target,
        title: p.title,
        description: p.description,
      }));
    }
    const processKeys: Record<string, string[]> = {
      'web': ['discoveryPlanning', 'designPrototyping', 'development', 'launchSupport'],
      'mobile': ['strategyResearch', 'uiUxDesign', 'nativeDevelopment', 'appStoreLaunch'],
      'desktop': ['requirementsAnalysis', 'architectureDesign', 'implementation', 'deployment'],
      'design': ['researchDiscovery', 'wireframing', 'visualDesign', 'testingIteration'],
      'network': ['networkAssessment', 'designPlanning', 'hardwareSoftwareDeployment', 'monitoringSupport'],
      'security': ['securityAudit', 'riskAnalysis', 'securityImplementation', 'continuousMonitoring'],
      'dataAi': ['dataCollection', 'analysisModeling', 'aiImplementation', 'optimization'],
    };
    const keys = processKeys[service.key] || [];
    return service.process.map((step, index) => ({
      icon: step.icon,
      title: keys[index] ? tServiceDetails(`process.${keys[index]}.title`) : step.title,
      description: keys[index] ? tServiceDetails(`process.${keys[index]}.description`) : step.description
    }));
  };

  const translatedStats = getTranslatedStats();
  const translatedBenefits = getTranslatedBenefits();
  const translatedProcess = getTranslatedProcess();
  // Technologies : priorité à celles gérées dans l'admin.
  const finalTechnologies =
    dbService && Array.isArray(dbService.technologies) && dbService.technologies.length > 0
      ? (dbService.technologies as { name: string; category: string }[]).map((t) => ({
          name: t.name,
          category: t.category,
          color: 'bg-primary-600',
        }))
      : service.technologies;

  return (
    <div className="pt-20 pb-20">
      {/* Hero Section with Illustration */}
      <section className={`px-4 sm:px-6 lg:px-8 py-24 bg-gradient-to-br ${service.gradient} dark:from-gray-900 dark:to-gray-950 relative overflow-hidden transition-colors duration-300`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-20 left-10 w-72 h-72 bg-gradient-to-br ${service.color} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob`}></div>
          <div className={`absolute top-40 right-10 w-72 h-72 bg-gradient-to-br ${service.color} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000`}></div>
          <div className={`absolute -bottom-8 left-1/2 w-72 h-72 bg-gradient-to-br ${service.color} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000`}></div>
          <AnimatedBlobRed className="top-10 right-20 w-96 h-96 opacity-30 animation-delay-1000" />
          <AnimatedBlobRed className="bottom-10 left-20 w-80 h-80 opacity-25 animation-delay-3000" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-20 h-20 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <div className="text-6xl">{service.illustration}</div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
                {heroTitle}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed transition-colors duration-300">
                {heroDescription}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href={`/${locale}/contact`}>
                  <Button size="lg" className={`bg-gradient-to-r ${service.color} hover:opacity-90`}>
                    {tServiceDetails('common.getStarted')}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href={`/${locale}/contact`}>
                  <Button size="lg" variant="outline">
                    {tServiceDetails('common.scheduleCall')}
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {translatedStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 hover:border-primary-300 transition-all hover:shadow-xl">
                    <CardContent className="p-6 text-center">
                      <div className={`text-4xl font-bold bg-gradient-to-r ${service.color} bg-clip-text text-transparent mb-2`}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section with Icons */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{tServiceDetails('common.whyChoose')} {heroTitle}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">{tServiceDetails('common.powerfulFeatures')}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {translatedBenefits.map((benefit, index) => {
              const BenefitIcon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary-200 group">
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <BenefitIcon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 transition-colors duration-300">{benefit.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{tServiceDetails('common.ourProcess')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">{tServiceDetails('common.fromConceptToLaunch')}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {translatedProcess.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="relative"
                >
                  {/* Connection Line */}
                  {index < translatedProcess.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary-300 to-transparent -z-10"></div>
                  )}

                  <Card className="h-full bg-white dark:bg-gray-800 hover:shadow-xl transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${service.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                          {index + 1}
                        </div>
                        <div className={`w-12 h-12 bg-gradient-to-br ${service.gradient} rounded-xl flex items-center justify-center`}>
                          <StepIcon className={`w-6 h-6 bg-gradient-to-br ${service.color} bg-clip-text text-transparent`} />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 transition-colors duration-300">{step.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technologies with Visual Tags */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{tServiceDetails('common.technologiesWeMaster')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">{tServiceDetails('common.industryLeadingTools')}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {finalTechnologies.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all border-2 hover:border-primary-200">
                  <CardContent className="p-0">
                    <div className={`${tech.color} h-2`}></div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white transition-colors duration-300">{tech.name}</h3>
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 transition-colors duration-300">
                          {tech.category}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <motion.div
                          className={`${tech.color} h-1.5 rounded-full`}
                          initial={{ width: 0 }}
                          whileInView={{ width: '100%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: index * 0.05 }}
                        ></motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br ${service.color} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Let's build something amazing together. Get a free consultation with our experts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/${locale}/contact`}>
                <Button size="lg" variant="secondary" className="group">
                  Get Free Consultation
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href={`/${locale}/services`}>
                <Button size="lg" variant="outline" className="bg-white/10 text-white border-white hover:bg-white hover:text-gray-900">
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
