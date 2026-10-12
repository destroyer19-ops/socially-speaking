import React, { useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Undo,
  Redo,
  Upload,
  Loader2,
  X,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = "Start writing your article..." }: RichTextEditorProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: "rounded-2xl max-w-full mx-auto my-6 border border-white/10 shadow-lg object-cover",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-glow underline hover:text-purple-glow transition-colors",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-lg max-w-none min-h-[350px] p-6 focus:outline-none text-foreground leading-relaxed text-left",
      },
    },
  });

  // Keep editor content in sync when loaded from external state (e.g. edit mode)
  React.useEffect(() => {
    if (editor && content !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-white/10 bg-black/40">
        <Loader2 className="h-6 w-6 animate-spin text-purple-glow" />
      </div>
    );
  }

  // Handle URL Link insertion
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter destination URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const validUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href: validUrl }).run();
  };

  // Handle Image Upload
  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", "inline");

      const res = await fetch((import.meta.env.BASE_URL || "/") + "blog-upload.php", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      insertImageIntoEditor(data.url, imageAlt || file.name, imageCaption);
      closeImageModal();
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;
    insertImageIntoEditor(imageUrl, imageAlt, imageCaption);
    closeImageModal();
  };

  const insertImageIntoEditor = (url: string, alt: string, caption?: string) => {
    if (caption && caption.trim()) {
      // If caption is provided, insert as structured figure HTML
      const figureHtml = `
        <figure class="my-8 text-center">
          <img src="${url}" alt="${alt || caption}" class="rounded-2xl max-w-full mx-auto border border-white/10 shadow-lg object-cover" />
          <figcaption class="mt-2.5 text-xs text-foreground-subtle italic tracking-wide">${caption}</figcaption>
        </figure>
      `;
      editor.chain().focus().insertContent(figureHtml).run();
    } else {
      editor.chain().focus().setImage({ src: url, alt: alt || "Article illustration" }).run();
    }
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setImageUrl("");
    setImageAlt("");
    setImageCaption("");
    setUploadError("");
  };

  const wordCount = editor.storage.characterCount
    ? editor.storage.characterCount.words()
    : editor.getText().split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0f17] shadow-xl">
      {/* ── Fixed Toolbar ── */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 border-b border-white/10 bg-[#121522]/95 px-3 py-2.5 backdrop-blur-md">
        
        {/* Headings / Paragraph */}
        <div className="flex items-center gap-0.5 border-r border-white/10 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
              editor.isActive("paragraph") ? "bg-white/15 text-white" : "text-foreground-muted hover:text-white hover:bg-white/5"
            }`}
            title="Normal Paragraph"
          >
            <Pilcrow size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
              editor.isActive("heading", { level: 2 }) ? "bg-purple-glow/20 text-purple-glow" : "text-foreground-muted hover:text-white hover:bg-white/5"
            }`}
            title="Section Heading (H2)"
          >
            <Heading2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
              editor.isActive("heading", { level: 3 }) ? "bg-purple-glow/20 text-purple-glow" : "text-foreground-muted hover:text-white hover:bg-white/5"
            }`}
            title="Sub-heading (H3)"
          >
            <Heading3 size={16} />
          </button>
        </div>

        {/* Basic Styles */}
        <div className="flex items-center gap-0.5 border-r border-white/10 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("bold") ? "bg-white/15 text-white" : "text-foreground-muted hover:text-white hover:bg-white/5"
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("italic") ? "bg-white/15 text-white" : "text-foreground-muted hover:text-white hover:bg-white/5"
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("strike") ? "bg-white/15 text-white" : "text-foreground-muted hover:text-white hover:bg-white/5"
            }`}
            title="Strikethrough"
          >
            <Strikethrough size={15} />
          </button>
        </div>

        {/* Lists & Quote */}
        <div className="flex items-center gap-0.5 border-r border-white/10 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("bulletList") ? "bg-white/15 text-white" : "text-foreground-muted hover:text-white hover:bg-white/5"
            }`}
            title="Bullet List"
          >
            <List size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("orderedList") ? "bg-white/15 text-white" : "text-foreground-muted hover:text-white hover:bg-white/5"
            }`}
            title="Numbered List"
          >
            <ListOrdered size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("blockquote") ? "bg-purple-glow/20 text-purple-glow" : "text-foreground-muted hover:text-white hover:bg-white/5"
            }`}
            title="Blockquote"
          >
            <Quote size={15} />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 border-r border-white/10 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive({ textAlign: "left" }) ? "bg-white/15 text-white" : "text-foreground-muted hover:text-white hover:bg-white/5"
            }`}
            title="Align Left"
          >
            <AlignLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive({ textAlign: "center" }) ? "bg-white/15 text-white" : "text-foreground-muted hover:text-white hover:bg-white/5"
            }`}
            title="Align Center"
          >
            <AlignCenter size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive({ textAlign: "right" }) ? "bg-white/15 text-white" : "text-foreground-muted hover:text-white hover:bg-white/5"
            }`}
            title="Align Right"
          >
            <AlignRight size={15} />
          </button>
        </div>

        {/* Links & Divider */}
        <div className="flex items-center gap-0.5 border-r border-white/10 pr-1.5 mr-1">
          <button
            type="button"
            onClick={setLink}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("link") ? "bg-blue-glow/20 text-blue-glow" : "text-foreground-muted hover:text-white hover:bg-white/5"
            }`}
            title="Insert Link"
          >
            <LinkIcon size={15} />
          </button>
          {editor.isActive("link") && (
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="p-1.5 rounded-lg text-foreground-muted hover:text-red-400 hover:bg-white/5 transition-colors"
              title="Remove Link"
            >
              <Unlink size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded-lg text-foreground-muted hover:text-white hover:bg-white/5 transition-colors"
            title="Horizontal Divider"
          >
            <Minus size={15} />
          </button>
        </div>

        {/* ── Insert Embedded Image Button ── */}
        <div className="flex items-center gap-0.5 border-r border-white/10 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => setImageModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand/20 hover:bg-brand/30 border border-brand/40 text-xs font-semibold text-purple-glow transition-colors"
            title="Insert Image into Article"
          >
            <ImageIcon size={14} />
            <span>Insert Image</span>
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 ml-auto">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg text-foreground-muted hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={15} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg text-foreground-muted hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo size={15} />
          </button>
        </div>

      </div>

      {/* ── Editor Canvas ── */}
      <div className="relative min-h-[420px] bg-[#090b12]">
        <EditorContent editor={editor} />
      </div>

      {/* ── Word Count & Reading Time Footer ── */}
      <div className="flex items-center justify-between border-t border-white/5 bg-[#0e101a] px-4 py-2 text-xs text-foreground-subtle">
        <span className="italic">Type &ldquo;/&rdquo; or use the toolbar to format headers, lists, quotes, and images.</span>
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>~{readingTimeMinutes} min read</span>
        </div>
      </div>

      {/* ── Insert Image Modal ── */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-[#121524] p-6 shadow-2xl">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-foreground-subtle hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Insert Embedded Image</h3>

            {/* Tab switch */}
            <div className="flex rounded-lg border border-white/10 bg-white/5 p-1 mb-4">
              <button
                type="button"
                onClick={() => setImageTab("upload")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  imageTab === "upload" ? "bg-brand text-white" : "text-foreground-muted hover:text-white"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setImageTab("url")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  imageTab === "url" ? "bg-brand text-white" : "text-foreground-muted hover:text-white"
                }`}
              >
                Image URL
              </button>
            </div>

            {uploadError && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-400">
                {uploadError}
              </div>
            )}

            {imageTab === "upload" ? (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-white/[0.02] p-8 hover:bg-white/[0.05] hover:border-brand/50 cursor-pointer transition-colors"
                >
                  <Upload size={28} className="text-purple-glow mb-2" />
                  <p className="text-sm font-semibold text-white">Click to select image</p>
                  <p className="text-xs text-foreground-subtle mt-1">JPEG, PNG, or WebP up to 10MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1">Alt Text (Accessibility)</label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Short description of image"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-purple-glow focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1">Caption (Optional)</label>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="e.g. Photo taken during the 2024 Keynote"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-purple-glow focus:outline-none"
                  />
                </div>

                {uploading && (
                  <div className="flex items-center justify-center gap-2 text-sm text-purple-glow py-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Uploading and optimizing image...</span>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleUrlSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1">Image HTTPS URL</label>
                  <input
                    type="url"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-purple-glow focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1">Alt Text</label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Short description of image"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-purple-glow focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1">Caption (Optional)</label>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="Displayed under image"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-purple-glow focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeImageModal}
                    className="px-4 py-2 rounded-lg border border-white/10 text-xs font-semibold text-foreground-muted hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-light text-xs font-bold text-white transition-colors"
                  >
                    Insert Image
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
