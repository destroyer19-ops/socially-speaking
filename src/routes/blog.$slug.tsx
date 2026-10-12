import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { Calendar, ArrowLeft, User, Clock, Share2, Check, Sparkles } from "lucide-react";
import DOMPurify from "dompurify";
import { useState } from "react";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const [copied, setCopied] = useState(false);

  const { data: post, isLoading } = useQuery({
    queryKey: ["blogPost", slug],
    queryFn: async () => {
      const res = await fetch((import.meta.env.BASE_URL || "/") + `blog-api.php?action=get&slug=${slug}`);
      const json = await res.json();
      return json.post || null;
    },
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = post?.body ? post.body.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      
      {/* Ambient background wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_15%,rgba(106,24,154,0.15),transparent_70%)]"
      />

      <div className="flex-1 pt-24 pb-24 relative">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          
          {/* Back button */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-foreground-subtle hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={16} /> Back to Blog
          </Link>

          {isLoading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-6 bg-white/10 rounded w-24 mb-4"></div>
              <div className="h-12 bg-white/10 rounded w-5/6"></div>
              <div className="h-4 bg-white/10 rounded w-1/3"></div>
              <div className="aspect-[16/9] bg-white/10 rounded-3xl w-full my-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
              </div>
            </div>
          ) : !post ? (
            <div className="text-center py-20 rounded-3xl border border-white/10 bg-white/5 p-8">
              <h1 className="text-3xl font-display font-bold text-white mb-4">Article Not Found</h1>
              <p className="text-foreground-muted mb-8 max-w-md mx-auto">
                The article you are looking for does not exist or may have been unpublished.
              </p>
              <Link to="/blog" className="btn-primary inline-flex py-3 px-6">
                View all articles
              </Link>
            </div>
          ) : (
            <Reveal>
              <article>
                
                {/* Category & Tag pill */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 rounded-full border border-purple-glow/30 bg-purple-glow/10 px-3 py-0.5 text-xs font-semibold text-purple-glow">
                    <Sparkles size={11} /> {post.category || "General"}
                  </span>
                  {post.tags && (
                    <span className="text-xs text-foreground-subtle">
                      #{post.tags.split(",")[0].trim()}
                    </span>
                  )}
                </div>

                {/* Article Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white mb-6 leading-[1.12]">
                  {post.title}
                </h1>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8 text-xs text-foreground-muted">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5 text-white font-medium">
                      <User size={14} className="text-purple-glow" />
                      <span>{post.author || "Socially Speaking"}</span>
                    </div>
                    <span className="text-white/20">·</span>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>
                        {new Date(post.published_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <span className="text-white/20">·</span>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>~{readingTime} min read</span>
                    </div>
                  </div>

                  {/* Share button */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-foreground-muted hover:text-white hover:bg-white/10 transition-colors"
                      title="Copy article link"
                    >
                      {copied ? <Check size={13} className="text-green-400" /> : <Share2 size={13} />}
                      <span>{copied ? "Link Copied!" : "Share"}</span>
                    </button>
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                        post.title + " " + window.location.href
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/20 transition-colors"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>

                {/* Featured Header Image */}
                {post.image_url && (
                  <div className="rounded-3xl overflow-hidden mb-12 border border-white/10 bg-black/40 aspect-[16/9] shadow-2xl">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Excerpt Lead */}
                {post.excerpt && (
                  <p className="text-lg sm:text-xl font-medium text-foreground-muted mb-10 border-l-4 border-brand pl-5 leading-relaxed italic">
                    {post.excerpt}
                  </p>
                )}

                {/* Article Body with rich-text styles */}
                <div
                  className="prose prose-invert prose-lg max-w-none text-left
                    prose-p:text-foreground-muted prose-p:leading-relaxed prose-p:my-5
                    prose-headings:font-display prose-headings:font-black prose-headings:text-white prose-headings:tracking-tight
                    prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4
                    prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                    prose-a:text-blue-glow prose-a:underline hover:prose-a:text-purple-glow
                    prose-blockquote:border-l-4 prose-blockquote:border-purple-glow prose-blockquote:bg-white/[0.02] prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-white
                    prose-ul:list-disc prose-ul:my-5 prose-ul:pl-6
                    prose-ol:list-decimal prose-ol:my-5 prose-ol:pl-6
                    prose-img:rounded-2xl prose-img:border prose-img:border-white/10 prose-img:shadow-xl prose-img:my-8 prose-img:mx-auto
                    prose-figure:my-8 prose-figure:text-center
                    prose-figcaption:text-xs prose-figcaption:text-foreground-subtle prose-figcaption:mt-2 prose-figcaption:italic"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(post.body || "", {
                      ADD_TAGS: ["figure", "figcaption", "iframe"],
                      ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "target"],
                    }),
                  }}
                />

                {/* Article Footer Navigation */}
                <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-foreground-subtle">Published by</p>
                    <p className="text-sm font-bold text-white">{post.author || "Socially Speaking"}</p>
                  </div>
                  <Link
                    to="/blog"
                    className="btn-primary py-2.5 px-6 text-xs font-bold"
                  >
                    Explore More Articles →
                  </Link>
                </div>

              </article>
            </Reveal>
          )}

        </div>
      </div>
      <Footer />
    </main>
  );
}
