import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import crowdImg from "@/assets/crowd-cheering.jpg";
import speakerImg from "@/assets/speaker.jpg";
import tribeImg from "@/assets/tribe.jpg";
import outreachImg from "@/assets/outreach.jpg";
import campusImg from "@/assets/campus.jpg";
import exchangeImg from "@/assets/exchange.jpg";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);
  const overlayOp = useTransform(scrollYProgress, [0, 1], [0.55, 0.85]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative min-h-[100svh] overflow-hidden bg-ink"
    >
      {/* Full-bleed video-like backdrop */}
      <motion.img
        src={crowdImg}
        alt="Socially Speaking conference crowd"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ y, scale }}
        width={1920}
        height={1280}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-ink-deep/40 via-ink-deep/55 to-ink-deep"
        style={{ opacity: overlayOp }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_120%,rgba(106,24,154,0.45),transparent)]" />

      {/* PLAY REEL badge */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.7 }}
        className="absolute top-28 sm:top-32 right-6 sm:right-10 z-20 inline-flex items-center gap-2.5 rounded-full glass-strong px-3.5 py-2 text-[11px] tracking-[0.25em] uppercase text-white"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-ink-deep">
          <Play size={12} fill="currentColor" />
        </span>
        Watch the reel
      </motion.button>

      {/* Live dot */}
      <motion.div
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
      </motion.div>

      {/* Copy — anchored bottom-left, editorial */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 min-h-[100svh] flex flex-col justify-end pb-16 sm:pb-24 pt-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2"
        >
          <span className="chip">
            <Sparkles size={12} /> A Movement, Not a Page
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
            className="max-w-xl text-base sm:text-lg text-foreground-muted leading-relaxed"
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
            {[tribeImg, campusImg, outreachImg, exchangeImg, speakerImg].map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                loading="lazy"
                className="h-9 w-9 rounded-full border-2 border-ink-deep object-cover"
              />
            ))}
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm">1,000+ young leaders</div>
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
    </section>
  );
}
