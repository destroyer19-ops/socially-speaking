import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { Calendar, ArrowLeft } from "lucide-react";
import DOMPurify from "dompurify";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blogPost", slug],
    queryFn: async () => {
      const res = await fetch(import.meta.env.BASE_URL + `blog-api.php?action=get&slug=${slug}`);
      const json = await res.json();
      return json.post || null;
    },
  });

  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex-1 pt-24 pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-foreground-subtle hover:text-white transition-colors mb-8">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
          
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-white/10 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-white/10 rounded w-1/4 mb-8"></div>
              <div className="h-64 bg-white/10 rounded-2xl w-full mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-5/6"></div>
              </div>
            </div>
          ) : !post ? (
            <div className="text-center py-20">
              <h1 className="text-3xl font-display font-bold text-white mb-4">Post Not Found</h1>
              <p className="text-foreground-muted mb-8">The article you are looking for does not exist.</p>
              <Link to="/blog" className="btn-primary inline-flex">View all posts</Link>
            </div>
          ) : (
            <Reveal>
              <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white mb-6">
                {post.title}
              </h1>
              
              <div className="flex items-center gap-2 text-sm text-foreground-muted mb-10">
                <Calendar size={16} />
                {new Date(post.published_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>

              {post.image_url && (
                <div className="rounded-3xl overflow-hidden mb-12 bg-white/5 aspect-[16/9] lg:aspect-[21/9]">
                  <img 
                    src={post.image_url} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div 
                className="prose prose-invert prose-lg max-w-none prose-p:text-foreground-muted prose-headings:text-white prose-headings:font-display prose-a:text-blue hover:prose-a:text-purple transition-colors"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.body) }}
              />
            </Reveal>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
