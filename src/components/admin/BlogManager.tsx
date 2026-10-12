import React, { useState, useEffect } from "react";
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle,
  FileText,
  Search,
  Upload,
  ArrowLeft,
  Save,
  Globe,
  Sparkles,
  Calendar,
  User,
  Tag,
  AlertCircle,
  X,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { RichTextEditor } from "./RichTextEditor";
import DOMPurify from "dompurify";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  image_url: string;
  author: string;
  category: string;
  tags: string;
  seo_title: string;
  seo_description: string;
  published_at: string;
  updated_at?: string;
  status: "draft" | "published";
}

export function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [counts, setCounts] = useState({ total: 0, published: 0, draft: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  // Editor View State
  const [isEditing, setIsEditing] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    image_url: "",
    author: "Socially Speaking",
    category: "General",
    tags: "",
    seo_title: "",
    seo_description: "",
    status: "published" as "draft" | "published",
    body: "",
  });

  // Preview Modal
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch((import.meta.env.BASE_URL || "/") + "blog-api.php?action=admin_list");
      const json = await res.json();
      if (json.ok) {
        setPosts(json.posts || []);
        if (json.counts) setCounts(json.counts);
      } else {
        setError(json.error || "Failed to load articles");
      }
    } catch (e: any) {
      setError(e.message || "Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenNew = () => {
    setEditingPostId(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      image_url: "",
      author: "Socially Speaking",
      category: "General",
      tags: "",
      seo_title: "",
      seo_description: "",
      status: "published",
      body: "",
    });
    setIsEditing(true);
  };

  const handleOpenEdit = async (post: BlogPost) => {
    try {
      setLoading(true);
      // Fetch full post to guarantee body is populated
      const res = await fetch((import.meta.env.BASE_URL || "/") + `blog-api.php?action=get&id=${post.id}&preview=1`);
      const json = await res.json();
      if (json.ok && json.post) {
        const p = json.post;
        setEditingPostId(p.id);
        setFormData({
          title: p.title || "",
          slug: p.slug || "",
          excerpt: p.excerpt || "",
          image_url: p.image_url || "",
          author: p.author || "Socially Speaking",
          category: p.category || "General",
          tags: p.tags || "",
          seo_title: p.seo_title || "",
          seo_description: p.seo_description || "",
          status: p.status || "published",
          body: p.body || "",
        });
        setIsEditing(true);
      } else {
        alert("Could not load post content: " + (json.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error loading post: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => {
      const updated = { ...prev, title: val };
      // Auto-update slug if it was unmodified or matched old slug
      if (!editingPostId || !prev.slug) {
        updated.slug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      }
      return updated;
    });
  };

  // Upload Featured Image
  const handleFeaturedImageUpload = async (file: File) => {
    setUploadingFeatured(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("folder", "featured");

      const res = await fetch((import.meta.env.BASE_URL || "/") + "blog-upload.php", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (data.ok && data.url) {
        setFormData((prev) => ({ ...prev, image_url: data.url }));
      } else {
        alert(data.error || "Featured image upload failed");
      }
    } catch (e: any) {
      alert("Upload error: " + e.message);
    } finally {
      setUploadingFeatured(false);
    }
  };

  // Save Article (Draft or Published)
  const handleSave = async (overrideStatus?: "draft" | "published") => {
    if (!formData.title.trim()) {
      alert("Please provide an article title.");
      return;
    }

    const targetStatus = overrideStatus || formData.status;
    setSaving(true);
    try {
      const payload = {
        ...formData,
        id: editingPostId,
        status: targetStatus,
      };

      const action = editingPostId ? "update" : "create";
      const res = await fetch((import.meta.env.BASE_URL || "/") + `blog-api.php?action=${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.ok) {
        setIsEditing(false);
        fetchPosts();
      } else {
        alert(data.error || "Failed to save article");
      }
    } catch (e: any) {
      alert("Save error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (post: BlogPost) => {
    const nextStatus = post.status === "published" ? "draft" : "published";
    try {
      const res = await fetch((import.meta.env.BASE_URL || "/") + "blog-api.php?action=toggle_status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, status: nextStatus }),
      });
      const data = await res.json();
      if (data.ok) {
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, status: nextStatus } : p))
        );
        setCounts((prev) => ({
          ...prev,
          published: nextStatus === "published" ? prev.published + 1 : prev.published - 1,
          draft: nextStatus === "draft" ? prev.draft + 1 : prev.draft - 1,
        }));
      }
    } catch (e: any) {
      alert("Status toggle error: " + e.message);
    }
  };

  // Delete Article
  const handleDelete = async (post: BlogPost) => {
    if (!window.confirm(`Are you sure you want to delete "${post.title}"? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch((import.meta.env.BASE_URL || "/") + `blog-api.php?action=delete&id=${post.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.ok) {
        fetchPosts();
      } else {
        alert(data.error || "Failed to delete post");
      }
    } catch (e: any) {
      alert("Delete error: " + e.message);
    }
  };

  // Filtered posts
  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.excerpt && p.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.author && p.author.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* ── VIEW 1: EDITOR MODE ──────────────────────────────────────────────── */}
      {isEditing ? (
        <div className="space-y-6">
          {/* Top Editor Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Leave article editor? Any unsaved changes will be lost.")) {
                    setIsEditing(false);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-foreground-muted hover:bg-white/10 hover:text-white transition-colors"
              >
                <ArrowLeft size={14} /> Back to Articles
              </button>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                  formData.status === "published"
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                }`}
              >
                {formData.status === "published" ? "Status: Published" : "Status: Draft"}
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Preview Button */}
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <Eye size={14} className="text-blue-glow" /> Preview Layout
              </button>

              {/* Save Draft Button */}
              <button
                type="button"
                onClick={() => handleSave("draft")}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-bold text-yellow-400 hover:bg-yellow-500/20 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Draft
              </button>

              {/* Publish Button */}
              <button
                type="button"
                onClick={() => handleSave("published")}
                disabled={saving}
                className="btn-primary inline-flex items-center gap-1.5 py-2 px-5 text-xs font-bold shadow-lg shadow-brand/20 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                Publish Article
              </button>
            </div>
          </div>

          {/* Form Layout: Main Column + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column (8 cols): Title, Excerpt, Content */}
            <div className="lg:col-span-8 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                  Article Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter a compelling article title..."
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-lg font-bold text-white placeholder-white/30 focus:border-purple-glow focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                  URL Slug
                </label>
                <div className="flex items-center rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-foreground-subtle">
                  <span>thetakeovernetwork.org/blog/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    className="flex-1 bg-transparent px-1 font-mono text-xs text-purple-glow focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                  Short Excerpt / Lead Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief synopsis shown on cards and social shares (1-2 sentences)..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-purple-glow focus:outline-none"
                />
              </div>

              {/* Rich Text Editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted">
                    Article Body &amp; Media <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[11px] text-foreground-subtle">
                    Click &ldquo;Insert Image&rdquo; inside the toolbar to embed photos anywhere in the story.
                  </span>
                </div>
                <RichTextEditor
                  content={formData.body}
                  onChange={(html) => setFormData((prev) => ({ ...prev, body: html }))}
                />
              </div>
            </div>

            {/* Right Column (4 cols): Meta Settings */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Featured Image Card */}
              <div className="rounded-2xl border border-white/10 bg-[#0e101a] p-5 shadow-lg">
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-2">
                  Featured Header Image
                </label>
                {formData.image_url ? (
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/15 bg-black/60 group">
                    <img
                      src={formData.image_url}
                      alt="Featured thumbnail"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, image_url: "" }))}
                        className="rounded-lg bg-red-600/80 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-white/[0.02] p-6 text-center hover:bg-white/[0.05] hover:border-brand/50 cursor-pointer transition-colors">
                    <Upload size={24} className="text-purple-glow mb-1.5" />
                    <span className="text-xs font-semibold text-white">Upload Featured Image</span>
                    <span className="text-[10px] text-foreground-subtle mt-0.5">JPG, PNG, WebP up to 10MB</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFeaturedImageUpload(file);
                      }}
                    />
                  </label>
                )}
                {uploadingFeatured && (
                  <div className="flex items-center gap-2 text-xs text-purple-glow mt-2">
                    <Loader2 size={13} className="animate-spin" /> Uploading featured banner...
                  </div>
                )}
              </div>

              {/* Author & Category */}
              <div className="rounded-2xl border border-white/10 bg-[#0e101a] p-5 space-y-4 shadow-lg">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                    Author
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-purple-glow focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-purple-glow focus:outline-none"
                  >
                    <option value="General">General</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Conferences">Conferences</option>
                    <option value="Youth Empowerment">Youth Empowerment</option>
                    <option value="Stories">Stories &amp; Testimonies</option>
                    <option value="Faith &amp; Purpose">Faith &amp; Purpose</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    placeholder="SSC2026, Leadership, Campus"
                    value={formData.tags}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-purple-glow focus:outline-none"
                  />
                </div>
              </div>

              {/* SEO Meta */}
              <div className="rounded-2xl border border-white/10 bg-[#0e101a] p-5 space-y-3.5 shadow-lg">
                <div className="text-xs font-bold uppercase tracking-wider text-purple-glow flex items-center gap-1.5">
                  <Sparkles size={13} /> Search &amp; Social Meta
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-foreground-muted mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    placeholder="Defaults to article title"
                    value={formData.seo_title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, seo_title: e.target.value }))}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-purple-glow focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-foreground-muted mb-1">
                    Meta Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Defaults to excerpt"
                    value={formData.seo_description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, seo_description: e.target.value }))}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-purple-glow focus:outline-none"
                  />
                </div>
              </div>

            </div>

          </div>
        </div>
      ) : (
        /* ── VIEW 2: ARTICLE LIST MODE ────────────────────────────────────────── */
        <div className="space-y-6">
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-strong rounded-2xl border border-white/5 p-5">
              <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Total Articles</p>
              <h4 className="text-3xl font-black font-display text-white mt-1">{counts.total}</h4>
              <p className="text-[11px] text-foreground-subtle mt-0.5">Published &amp; drafts in CMS</p>
            </div>
            <div className="glass-strong rounded-2xl border border-white/5 p-5">
              <p className="text-xs font-semibold text-green-400 uppercase tracking-wider">Live &amp; Published</p>
              <h4 className="text-3xl font-black font-display text-green-400 mt-1">{counts.published}</h4>
              <p className="text-[11px] text-foreground-subtle mt-0.5">Visible on public blog</p>
            </div>
            <div className="glass-strong rounded-2xl border border-white/5 p-5">
              <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Draft Articles</p>
              <h4 className="text-3xl font-black font-display text-yellow-400 mt-1">{counts.draft}</h4>
              <p className="text-[11px] text-foreground-subtle mt-0.5">Unpublished in review</p>
            </div>
          </div>

          {/* Search, Filter & New Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-subtle" />
                <input
                  type="text"
                  placeholder="Search articles by title or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2 text-sm text-white focus:border-purple-glow focus:outline-none"
                />
              </div>

              {/* Status Switcher */}
              <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    statusFilter === "all" ? "bg-white/15 text-white" : "text-foreground-muted hover:text-white"
                  }`}
                >
                  All ({counts.total})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("published")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    statusFilter === "published" ? "bg-green-500/20 text-green-400" : "text-foreground-muted hover:text-white"
                  }`}
                >
                  Published ({counts.published})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("draft")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    statusFilter === "draft" ? "bg-yellow-500/20 text-yellow-400" : "text-foreground-muted hover:text-white"
                  }`}
                >
                  Drafts ({counts.draft})
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenNew}
              className="btn-primary inline-flex items-center gap-2 py-2 px-5 text-sm font-bold shrink-0 justify-center"
            >
              <Plus size={16} /> New Article
            </button>
          </div>

          {/* Articles Roster */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-purple-glow w-8 h-8" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
              {error}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 py-16 px-4 text-center">
              <FileText size={36} className="mx-auto text-foreground-subtle mb-3" />
              <p className="text-base font-semibold text-white">No articles match your criteria.</p>
              <p className="text-xs text-foreground-subtle mt-1">Get started by creating your first article above.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-white/10 bg-[#0e101a] p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between hover:border-white/20 transition-all duration-300 shadow-lg"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="h-20 w-28 rounded-xl object-cover bg-black/40 border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="h-20 w-28 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs text-foreground-subtle shrink-0">
                        No Banner
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                            post.status === "published"
                              ? "bg-green-500/15 text-green-400 border-green-500/30"
                              : "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                          }`}
                        >
                          {post.status}
                        </span>
                        <span className="text-[11px] font-semibold text-purple-glow">
                          {post.category || "General"}
                        </span>
                        <span className="text-white/20">·</span>
                        <span className="text-[11px] text-foreground-subtle">
                          {new Date(post.published_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <h4 className="font-display font-bold text-lg text-white truncate">{post.title}</h4>
                      <p className="text-xs text-foreground-muted line-clamp-1 mt-0.5">{post.excerpt || "No excerpt provided."}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    {/* Toggle Status */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(post)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        post.status === "published"
                          ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                          : "border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                      }`}
                      title={post.status === "published" ? "Unpublish to draft" : "Publish article"}
                    >
                      {post.status === "published" ? "Unpublish" : "Publish"}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(post)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15 transition-colors"
                      title="Edit article"
                    >
                      <Edit2 size={13} /> Edit
                    </button>

                    {/* Public View */}
                    {post.status === "published" && (
                      <Link
                        to={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-2 rounded-lg border border-white/10 bg-white/5 text-foreground-muted hover:text-white hover:bg-white/10 transition-colors"
                        title="View live article"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    )}

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(post)}
                      className="p-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Delete article"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ── LIVE PREVIEW MODAL ────────────────────────────────────────────────── */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-background p-6 sm:p-10 shadow-2xl">
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              title="Close Preview"
            >
              <X size={18} />
            </button>

            <div className="chip mb-4">Preview Mode</div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white mb-4 leading-tight">
              {formData.title || "Untitled Article"}
            </h1>

            <div className="flex items-center gap-4 text-xs text-foreground-subtle border-b border-white/10 pb-6 mb-8">
              <span>Author: <strong className="text-white">{formData.author}</strong></span>
              <span>Category: <strong className="text-purple-glow">{formData.category}</strong></span>
              <span>Date: <strong className="text-white">Today</strong></span>
            </div>

            {formData.image_url && (
              <div className="aspect-[21/9] w-full rounded-2xl overflow-hidden border border-white/10 mb-8 bg-black">
                <img src={formData.image_url} alt="Featured" className="w-full h-full object-cover" />
              </div>
            )}

            {formData.excerpt && (
              <p className="text-lg font-medium text-purple-glow/90 italic mb-8 border-l-2 border-purple-glow pl-4 leading-relaxed">
                {formData.excerpt}
              </p>
            )}

            {/* Sanitized Body */}
            <div
              className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:text-white prose-p:text-foreground-muted prose-a:text-blue-glow"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(formData.body || "<p><em>No content written yet.</em></p>"),
              }}
            />

            <div className="mt-12 pt-6 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setPreviewOpen(false)}
                className="btn-primary py-2 px-6 text-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
