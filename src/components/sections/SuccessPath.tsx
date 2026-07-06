import { Reveal } from "@/components/Reveal";
import { Brain, Sprout, Rocket, Handshake, Heart, Sparkles } from "lucide-react";
import { SectionDivider } from "@/components/SectionDivider";
import crowdImg from "@/assets/volunteers-impact.jpg";
import thinkImg from "@/assets/think.jpg";
import campusImg from "@/assets/BCBBCE61-E624-469D-9174-3470F7702633.jpg";
import buildOthersImg from "@/assets/build-others.jpg";
import tribeImg from "@/assets/ssc10.JPG";
import outreachImg from "@/assets/borngreat.jpg";

const steps = [
  { label: "Think Better", icon: Brain, color: "#6a189a", image: thinkImg },
  { label: "Grow Better", icon: Sprout, color: "#1f7bb6", image: campusImg },
  { label: "Build Better", icon: Rocket, color: "#56a0ff", image: buildOthersImg },
  { label: "Connect Better", icon: Handshake, color: "#9d4edd", image: tribeImg },
  { label: "Serve Better", icon: Heart, color: "#f22f22", image: outreachImg },
  { label: "Impact", icon: Sparkles, color: "#ffb703", image: crowdImg },
];

const chainLines = [
  { before: "The better you think, the better you", word: "grow" },
  { before: "The better you grow, the better you", word: "build" },
  { before: "The better you build, the better you", word: "connect" },
  { before: "The better you connect, the better you", word: "serve" },
  { before: "The better you serve, the greater your", word: "impact" },
];

// Duplicated once for a seamless CSS-driven infinite loop.
const marqueeSteps = [...steps, ...steps];

export function SuccessPath() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#f6f3fb] to-[#06040f] text-on-paper">
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

      <div className="relative pt-24 sm:pt-32">
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

        {/* ── Cinematic chain quote ── */}
        <Reveal delay={0.15} className="mt-24 relative">
          <div className="relative bg-gradient-to-b from-[#06040f] via-[#0e0521] to-[#06040f] py-20 sm:py-28 overflow-hidden">
            {/* Ambient glow orbs */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full bg-purple/10 blur-[140px]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-10 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-glow/10 blur-[130px]"
            />

            <div className="relative mx-auto max-w-3xl px-6 sm:px-12">
              {/* Chain statements */}
              <div className="relative pl-8 sm:pl-12">
                {/* Vertical glow thread */}
                <div
                  aria-hidden
                  className="absolute left-0 top-2 bottom-2 w-px"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent, #9d4edd 15%, #56a0ff 85%, transparent)",
                  }}
                />

                {chainLines.map((line, i) => (
                  <div key={i} className="relative mb-10 sm:mb-12 last:mb-0">
                    {/* Pulse node on the thread */}
                    <span
                      aria-hidden
                      className="absolute -left-[calc(2rem+0.5px)] sm:-left-[calc(3rem+0.5px)] top-[0.6em] flex h-2.5 w-2.5 -translate-x-1/2 items-center justify-center rounded-full ring-4 ring-[#0e0521]"
                      style={{ background: "linear-gradient(135deg, #9d4edd, #56a0ff)" }}
                    />
                    <p
                      className="m-0 text-2xl sm:text-3xl md:text-4xl font-semibold leading-snug text-justify"
                      style={{ color: "rgba(255,255,255,0.72)" }}
                    >
                      {line.before}{" "}
                      <span
                        className="font-black"
                        style={{
                          background: "linear-gradient(90deg, #c77dff, #56a0ff)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {line.word}.
                      </span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="mt-16 sm:mt-20 flex items-center gap-5">
                <div
                  className="h-px flex-1"
                  style={{
                    background: "linear-gradient(to right, transparent, rgba(157,78,221,0.4))",
                  }}
                />
                <span
                  className="text-[10px] tracking-[0.35em] uppercase font-bold"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  impact
                </span>
                <div
                  className="h-px flex-1"
                  style={{
                    background: "linear-gradient(to left, transparent, rgba(86,160,255,0.4))",
                  }}
                />
              </div>

              {/* Conclusion */}
              <div className="mt-10 sm:mt-12 text-center">
                <p
                  className="m-0 font-display font-black leading-[1.05] text-white"
                  style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
                >
                  And impact is{" "}
                  <span
                    style={{
                      background: "linear-gradient(90deg, #c77dff 0%, #a78bfa 40%, #56a0ff 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    success
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>
        </Reveal>
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

      {/* <SectionDivider to="ink" variant="curve" /> */}
    </section>
  );
}
