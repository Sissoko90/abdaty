import { BlogPostContent } from '@/features/blog/blog-post-content';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <>
      <main>
        <BlogPostContent slug={slug} />
      </main>
    </>
  );
}
