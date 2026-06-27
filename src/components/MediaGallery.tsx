import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play } from "lucide-react";
import { sanityClient, urlFor } from "@/lib/sanity";

interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  category: string;
  title: string;
}

const DUMMY_MEDIA: MediaItem[] = [
  {
    id: "1",
    type: "image",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80",
    category: "Conferences",
    title: "Main Stage 2024",
  },
  {
    id: "2",
    type: "image",
    url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80",
    category: "Campus Chapters",
    title: "University Meetup",
  },
  {
    id: "3",
    type: "image",
    url: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80",
    category: "Outreach",
    title: "Community Service",
  },
  {
    id: "4",
    type: "video",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80",
    category: "Conferences",
    title: "Highlight Reel 2024",
  },
  {
    id: "5",
    type: "image",
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80",
    category: "The Exchange",
    title: "Workshop Session",
  },
];

const CATEGORIES = ["All", "Conferences", "Campus Chapters", "The Exchange", "Outreach", "Community Activities"];

export function MediaGallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMedia() {
      try {
        // Fetch media items from Sanity if connected
        const query = `*[_type == "mediaItem"] | order(publishedAt desc) {
          _id,
          title,
          type,
          category,
          image,
          videoUrl,
          thumbnail
        }`;
        const data = await sanityClient.fetch(query);
        
        if (data && data.length > 0) {
          const formattedData = data.map((item: any) => ({
            id: item._id,
            type: item.type,
            title: item.title,
            category: item.category,
            url: item.type === 'image' ? urlFor(item.image).url() : item.videoUrl,
            thumbnail: item.thumbnail ? urlFor(item.thumbnail).url() : undefined,
          }));
          setMediaItems(formattedData);
        } else {
          // Fallback to dummy data if empty
          setMediaItems(DUMMY_MEDIA);
        }
      } catch (error) {
        console.warn("Failed to fetch from Sanity. Falling back to placeholder data.", error);
        setMediaItems(DUMMY_MEDIA);
      } finally {
        setLoading(false);
      }
    }

    fetchMedia();
  }, []);

  const filteredMedia = mediaItems.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                activeCategory === cat
                  ? "bg-brand text-white"
                  : "bg-white/5 text-foreground-muted hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search media..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-foreground focus:outline-none focus:border-brand w-full md:w-64"
        />
      </div>

      {loading ? (
        <div className="w-full py-20 flex justify-center text-foreground-muted">Loading gallery...</div>
      ) : (
        <motion.div layout className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
          <AnimatePresence>
            {filteredMedia.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={item.id}
                className="relative group cursor-pointer break-inside-avoid rounded-xl overflow-hidden glass-panel"
                onClick={() => setSelectedMedia(item)}
              >
                <img
                  src={item.type === "video" ? item.thumbnail : item.url}
                  alt={item.title}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-brand/90 flex items-center justify-center text-white backdrop-blur-sm shadow-glow">
                      <Play className="w-5 h-5 ml-1" />
                    </div>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-white/70">{item.category}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Basic Lightbox */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedMedia(null)}
          >
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 p-2 rounded-full backdrop-blur-md"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedMedia.type === "image" ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.title}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg"
                />
              ) : (
                <video
                  src={selectedMedia.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
                />
              )}
              <div className="absolute bottom-[-40px] left-0 text-left">
                <h3 className="text-xl font-bold text-white">{selectedMedia.title}</h3>
                <p className="text-sm text-white/70">{selectedMedia.category}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
