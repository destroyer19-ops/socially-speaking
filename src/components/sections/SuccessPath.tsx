import { Reveal } from "@/components/Reveal";
import { Brain, Sprout, Rocket, Handshake, Heart, Sparkles } from "lucide-react";
import { SectionDivider } from "@/components/SectionDivider";
import crowdImg from "@/assets/crowd-cheering.jpg";
import panelImg from "@/assets/panel-stage.jpg";
import campusImg from "@/assets/campus.jpg";
import campusCandidImg from "@/assets/campus-candid.jpg";
import tribeImg from "@/assets/tribe.jpg";
import outreachImg from "@/assets/outreach.jpg";

const steps = [
  { label: "Think Better", icon: Brain, color: "#6a189a", image: panelImg },
  { label: "Grow Better", icon: Sprout, color: "#1f7bb6", image: campusImg },
  { label: "Build Better", icon: Rocket, color: "#56a0ff", image: campusCandidImg },
  { label: "Connect Better", icon: Handshake, color: "#9d4edd", image: tribeImg },
  { label: "Serve Better", icon: Heart, color: "#f22f22", image: outreachImg },
  { label: "Impact", icon: Sparkles, color: "#ffb703", image: crowdImg },
];

const lines = [
  "The better you think, the better you grow.",
  "The better you grow, the better you build.",
  "The better you build, the better you connect.",
  "The better you connect, the better you serve.",
  "The better you serve, the greater your impact.",
];

// Duplicated once for a seamless CSS-driven infinite loop.
const marqueeSteps = [...steps, ...steps];

export function SuccessPath() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#f6f3fb] to-white text-on-paper">
      {/* Ambient blue/purple wash, consistent with the rest of the site */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-blue-glow/[0.14] via-transparent to-purple/[0.16]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-[6%] h-[460px] w-[460px] rounded-full bg-purple/20 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-20%] right-[-4%] h-[420px] w-[420px] rounded-full bg-blue-glow/20 blur-[130px]"
      />

      <div className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="max-w-2xl">
            <div className="chip-dark">The Success Path</div>
            <h2 className="mt-5 font-display font-black text-4xl sm:text-5xl lg:text-6xl text-ink-deep">
              A journey of <span className="text-gradient-dark">becoming</span>.
            </h2>
          </Reveal>
        </div>

        {/* Auto-scrolling marquee of photo step-cards */}
        <Reveal delay={0.1} className="relative mt-16 group/marquee">
          <div className="overflow-hidden">
            <div className="flex w-max gap-5 animate-success-marquee group-hover/marquee:[animation-play-state:paused] px-4 sm:px-6">
              {marqueeSteps.map(function (s, i) {
                const Icon = s.icon;
                const isLast = s.label === "Impact";
                return (
                  <div
                    key={s.label + "-" + i}
                    className="relative shrink-0 w-[230px] sm:w-[260px] h-[300px] sm:h-[330px] rounded-3xl overflow-hidden shadow-[var(--shadow-card-light)] ring-1 ring-black/5"
                  >
                    <img
                      src={s.image}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/90 via-ink-deep/30 to-ink-deep/10" />
                    <div
                      className="absolute inset-0 mix-blend-multiply opacity-40"
                      style={{ background: `linear-gradient(135deg, ${s.color}, transparent 65%)` }}
                    />

                    <div className="relative flex h-full flex-col justify-between p-5">
                      <div className="flex items-center justify-between">
                        <span
                          className="grid h-11 w-11 place-items-center rounded-2xl backdrop-blur-sm"
                          style={{ backgroundColor: s.color + "33" }}
                        >
                          <Icon size={20} className="text-white" />
                        </span>
                        {isLast && (
                          <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] tracking-[0.2em] uppercase text-white backdrop-blur-sm">
                            Final
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-[10px] tracking-[0.3em] uppercase text-white/60">
                          Step 0{(i % steps.length) + 1}
                        </div>
                        <div className="mt-1 font-display font-black text-2xl text-white leading-tight">
                          {s.label}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Edge fades so cards don't feel like they're cut off harshly */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-14 sm:w-24 bg-gradient-to-r from-[#f6f3fb] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-14 sm:w-24 bg-gradient-to-l from-[#f6f3fb] to-transparent" />
        </Reveal>

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="mt-20 max-w-3xl mx-auto text-center">
            <div className="space-y-2 text-lg sm:text-xl text-on-paper">
              {lines.map(function (l) {
                return <p key={l}>{l}</p>;
              })}
            </div>
            <p className="mt-8 font-display font-black text-3xl sm:text-4xl text-ink-deep">
              And impact is <span className="text-gradient-dark">success</span>.
            </p>
          </Reveal>
        </div>
      </div>

      <style>{`
        @keyframes success-marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-success-marquee {
          animation: success-marquee-scroll 32s linear infinite;
        }
      `}</style>

      <SectionDivider to="ink" variant="curve" />
    </section>
  );
}