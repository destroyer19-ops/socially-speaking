import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { SectionDivider } from "@/components/SectionDivider";
import crowdImg from "@/assets/crowd-cheering.jpg";

const stats = [
  { value: 1000, suffix: "+", label: "Young People Reached" },
  { value: 500, suffix: "+", label: "Community Members" },
  { value: 9, suffix: "", label: "Orphanages Reached" },
  { value: 340, suffix: "+", label: "Children Impacted" },
  { value: 400, suffix: "+", label: "Girls Empowered" },
  { value: 4, suffix: "+", label: "Universities" },
  { value: 10, suffix: "+", label: "Events & Webinars" },
];

function Counter({ value, suffix, active }: { value: number; suffix: string; active: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const duration = 1800;
    let raf = 0;
    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.floor(value * eased));
      if (p < 1) raf = requestAnimationFrame(step);
      else setN(value);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, value]);
  return (
    <span className="text-gradient">
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

export function Impact() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="impact" className="relative bg-ink-deep overflow-hidden" ref={ref}>
      {/* Image background with deep overlay */}
      <img src={crowdImg} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-deep via-ink-deep/85 to-ink-deep" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-24 sm:py-32">
        <Reveal className="text-center max-w-2xl mx-auto">
          <SectionLabel>Impact Dashboard</SectionLabel>
          <h2 className="mt-5 font-display font-black text-4xl sm:text-5xl lg:text-6xl">
            Numbers that <span className="text-gradient">tell the story</span>.
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`glass-strong rounded-3xl p-7 sm:p-8 hover-lift relative overflow-hidden ${
                i === 6 ? "sm:col-span-3 lg:col-span-1 lg:col-start-4" : ""
              }`}
            >
              <div className="font-display font-black text-5xl sm:text-6xl tracking-tight">
                <Counter value={s.value} suffix={s.suffix} active={inView} />
              </div>
              <div className="mt-3 text-sm sm:text-base text-foreground-muted">{s.label}</div>
              <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-purple/20 to-blue/20 blur-2xl" />
            </div>
          ))}
        </div>
      </div>
      <SectionDivider to="paper" variant="curve" />
    </section>
  );
}
