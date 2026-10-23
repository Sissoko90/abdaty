import { DocsHero } from '@/features/docs/docs-hero';
import { DocsContent } from '@/features/docs/docs-content';
import { DocsSidebar } from '@/features/docs/docs-sidebar';

export default function DocsPage() {
  return (
    <>
      <main>
        <DocsHero />
        <section className="py-16 lg:py-20">
          <div className="site-container grid gap-10 lg:grid-cols-12">
            <aside className="lg:col-span-3">
              <DocsSidebar />
            </aside>
            <div className="lg:col-span-9">
              <DocsContent />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
