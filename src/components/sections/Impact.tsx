import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { SectionDivider } from "@/components/SectionDivider";
import { Users, Heart, Building2, Baby, Sparkles, GraduationCap, CalendarDays } from "lucide-react";
import crowdImg from "@/assets/crowd-cheering.jpg";
import tribeImg from "@/assets/tribe.jpg";
import outreachImg from "@/assets/outreach.jpg";

const stats = [
  { value: 1000, suffix: "+", label: "Young People Reached", icon: Users, color: "#9d4edd", featured: true },
  { value: 500, suffix: "+", label: "Community Members", icon: Heart, color: "#f22f22" },
  { value: 9, suffix: "", label: "Orphanages Reached", icon: Building2, color: "#56a0ff" },
  { value: 340, suffix: "+", label: "Children Impacted", icon: Baby, color: "#ffb703" },
  { value: 400, suffix: "+", label: "Girls Empowered", icon: Sparkles, color: "#f2549a" },
  { value: 4, suffix: "+", label: "Universities", icon: GraduationCap, color: "#1f7bb6" },
  { value: 10, suffix: "+", label: "Events & Webinars", icon: CalendarDays, color: "#6a189a" },
];

function Counter({ value, suffix, active }) {
  const [n, setN] = useState(0);
  useEffect(function () {
    if (!active) return;
    let start = null;
    const duration = 1800;
    let raf = 0;
    function step(t) {
      if (start === null) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.floor(value * eased));
      if (p < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setN(value);
      }
    }
    raf = requestAnimationFrame(step);
    return function () {
      cancelAnimationFrame(raf);
    };
  }, [active, value]);
  return (
    <span className="text-gradient">
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

export function Impact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const featured = stats.find(function (s) { return s.featured; });
  const rest = stats.filter(function (s) { return !s.featured; });

  return (
    <section id="impact" className="relative bg-ink-deep overflow-hidden" ref={ref}>
      {/* Image background with deep overlay */}
      <img src={crowdImg} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-deep via-ink-deep/85 to-ink-deep" />

      {/* Ambient color, so it doesn't read as flat dark */}
      <div aria-hidden className="pointer-events-none absolute -top-32 left-[10%] h-[420px] w-[420px] rounded-full bg-purple/20 blur-[130px]" />
      <div aria-hidden className="pointer-events-none absolute bottom-[-15%] right-[5%] h-[400px] w-[400px] rounded-full bg-blue-glow/20 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-24 sm:py-32">
        <Reveal className="text-center max-w-2xl mx-auto">
          <div className="chip-dark mx-auto">Impact Dashboard</div>
          <h2 className="mt-5 font-display font-black text-4xl sm:text-5xl lg:text-6xl">
            Numbers that <span className="text-gradient">tell the story</span>.
          </h2>
        </Reveal>

        {/* grid-flow-dense backfills gaps left by the spanning cards instead of
            leaving empty cells and pushing later items unpredictably */}
        <StaggerGroup className="mt-16 grid grid-cols-2 lg:grid-cols-4 grid-flow-dense gap-4">
          {/* Featured stat — photo background */}
          {featured && (
            <StaggerItem className="col-span-2 lg:row-span-2">
              {(function () {
                const Icon = featured.icon;
                return (
                  <div className="group relative h-full overflow-hidden rounded-3xl hover-lift flex flex-col justify-between min-h-[220px] lg:min-h-[420px] p-8 sm:p-10">
                    <img
                      src={tribeImg}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/70 to-ink-deep/20" />
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-40 mix-blend-multiply"
                      style={{ background: `linear-gradient(135deg, ${featured.color}, transparent 65%)` }}
                    />

                    <span
                      className="relative grid h-14 w-14 place-items-center rounded-2xl backdrop-blur-sm"
                      style={{ backgroundColor: featured.color + "33" }}
                    >
                      <Icon size={26} className="text-white" />
                    </span>
                    <div className="relative">
                      <div className="font-display font-black text-6xl sm:text-7xl lg:text-8xl tracking-tight text-white">
                        <Counter value={featured.value} suffix={featured.suffix} active={inView} />
                      </div>
                      <div className="mt-3 text-base sm:text-lg text-white/70">{featured.label}</div>
                    </div>
                  </div>
                );
              })()}
            </StaggerItem>
          )}

          {/* Second photo tile */}
          <StaggerItem className="col-span-2 sm:col-span-1">
            <div className="group relative h-full min-h-[160px] overflow-hidden rounded-3xl hover-lift">
              <img
                src={outreachImg}
                alt="Outreach beneficiaries"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/90 via-ink-deep/20 to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-5">
                <div className="text-[10px] tracking-[0.3em] uppercase text-white/60">On the ground</div>
                <div className="mt-1 font-display font-bold text-white text-lg leading-tight">
                  Outreach in action
                </div>
              </div>
            </div>
          </StaggerItem>

          {/* Remaining 6 stat cards — should now all render, backfilled into place */}
          {rest.map(function (s) {
            const Icon = s.icon;
            return (
              <StaggerItem key={s.label}>
                <div className="group relative h-full overflow-hidden rounded-3xl glass-strong p-6 sm:p-7 hover-lift">
                  <div
                    aria-hidden
                    className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full blur-2xl opacity-25 transition-opacity duration-500 group-hover:opacity-45"
                    style={{ background: `radial-gradient(circle, ${s.color}, transparent 70%)` }}
                  />
                  <span
                    className="relative grid h-11 w-11 place-items-center rounded-2xl"
                    style={{ backgroundColor: s.color + "26" }}
                  >
                    <Icon size={19} style={{ color: s.color }} />
                  </span>
                  <div className="relative mt-4 font-display font-black text-4xl sm:text-5xl tracking-tight">
                    <Counter value={s.value} suffix={s.suffix} active={inView} />
                  </div>
                  <div className="relative mt-2 text-sm sm:text-base text-foreground-muted">{s.label}</div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
      {/* <SectionDivider to="paper" variant="curve" /> */}
    </section>
  );
}