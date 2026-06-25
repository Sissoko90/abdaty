import { AboutHero } from '@/features/about/about-hero';
import { StatsSection } from '@/features/about/stats-section';
import { MissionVision } from '@/features/about/mission-vision';
import { ValuesSection } from '@/features/about/values-section';
import { TimelineSection } from '@/features/about/timeline-section';
import { TeamSection } from '@/features/about/team-section';
import { WhyChooseUs } from '@/features/about/why-choose-us';
import { CertificationsSection } from '@/features/about/certifications-section';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === 'fr' 
      ? 'À Propos - Abdaty Technologie' 
      : 'About Us - Abdaty Technologie',
    description: locale === 'fr'
      ? 'Découvrez l\'histoire, la mission et l\'équipe d\'Abdaty Technologie, leader des solutions digitales au Mali.'
      : 'Discover the history, mission and team of Abdaty Technologie, leader in digital solutions in Mali.',
  };
}

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <StatsSection />
      <MissionVision />
      <ValuesSection />
      <TimelineSection />
      <TeamSection />
      <WhyChooseUs />
      <CertificationsSection />
    </>
  );
}
