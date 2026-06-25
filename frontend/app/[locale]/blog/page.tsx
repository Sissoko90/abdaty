import { BlogHero } from '@/features/blog/blog-hero';
import { BlogGrid } from '@/features/blog/blog-grid';
import { BlogCategories } from '@/features/blog/blog-categories';

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <BlogGrid />
            </div>
            <aside className="lg:col-span-1">
              <BlogCategories />
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
