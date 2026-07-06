import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight, Mic, Users, GraduationCap, HeartHandshake } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { SectionDivider } from "@/components/SectionDivider";
import { ImageMarquee } from "@/components/ImageMarquee";
import crowdImg from "@/assets/crowd-cheering.jpg";
import panelImg from "@/assets/panel-stage.jpg";
import campusImg from "@/assets/campus.jpg";
import campusCandidImg from "@/assets/campus-candid.jpg";
import tribeImg from "@/assets/tribe.jpg";
import outreachImg from "@/assets/outreach.jpg";
import speakerImg from "@/assets/speaker.jpg";
import foodDriveImg from "@/assets/food-drive.jpg";

// NOTE: swap these hrefs for your real routes if these paths don't match
// your router (e.g. Next.js pages, React Router routes, etc).
const nodes = [
  {
    id: "conf",
    label: "Conference",
    icon: Mic,
    href: "/conference",
    color: "#6a189a",
    description: "Two days of talks, workshops, and networking that recharge a generation.",
  },
  {
    id: "tribe",
    label: "The Tribe",
    icon: Users,
    href: "/tribe",
    color: "#1f7bb6",
    description: "A community of driven young people holding each other to a higher standard.",
  },
  {
    id: "campus",
    label: "Campus Chapters",
    icon: GraduationCap,
    href: "/campus-chapters",
    color: "#56a0ff",
    description: "University chapters bringing the movement to campuses across Africa.",
  },
  {
    id: "outreach",
    label: "Outreach",
    icon: HeartHandshake,
    href: "/outreach",
    color: "#f22f22",
    description: "Hands-on community projects that put purpose into practice.",
  },
];

const INNER_RING_INSET = 28; // % — smaller decorative ring, tucked around the hub
const OUTER_RING_INSET = 20; // % — larger decorative ring, still well clear of the nodes
const NODE_RADIUS = 44; // % from center — sized for clean node-to-node spacing, independent of the rings
const START_ANGLE = -90; // first node sits at 12 o'clock

// Evenly spaced around the circle regardless of how many nodes there are.
function angleForIndex(i: number, total: number) {
  return START_ANGLE + (360 / total) * i;
}

const NUDGE_PX = 280;
const AUTO_RESUME_MS = 3500;

export function Ecosystem() {
  const [active, setActive] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [offset, setOffset] = useState(0);
  const resumeTimer = useRef<ReturnType<typeof setTimeout>>();

  // Measure the diagram's actual box and force a true square from it —
  // this makes the circles' spacing immune to any parent flex/grid/
  // aspect-ratio quirks that were skewing it before.
  const diagramWrapRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState(640);

  useEffect(() => {
    const el = diagramWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const size = Math.min(width, height || width);
      if (size > 0) setStageSize(size);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const nudge = (direction: "prev" | "next") => {
    setIsPaused(true);
    setOffset((o) => (direction === "prev" ? o + NUDGE_PX : o - NUDGE_PX));
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      setIsPaused(false);
      setOffset(0);
    }, AUTO_RESUME_MS);
  };

  useEffect(() => {
    return () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  const activeNode = nodes.find((n) => n.id === active);

  return (
    <section id="ecosystem" className="relative bg-ink-deep overflow-hidden">
      {/* Top image marquee — image-based transition into the section */}
      <div className="relative pt-6 group/marquee">
        <motion.div
          animate={{ x: offset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={isPaused ? "[&_*]:![animation-play-state:paused]" : ""}
        >
          <ImageMarquee
            images={[crowdImg, panelImg, campusImg, outreachImg, tribeImg, speakerImg, campusCandidImg, foodDriveImg]}
            height="h-[180px] sm:h-[220px]"
            speed="marquee-slow"
          />
        </motion.div>

        {/* Edge fades so the arrows sit on a readable surface */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-14 sm:w-20 bg-gradient-to-r from-ink-deep to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-14 sm:w-20 bg-gradient-to-l from-ink-deep to-transparent z-10" />

        {/* Manual controls */}
        <button
          type="button"
          onClick={() => nudge("prev")}
          aria-label="Scroll images left"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full glass-strong text-white opacity-0 group-hover/marquee:opacity-100 focus-visible:opacity-100 transition-opacity hover:scale-105 active:scale-95"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => nudge("next")}
          aria-label="Scroll images right"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full glass-strong text-white opacity-0 group-hover/marquee:opacity-100 focus-visible:opacity-100 transition-opacity hover:scale-105 active:scale-95"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
        <Reveal className="text-center max-w-2xl mx-auto">
          <SectionLabel>The Ecosystem</SectionLabel>
          <h2 className="mt-5 font-display font-black text-4xl sm:text-5xl lg:text-6xl">
            The Socially Speaking{" "}
            <span className="text-gradient">Ecosystem</span>
          </h2>
          <p className="mt-5 text-foreground-muted min-h-[1.5em]">
            <AnimatePresence mode="wait">
              <motion.span
                key={activeNode?.id ?? "default"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="inline-block"
              >
                {activeNode
                  ? activeNode.description
                  : "One movement. Four pillars. Click any node to explore."}
              </motion.span>
            </AnimatePresence>
          </p>
        </Reveal>

        <div
          ref={diagramWrapRef}
          className="relative mt-16 mx-auto w-full max-w-[640px]"
          style={{ aspectRatio: "1 / 1" }}
        >
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: stageSize, height: stageSize }}
          >
            <div className="absolute rounded-full border border-white/5" style={{ inset: `${INNER_RING_INSET}%` }} />
            <div className="absolute rounded-full border border-white/5" style={{ inset: `${OUTER_RING_INSET}%` }} />
            <motion.div
              className="absolute rounded-full border border-blue-glow/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              style={{
                inset: `${OUTER_RING_INSET}%`,
                borderTopColor: "rgba(157,78,221,0.6)",
                borderRightColor: "rgba(86,160,255,0.6)",
              }}
            />

            <motion.a
              href="#who"
              whileHover={{ scale: 1.05 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid h-44 w-44 sm:h-52 sm:w-52 place-items-center rounded-full bg-brand text-center text-white shadow-glow pulse-glow"
            >
              <div>
                <div className="font-display font-black text-xl sm:text-2xl leading-tight">
                  SOCIALLY<br />SPEAKING
                </div>
                <div className="mt-1 text-[10px] tracking-[0.3em] text-white/70 uppercase">
                  The Movement
                </div>
              </div>
            </motion.a>

            {nodes.map((n, i) => {
              const rad = (angleForIndex(i, nodes.length) * Math.PI) / 180;
              const x = 50 + NODE_RADIUS * Math.cos(rad);
              const y = 50 + NODE_RADIUS * Math.sin(rad);
              const isActive = active === n.id;
              return (
                <motion.a
                  key={n.id}
                  href={n.href}
                  onMouseEnter={() => setActive(n.id)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(n.id)}
                  onBlur={() => setActive(null)}
                  whileHover={{ scale: 1.1 }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 * i }}
                  style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                  className="absolute group"
                >
                  <div
                    className="relative grid h-24 w-24 sm:h-28 sm:w-28 place-items-center rounded-full glass-strong text-center transition-shadow"
                    style={{
                      boxShadow: isActive ? `0 0 0 1px ${n.color}, 0 0 50px -10px ${n.color}` : undefined,
                    }}
                  >
                    <span
                      className="absolute top-1.5 right-1.5 grid h-5 w-5 place-items-center rounded-full bg-white/10 text-white opacity-0 scale-75 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100"
                      aria-hidden
                    >
                      <ArrowUpRight size={11} />
                    </span>
                    <div>
                      <n.icon size={22} className="mx-auto" style={{ color: n.color }} />
                      <div className="mt-1.5 text-[10px] sm:text-[11px] font-semibold leading-tight px-1">
                        {n.label}
                      </div>
                    </div>
                  </div>
                </motion.a>
              );
            })}

            <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100">
              {nodes.map((n, i) => {
                const rad = (angleForIndex(i, nodes.length) * Math.PI) / 180;
                const x = 50 + NODE_RADIUS * Math.cos(rad);
                const y = 50 + NODE_RADIUS * Math.sin(rad);
                return (
                  <motion.line
                    key={n.id}
                    x1="50"
                    y1="50"
                    x2={x}
                    y2={y}
                    stroke="url(#g)"
                    strokeWidth="0.15"
                    strokeDasharray="0.5 0.5"
                    opacity={active === n.id ? 0.9 : 0.5}
                    animate={{ strokeDashoffset: [0, -4] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  />
                );
              })}
              <defs>
                <linearGradient id="g" x1="0" x2="1">
                  <stop offset="0%" stopColor="#6a189a" />
                  <stop offset="100%" stopColor="#56a0ff" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Quick-jump row — same four destinations as clear, tappable links (great on mobile) */}
        <Reveal delay={0.15} className="mt-14 flex flex-wrap items-center justify-center gap-3">
          {nodes.map((n) => (
            <a
              key={n.id}
              href={n.href}
              className="group inline-flex items-center gap-2 rounded-full glass-strong px-4 py-2.5 text-sm text-white transition-colors hover:bg-white/10"
            >
              <n.icon size={15} style={{ color: n.color }} aria-hidden />
              {n.label}
              <ArrowUpRight
                size={14}
                className="text-white/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
              />
            </a>
          ))}
        </Reveal>
      </div>
      <SectionDivider to="ink-warm" variant="slope" />
    </section>
  );
}