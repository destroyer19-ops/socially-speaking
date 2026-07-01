import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { ArrowRight, Sparkles, Play, X } from "lucide-react";
import crowdImg from "@/assets/crowd-cheering.jpg";
import speakerImg from "@/assets/panel-stage.jpg";
import tribeImg from "@/assets/tribe.jpg";
import outreachImg from "@/assets/food-drive.jpg";
import campusImg from "@/assets/volunteers.jpg";
import exchangeImg from "@/assets/hero-conference.jpg";
import sscVid from "@/assets/videos/01.mp4";

// Rotating hero backdrop — swap, reorder, or trim this list freely.
const SLIDES = [
  { src: crowdImg, alt: "Socially Speaking conference crowd cheering" },
  { src: speakerImg, alt: "A speaker addressing the SSC audience" },
  { src: tribeImg, alt: "Members of The Tribe community" },
  { src: outreachImg, alt: "SSC community outreach in action" },
  { src: campusImg, alt: "A university campus chapter gathering" },
  { src: exchangeImg, alt: "An SSC exchange program moment" },
];
const SLIDE_DURATION_MS = 5500;

// Replace with the real reel — an .mp4 path or a YouTube/Vimeo embed URL.
const REEL_VIDEO_SRC = sscVid;

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);
  const overlayOp = useTransform(scrollYProgress, [0, 1], [0.8, 1]);

  const [slideIndex, setSlideIndex] = useState(0);
  const [isReelOpen, setIsReelOpen] = useState(false);

  // Auto-advance the backdrop slideshow, pausing while the lightbox is open.
  useEffect(() => {
    if (isReelOpen) return;
    const id = setInterval(() => {
      setSlideIndex((i) => (i + 1) % SLIDES.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, [isReelOpen]);

  const closeReel = useCallback(() => setIsReelOpen(false), []);

  // Lock scroll + support Escape while the lightbox is open.
  useEffect(() => {
    if (!isReelOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeReel();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isReelOpen, closeReel]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative min-h-[100svh] overflow-hidden bg-ink"
    >
      {/* Full-bleed rotating backdrop */}
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <AnimatePresence initial={false}>
          <motion.img
            key={slideIndex}
            src={SLIDES[slideIndex].src}
            alt={SLIDES[slideIndex].alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full object-cover"
            width={1920}
            height={1280}
          />
        </AnimatePresence>
      </motion.div>
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-black/75
    via-black/65
    to-black/90"
        style={{ opacity: overlayOp }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_120%,rgba(106,24,154,0.45),transparent)]" />

      {/* Slideshow progress dots */}
      <div className="absolute bottom-28 sm:bottom-32 left-6 sm:left-10 z-20 flex items-center gap-1.5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            onClick={() => setSlideIndex(i)}
            aria-label={`Show slide ${i + 1} of ${SLIDES.length}`}
            aria-current={i === slideIndex}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === slideIndex
              ? "w-6 bg-white"
              : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
          />
        ))}
      </div>

      {/* PLAY REEL badge — opens the video lightbox */}
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.7 }}
        onClick={() => setIsReelOpen(true)}
        className="absolute top-28 sm:top-32 right-6 sm:right-10 z-20 inline-flex items-center gap-2.5 rounded-full glass-strong px-3.5 py-2 text-[11px] tracking-[0.25em] uppercase text-white transition-transform hover:scale-105 active:scale-95"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-ink-deep">
          <Play size={12} fill="currentColor" />
        </span>
        Watch the reel
      </motion.button>

      {/* Live dot */}
      {/* <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute top-28 sm:top-32 left-6 sm:left-10 z-20 glass-strong rounded-full px-3 py-1.5 flex items-center gap-2 text-[11px] text-white"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inset-0 rounded-full bg-flame animate-ping opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-flame" />
        </span>
        SSC 2026 — Building Now
      </motion.div> */}

      {/* Copy — anchored bottom-left, editorial */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 min-h-[100svh] flex flex-col justify-end pb-16 sm:pb-24 pt-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2"
        >
          <span className="chip">
            Be the Standard!
            {/* A Movement, Not a Page */}
          </span>
        </motion.div>

        <h1 className="mt-6 font-display font-black text-[2.65rem] sm:text-6xl lg:text-[6.5rem] leading-[0.95] tracking-[-0.035em] max-w-5xl">
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05 }}
            className="block"
          >
            Building Africa's
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="block text-gradient"
          >
            Next Generation
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="block"
          >
            of Thinkers, Leaders
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="block"
          >
            and Changemakers.
          </motion.span>
        </h1>

        <div className="mt-8 grid sm:grid-cols-[1fr_auto] gap-8 items-end">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="max-w-xl text-justify [text-align-last:left] text-base sm:text-lg text-foreground-muted leading-relaxed"
          >
            Through conferences, university chapters, community programs, and
            social impact initiatives, we are raising young people who become
            the standard and the difference they want to see.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-wrap gap-3"
          >
            <a href="#join" className="btn-primary group">
              Join The Tribe
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </a>
            <a href="#campus" className="btn-ghost">
              Explore Campus Chapters
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-10 flex items-center gap-6 text-xs text-foreground-subtle"
        >
          <div className="flex -space-x-2">
            {[tribeImg, campusImg, outreachImg, exchangeImg, speakerImg].map(
              (src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  loading="lazy"
                  className="h-9 w-9 rounded-full border-2 border-ink-deep object-cover"
                />
              )
            )}
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm">
              1,000+ young leaders
            </div>
            <div>already building the standard.</div>
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-[10px] tracking-[0.3em] uppercase text-white/70"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-2"
        >
          Scroll
          <span className="h-8 w-px bg-gradient-to-b from-blue-glow to-transparent" />
        </motion.div>
      </motion.div>

      {/* Reel lightbox */}
      <AnimatePresence>
        {isReelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeReel}
            role="dialog"
            aria-modal="true"
            aria-label="Conference reel video"
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink-deep/90 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl aspect-video overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10"
            >
              <button
                type="button"
                onClick={closeReel}
                aria-label="Close video"
                className="absolute top-3 right-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
              >
                <X size={18} />
              </button>
              <video
                src={REEL_VIDEO_SRC}
                controls
                autoPlay
                playsInline
                className="h-full w-full bg-black"
              >
                Your browser doesn't support embedded video.
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}