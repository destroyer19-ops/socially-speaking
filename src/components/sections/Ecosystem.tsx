import { motion } from "framer-motion";
import { useState } from "react";
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

const nodes = [
  { id: "conf", label: "Conference", emoji: "🎤", angle: -90, href: "#conference", color: "#6a189a" },
  { id: "tribe", label: "The Tribe", emoji: "🤝", angle: 0, href: "#tribe", color: "#1f7bb6" },
  { id: "campus", label: "Campus Chapters", emoji: "🎓", angle: 90, href: "#campus", color: "#56a0ff" },
  { id: "outreach", label: "Outreach", emoji: "❤️", angle: 180, href: "#outreach", color: "#f22f22" },
];

export function Ecosystem() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section id="ecosystem" className="relative bg-ink-deep overflow-hidden">
      {/* Top image marquee — image-based transition into the section */}
      <div className="pt-6">
        <ImageMarquee
          images={[crowdImg, panelImg, campusImg, outreachImg, tribeImg, speakerImg, campusCandidImg, foodDriveImg]}
          height="h-[180px] sm:h-[220px]"
          speed="marquee-slow"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
        <Reveal className="text-center max-w-2xl mx-auto">
          <SectionLabel>The Ecosystem</SectionLabel>
          <h2 className="mt-5 font-display font-black text-4xl sm:text-5xl lg:text-6xl">
            The Socially Speaking{" "}
            <span className="text-gradient">Ecosystem</span>
          </h2>
          <p className="mt-5 text-foreground-muted">
            One movement. Four pillars. Click any node to explore.
          </p>
        </Reveal>

        <div className="relative mt-16 mx-auto aspect-square w-full max-w-[640px]">
          <div className="absolute inset-[8%] rounded-full border border-white/5" />
          <div className="absolute inset-[2%] rounded-full border border-white/5" />
          <motion.div
            className="absolute inset-[2%] rounded-full border border-blue-glow/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            style={{
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

          {nodes.map((n) => {
            const rad = (n.angle * Math.PI) / 180;
            const radius = 44;
            const x = 50 + radius * Math.cos(rad);
            const y = 50 + radius * Math.sin(rad);
            const isActive = active === n.id;
            return (
              <motion.a
                key={n.id}
                href={n.href}
                onMouseEnter={() => setActive(n.id)}
                onMouseLeave={() => setActive(null)}
                whileHover={{ scale: 1.1 }}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * nodes.indexOf(n) }}
                style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                className="absolute group"
              >
                <div
                  className="grid h-24 w-24 sm:h-28 sm:w-28 place-items-center rounded-full glass-strong text-center"
                  style={{
                    boxShadow: isActive ? `0 0 0 1px ${n.color}, 0 0 50px -10px ${n.color}` : undefined,
                  }}
                >
                  <div>
                    <div className="text-2xl">{n.emoji}</div>
                    <div className="mt-1 text-[10px] sm:text-[11px] font-semibold leading-tight px-1">
                      {n.label}
                    </div>
                  </div>
                </div>
              </motion.a>
            );
          })}

          <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100">
            {nodes.map((n) => {
              const rad = (n.angle * Math.PI) / 180;
              const x = 50 + 44 * Math.cos(rad);
              const y = 50 + 44 * Math.sin(rad);
              return (
                <line key={n.id} x1="50" y1="50" x2={x} y2={y} stroke="url(#g)" strokeWidth="0.15" strokeDasharray="0.5 0.5" opacity="0.5" />
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
      <SectionDivider to="ink-warm" variant="slope" />
    </section>
  );
}
