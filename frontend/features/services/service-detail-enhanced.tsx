'use client';

import type { Route } from 'next';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Code, Smartphone, Monitor, Palette, Network, Shield, Zap, Target, TrendingUp, ArrowRight, Sparkles, Layers, Users, Check } from 'lucide-react';
import Link from 'next/link';
import { usePublicList } from '@/hooks/use-public-content';
import { resolveServiceIcon } from '@/lib/service-icons';
import { ProcessSteps } from './process-steps';

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

type DetailIcon = typeof Code;

/** En-tête de la page détail : même rythme que PageHero + carte chiffres en encre. */
function DetailHero({
  icon: Icon,
  title,
  subtitle,
  description,
  stats,
  locale,
  primaryLabel,
  secondaryLabel,
  secondaryHref,
}: {
  icon: DetailIcon;
  title: string;
  subtitle?: string;
  description?: string;
  stats: { value: string; label: string }[];
  locale: string;
  primaryLabel: string;
  secondaryLabel: string;
  secondaryHref: string;
}) {
  return (
    <>
      <section className="relative overflow-hidden bg-white pb-16 pt-32 dark:bg-white/[0.02] lg:pb-20 lg:pt-40">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-primary-400/15 blur-3xl dark:bg-primary-600/15" />
        <div className="site-container relative grid items-center gap-12 lg:grid-cols-12">
          <div className={stats.length > 0 ? 'lg:col-span-7' : 'lg:col-span-9'}>
            <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-sm shadow-primary-600/25">
              <Icon className="h-7 w-7" />
            </span>
            <h1 className="mb-5 text-5xl font-extrabold leading-[1.05] text-ink dark:text-white md:text-6xl">{title}</h1>
            {subtitle && <p className="mb-4 text-xl font-medium text-primary-600 dark:text-primary-400">{subtitle}</p>}
            {description && <p className="mb-9 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">{description}</p>}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}/contact`}>
                <Button size="lg" className="group w-full sm:w-auto">
                  {primaryLabel}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href={secondaryHref as Route}>
                <Button size="lg" variant="outline" className="w-full border-gray-300 bg-white/70 sm:w-auto dark:border-white/15 dark:bg-white/5">
                  {secondaryLabel}
                </Button>
              </Link>
            </div>
          </div>

          {stats.length > 0 && (
            <dl className="bogolan-texture grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/10 ring-1 ring-ink lg:col-span-5 dark:ring-white/10">
              {stats.slice(0, 4).map((stat, i) => (
                <div key={`${stat.label}-${i}`} className="flex flex-col-reverse justify-end bg-ink p-6 sm:p-8">
                  <dt className="mt-1 text-sm text-gray-400">{stat.label}</dt>
                  <dd className="font-display text-3xl font-bold text-ochre sm:text-4xl">{stat.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>
      <div className="bogolan-band" />
    </>
  );
}

/** En-tête de section aligné à gauche (même style que le reste du site). */
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-12">
      <h2 className="mb-4 text-4xl font-bold text-ink dark:text-white md:text-5xl">{title}</h2>
      {subtitle && <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-300">{subtitle}</p>}
    </div>
  );
}

/** Avantages : le premier est mis en avant (encre + bogolan), les autres en cartes. */
function BenefitsSection({
  title,
  subtitle,
  benefits,
}: {
  title: string;
  subtitle?: string;
  benefits: { icon: DetailIcon; title: string; description: string }[];
}) {
  if (benefits.length === 0) return null;
  return (
    <section className="py-20 lg:py-28">
      <div className="site-container">
        <SectionHeader title={title} subtitle={subtitle} />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => {
            const BenefitIcon = benefit.icon;
            const featured = index === 0;
            return (
              <div
                key={`${benefit.title}-${index}`}
                className={
                  featured
                    ? 'bogolan-texture rounded-2xl bg-ink p-6 text-white ring-1 ring-ink dark:ring-white/10'
                    : 'rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]'
                }
              >
                <span
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${
                    featured ? 'bg-ochre text-ink' : 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                  }`}
                >
                  <BenefitIcon className="h-6 w-6" />
                </span>
                <h3 className={`mb-2 text-lg font-bold ${featured ? 'text-white' : 'text-ink dark:text-white'}`}>{benefit.title}</h3>
                {benefit.description && (
                  <p className={`text-sm leading-relaxed ${featured ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'}`}>{benefit.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Points forts simples (features) quand aucun avantage riche n'est saisi. */
function FeaturesSection({ title, features }: { title: string; features: string[] }) {
  if (features.length === 0) return null;
  return (
    <section className="py-20 lg:py-28">
      <div className="site-container">
        <SectionHeader title={title} />
        <ul className="grid gap-4 md:grid-cols-2">
          {features.map((feature, index) => (
            <li
              key={index}
              className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                <Check className="h-5 w-5" />
              </span>
              <p className="pt-1 text-gray-700 dark:text-gray-300">{feature}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function StepsSection({
  title,
  subtitle,
  steps,
}: {
  title: string;
  subtitle?: string;
  steps: { icon?: DetailIcon; title: string; description: string }[];
}) {
  if (steps.length === 0) return null;
  return (
    <section className="bg-white py-20 dark:bg-white/[0.02] lg:py-28">
      <div className="site-container">
        <SectionHeader title={title} subtitle={subtitle} />
        <ProcessSteps steps={steps} />
      </div>
    </section>
  );
}

function TechSection({
  title,
  subtitle,
  technologies,
}: {
  title: string;
  subtitle?: string;
  technologies: { name: string; category?: string }[];
}) {
  if (technologies.length === 0) return null;
  return (
    <section className="py-20 lg:py-28">
      <div className="site-container">
        <SectionHeader title={title} subtitle={subtitle} />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {technologies.map((tech, index) => (
            <li
              key={`${tech.name}-${index}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <span className="flex items-center gap-3 font-semibold text-ink dark:text-white">
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                {tech.name}
              </span>
              {tech.category && (
                <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-white/5 dark:text-gray-400">
                  {tech.category}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Bandeau final : encre + bogolan, comme l'appel à l'action de l'accueil. */
function FinalCta({
  title,
  description,
  primaryLabel,
  secondaryLabel,
  locale,
}: {
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  locale: string;
}) {
  return (
    <section className="bg-white py-20 dark:bg-white/[0.02] lg:py-28">
      <div className="site-container">
        <div className="bogolan-texture relative flex flex-col gap-8 overflow-hidden rounded-3xl bg-ink p-8 text-white sm:p-12 lg:flex-row lg:items-center lg:justify-between lg:p-16">
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-primary-600/40 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">{title}</h2>
            <p className="text-lg leading-relaxed text-gray-300">{description}</p>
          </div>
          <div className="relative flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link href={`/${locale}/contact`}>
              <Button size="lg" className="group w-full sm:w-auto">
                {primaryLabel}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href={`/${locale}/services`}>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto"
              >
                {secondaryLabel}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ServiceDetailEnhanced({ slug }: ServiceDetailProps) {
  const t = useTranslations('services');
  const tServiceDetails = useTranslations('serviceDetails');
  const tNotFound = useTranslations('notFound');
  const locale = useLocale();

  const service = serviceData[slug];

  // Service correspondant en base (slug géré dans l'admin). Permet d'afficher
  // un service personnalisé même s'il n'a pas de « template riche » statique,
  // et de refléter le titre/description édités sur les services connus.
  const dbServices = usePublicList('services');
  const dbService = dbServices.find((s) => s.slug === slug);

  const finalCta = (
    <FinalCta
      title={tServiceDetails('common.readyToTransform')}
      description={tServiceDetails('common.letsDiscuss')}
      primaryLabel={tServiceDetails('common.getFreeConsultation')}
      secondaryLabel={tServiceDetails('common.viewAllServices')}
      locale={locale}
    />
  );

  // Aucun template statique ET aucun service en base → vraiment introuvable.
  if (!service && !dbService) {
    return (
      <section className="flex min-h-[70vh] items-center pb-20 pt-32">
        <div className="site-container">
          <h1 className="mb-6 text-5xl font-extrabold text-ink dark:text-white">{tNotFound('title')}</h1>
          <Link href={`/${locale}/services`}>
            <Button size="lg">{tServiceDetails('common.viewAllServices')}</Button>
          </Link>
        </div>
      </section>
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
    const whyTitle = `${tServiceDetails('common.whyChoose')} ${dbService.title}`;
    return (
      <>
        <DetailHero
          icon={DbIcon}
          title={dbService.title}
          subtitle={dbService.subtitle}
          description={dbService.description}
          stats={dbStats}
          locale={locale}
          primaryLabel={tServiceDetails('common.getStarted')}
          secondaryLabel={tServiceDetails('common.viewAllServices')}
          secondaryHref={`/${locale}/services`}
        />
        {dbBenefits.length > 0 ? (
          <BenefitsSection
            title={whyTitle}
            benefits={dbBenefits.map((b) => ({ icon: detailIcon(b.icon), title: b.title, description: b.description }))}
          />
        ) : (
          <FeaturesSection title={whyTitle} features={features} />
        )}
        <StepsSection title={tServiceDetails('common.ourProcess')} steps={dbProcess} />
        <TechSection title={tServiceDetails('common.technologiesWeMaster')} technologies={dbTech} />
        {finalCta}
      </>
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
        }))
      : service.technologies;

  return (
    <>
      <DetailHero
        icon={Icon}
        title={heroTitle}
        description={heroDescription}
        stats={translatedStats}
        locale={locale}
        primaryLabel={tServiceDetails('common.getStarted')}
        secondaryLabel={tServiceDetails('common.scheduleCall')}
        secondaryHref={`/${locale}/contact`}
      />
      <BenefitsSection
        title={`${tServiceDetails('common.whyChoose')} ${heroTitle}`}
        subtitle={tServiceDetails('common.powerfulFeatures')}
        benefits={translatedBenefits}
      />
      <StepsSection
        title={tServiceDetails('common.ourProcess')}
        subtitle={tServiceDetails('common.fromConceptToLaunch')}
        steps={translatedProcess}
      />
      <TechSection
        title={tServiceDetails('common.technologiesWeMaster')}
        subtitle={tServiceDetails('common.industryLeadingTools')}
        technologies={finalTechnologies}
      />
      {finalCta}
    </>
  );
}
