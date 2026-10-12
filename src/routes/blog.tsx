import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { Calendar, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/blog")({
  component: BlogPage,
});

function BlogPage() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blogPosts"],
    queryFn: async () => {
      const res = await fetch((import.meta.env.BASE_URL || "/") + "blog-api.php?action=list");
      const json = await res.json();
      return json.posts || [];
    },
  });

  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      
      {/* Background radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_15%,rgba(106,24,154,0.15),transparent_70%)]"
      />

      <div className="flex-1 pt-24 pb-16 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-12">
          <div className="chip mb-6">Latest Updates</div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight mb-4 text-white">
            SSC 2026 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue to-purple-glow">Blog</span>
          </h1>
          <p className="text-lg text-foreground-muted max-w-2xl">
            Stories, announcements, leadership insights, and conference updates from Socially Speaking.
          </p>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex flex-col gap-4 rounded-3xl bg-white/[0.02] border border-white/5 p-4">
                  <div className="bg-white/10 rounded-2xl h-48 w-full"></div>
                  <div className="bg-white/10 h-6 w-3/4 rounded"></div>
                  <div className="bg-white/10 h-4 w-1/4 rounded"></div>
                  <div className="bg-white/10 h-20 w-full rounded mt-2"></div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-foreground-muted text-lg">No blog posts available yet.</p>
              <p className="text-sm text-foreground-subtle mt-2">Check back soon for new articles and announcements!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: any, index: number) => (
                <Reveal key={post.id} delay={index * 0.08}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group block h-full bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 flex flex-col shadow-lg hover:-translate-y-1"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-black/40">
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-foreground-subtle">
                          Socially Speaking 2026
                        </div>
                      )}
                      {post.category && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                            <Sparkles size={10} className="text-purple-glow" /> {post.category}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-xs text-foreground-subtle mb-3">
                        <Calendar size={13} />
                        {new Date(post.published_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      
                      <h3 className="font-display font-bold text-xl text-white mb-3 group-hover:text-purple-glow transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      
                      <p className="text-foreground-muted text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                        {post.excerpt || "Click to read the full article..."}
                      </p>
                      
                      <div className="text-xs font-bold text-blue-glow flex items-center gap-1 group-hover:gap-2 transition-all mt-auto tracking-wide uppercase">
                        Read Story <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
