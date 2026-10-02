import React, { useState, useEffect } from "react";
import { Loader2, Plus, Edit2, Trash2, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function BlogManager() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    image_url: "",
    body: ""
  });
  const [saving, setSaving] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(import.meta.env.BASE_URL + "blog-api.php?action=list");
      const json = await res.json();
      if (json.ok) {
        setPosts(json.posts);
      } else {
        setError(json.error || "Failed to load posts");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "title" && !prev.slug) {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(import.meta.env.BASE_URL + "blog-api.php?action=create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.ok) {
        setIsFormOpen(false);
        setFormData({ title: "", slug: "", excerpt: "", image_url: "", body: "" });
        fetchPosts();
      } else {
        alert(json.error || "Failed to save post");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(import.meta.env.BASE_URL + `blog-api.php?action=delete&id=${id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.ok) {
        fetchPosts();
      } else {
        alert(json.error || "Failed to delete post");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Blog Posts</h3>
        <button
          onClick={() => setIsFormOpen(true)}
          className="btn-primary inline-flex items-center gap-2 py-2 px-4 text-sm"
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      {isFormOpen && (
        <div className="glass-strong rounded-2xl border border-white/10 p-6 relative">
          <button 
            onClick={() => setIsFormOpen(false)}
            className="absolute top-4 right-4 text-foreground-subtle hover:text-white"
          >
            ✕
          </button>
          <h4 className="text-lg font-bold text-white mb-6">Create New Post</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">Title</label>
              <input
                required
                name="title"
                value={formData.title}
                onChange={handleInput}
                className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-glow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">Slug (URL)</label>
              <input
                required
                name="slug"
                value={formData.slug}
                onChange={handleInput}
                className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-glow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">Image URL (Optional)</label>
              <input
                name="image_url"
                value={formData.image_url}
                onChange={handleInput}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-glow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">Excerpt</label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInput}
                rows={2}
                className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-glow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">Body (HTML allowed)</label>
              <textarea
                required
                name="body"
                value={formData.body}
                onChange={handleInput}
                rows={8}
                className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-glow font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full justify-center disabled:opacity-50"
            >
              {saving ? "Saving..." : "Publish Post"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-purple-glow w-8 h-8" />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center">
          {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
          <p className="text-foreground-muted">No blog posts found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              {post.image_url ? (
                <img src={post.image_url} className="w-24 h-24 object-cover rounded-lg bg-black/50 shrink-0" />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-black/50 flex items-center justify-center text-xs text-foreground-subtle shrink-0">No Image</div>
              )}
              <div className="flex-1">
                <h4 className="text-lg font-bold text-white mb-1">{post.title}</h4>
                <p className="text-sm text-foreground-muted mb-2 line-clamp-2">{post.excerpt}</p>
                <div className="text-xs text-foreground-subtle flex items-center gap-4">
                  <span>{new Date(post.published_at).toLocaleString()}</span>
                  <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">{post.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <Link to={`/blog/${post.slug}`} target="_blank" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-foreground-muted hover:text-white transition-colors" title="View">
                  <ExternalLink size={16} />
                </Link>
                <button onClick={() => handleDelete(post.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
