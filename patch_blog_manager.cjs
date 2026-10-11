const fs = require('fs');

let file = fs.readFileSync('src/components/admin/BlogManager.tsx', 'utf8');

// Add file state
if (!file.includes('const [imageFile, setImageFile]')) {
    file = file.replace(
        'const [saving, setSaving] = useState(false);',
        'const [saving, setSaving] = useState(false);\n  const [imageFile, setImageFile] = useState<File | null>(null);\n  const [uploading, setUploading] = useState(false);'
    );
}

// Update form reset
file = file.replace(
    'setFormData({ title: "", slug: "", excerpt: "", image_url: "", body: "" });',
    'setFormData({ title: "", slug: "", excerpt: "", image_url: "", body: "" });\n        setImageFile(null);'
);

// Replace handleSubmit
const oldSubmit = `  const handleSubmit = async (e: React.FormEvent) => {
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
  };`;

const newSubmit = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    let finalImageUrl = formData.image_url;
    
    // Upload image first if one was selected
    if (imageFile) {
      setUploading(true);
      try {
        const formDataUpload = new FormData();
        formDataUpload.append("image", imageFile);
        
        const uploadRes = await fetch(import.meta.env.BASE_URL + "blog-upload.php", {
          method: "POST",
          body: formDataUpload
        });
        
        const uploadJson = await uploadRes.json();
        if (uploadJson.ok) {
          finalImageUrl = uploadJson.url;
        } else {
          alert("Image upload failed: " + uploadJson.error);
          setSaving(false);
          setUploading(false);
          return;
        }
      } catch (err: any) {
        alert("Image upload error: " + err.message);
        setSaving(false);
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    
    try {
      const payload = { ...formData, image_url: finalImageUrl };
      const res = await fetch(import.meta.env.BASE_URL + "blog-api.php?action=create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.ok) {
        setIsFormOpen(false);
        setFormData({ title: "", slug: "", excerpt: "", image_url: "", body: "" });
        setImageFile(null);
        fetchPosts();
      } else {
        alert(json.error || "Failed to save post");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };`;

file = file.replace(oldSubmit, newSubmit);

const oldInput = `            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">Image URL (Optional)</label>
              <input
                name="image_url"
                value={formData.image_url}
                onChange={handleInput}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-glow"
              />
            </div>`;

const newInput = `            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">Featured Image</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-foreground-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                />
                {formData.image_url && !imageFile && (
                  <span className="text-xs text-brand truncate max-w-[200px]">{formData.image_url}</span>
                )}
              </div>
            </div>`;

file = file.replace(oldInput, newInput);
file = file.replace('{saving ? "Saving..." : "Publish Post"}', '{saving ? (uploading ? "Uploading Image..." : "Saving...") : "Publish Post"}');

fs.writeFileSync('src/components/admin/BlogManager.tsx', file);
