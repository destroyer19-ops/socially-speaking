import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight, Mic, Users, GraduationCap, HeartHandshake } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
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
import logoImg from "@/assets/logo.PNG";

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

const NUDGE_PX = 280;
const AUTO_RESUME_MS = 3500;

export function Ecosystem() {
  const [isPaused, setIsPaused] = useState(false);
  const [offset, setOffset] = useState(0);
  const resumeTimer = useRef(undefined);

  function nudge(direction) {
    setIsPaused(true);
    setOffset(function (o) {
      return direction === "prev" ? o + NUDGE_PX : o - NUDGE_PX;
    });
    if (resumeTimer.current) {
      clearTimeout(resumeTimer.current);
    }
    resumeTimer.current = setTimeout(function () {
      setIsPaused(false);
      setOffset(0);
    }, AUTO_RESUME_MS);
  }

  useEffect(function () {
    return function () {
      if (resumeTimer.current) {
        clearTimeout(resumeTimer.current);
      }
    };
  }, []);

  return (
    <section id="ecosystem" className="relative bg-ink-deep overflow-hidden">
      {/* Top image marquee — unchanged */}
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

        <div className="pointer-events-none absolute inset-y-0 left-0 w-14 sm:w-20 bg-gradient-to-r from-ink-deep to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-14 sm:w-20 bg-gradient-to-l from-ink-deep to-transparent z-10" />

        <button
          type="button"
          onClick={function () { nudge("prev"); }}
          aria-label="Scroll images left"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full glass-strong text-white opacity-0 group-hover/marquee:opacity-100 focus-visible:opacity-100 transition-opacity hover:scale-105 active:scale-95"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={function () { nudge("next"); }}
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
          <p className="mt-5 text-foreground-muted">
            One movement. Four pillars, working together to build a generation of leaders.
          </p>
        </Reveal>

        {/* Hub badge, centered above the grid */}
        <Reveal delay={0.05} className="mt-14 flex justify-center">
          <a
            href="#who"
            className="grid h-28 w-28 sm:h-32 sm:w-32 place-items-center rounded-full bg-white/5 border border-white/10 text-center text-white shadow-glow pulse-glow transition-transform hover:scale-105 p-3 hover:border-brand/40"
          >
            <img
              src={logoImg}
              alt="Socially Speaking Logo"
              className="h-full w-full object-contain rounded-full"
            />
          </a>
        </Reveal>

        {/* Connector line from hub down to the card row */}
        <div className="mx-auto h-10 w-px bg-gradient-to-b from-white/30 to-white/5" aria-hidden />

        {/* Card grid — replaces the circular layout entirely */}
        <StaggerGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {nodes.map(function (n) {
            const Icon = n.icon;
            return (
              <StaggerItem key={n.id}>
                <a
                  href={n.href}
                  className="group relative flex h-full flex-col rounded-3xl glass-strong p-6 text-white transition-transform hover:-translate-y-1"
                >
                  <span
                    className="absolute left-1/2 -top-10 h-10 w-px -translate-x-1/2 bg-gradient-to-b from-transparent to-white/20"
                    aria-hidden
                  />
                  <div className="flex items-center justify-between">
                    <span
                      className="grid h-12 w-12 place-items-center rounded-2xl"
                      style={{ backgroundColor: n.color + "22" }}
                    >
                      <Icon size={22} style={{ color: n.color }} />
                    </span>
                    <ArrowUpRight
                      size={16}
                      className="text-white/40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
                      aria-hidden
                    />
                  </div>
                  <h3 className="mt-5 font-display font-black text-lg leading-tight">
                    {n.label}
                  </h3>
                  <p className="mt-2 text-sm text-white/60 leading-relaxed">
                    {n.description}
                  </p>
                </a>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div >
      {/* <SectionDivider to="ink-warm" variant="slope" /> */}
    </section >
  );
}