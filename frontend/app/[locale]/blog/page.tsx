import { BlogHero } from '@/features/blog/blog-hero';
import { BlogGrid } from '@/features/blog/blog-grid';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === 'fr'
      ? 'Blog - Abdaty Technologie'
      : 'Blog - Abdaty Technologie',
    description: locale === 'fr'
      ? 'Découvrez nos articles sur le développement web, mobile, UI/UX design, cybersécurité et intelligence artificielle.'
      : 'Discover our articles on web development, mobile, UI/UX design, cybersecurity and artificial intelligence.',
  };
}

export default function BlogPage() {
  return (
    <>
      <main>
        <BlogHero />
        {/* Le filtre par catégorie est intégré à la grille (catégories réelles). */}
        <section className="py-16 lg:py-20">
          <div className="site-container">
            <BlogGrid />
          </div>
        </section>
      </main>
    </>
  );
}
