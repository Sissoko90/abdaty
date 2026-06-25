import { DocsHero } from '@/features/docs/docs-hero';
import { DocsContent } from '@/features/docs/docs-content';
import { DocsSidebar } from '@/features/docs/docs-sidebar';

export default function DocsPage() {
  return (
    <>
      <main>
        <DocsHero />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <DocsSidebar />
            </aside>
            <div className="lg:col-span-3">
              <DocsContent />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
