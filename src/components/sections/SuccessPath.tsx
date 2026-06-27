import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { ChevronRight } from "lucide-react";
import { SectionDivider } from "@/components/SectionDivider";

const steps = [
  { label: "Think Better", emoji: "🧠" },
  { label: "Grow Better", emoji: "🌱" },
  { label: "Build Better", emoji: "🚀" },
  { label: "Connect Better", emoji: "🤝" },
  { label: "Serve Better", emoji: "❤️" },
  { label: "Impact", emoji: "✨" },
];

const lines = [
  "The better you think, the better you grow.",
  "The better you grow, the better you build.",
  "The better you build, the better you connect.",
  "The better you connect, the better you serve.",
  "The better you serve, the greater your impact.",
];

export function SuccessPath() {
  return (
    <section className="relative bg-paper text-on-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24 sm:py-32">
        <Reveal className="max-w-2xl">
          <div className="chip-dark">The Success Path</div>
          <h2 className="mt-5 font-display font-black text-4xl sm:text-5xl lg:text-6xl text-ink-deep">
            A journey of <span className="text-gradient-dark">becoming</span>.
          </h2>
        </Reveal>

        <StaggerGroup className="mt-14 -mx-4 sm:mx-0 overflow-x-auto pb-4 scrollbar-none">
          <div className="flex items-stretch gap-3 px-4 sm:px-0 min-w-max">
            {steps.map((s, i) => (
              <StaggerItem key={s.label} className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className={`rounded-2xl px-6 py-5 min-w-[180px] text-center ${
                      i === steps.length - 1
                        ? "bg-ink-deep text-white shadow-glow"
                        : "bg-white ring-1 ring-black/5 shadow-[var(--shadow-card-light)]"
                    }`}
                  >
                    <div className="text-3xl">{s.emoji}</div>
                    <div className={`mt-2 font-display font-bold ${i === steps.length - 1 ? "" : "text-ink-deep"}`}>{s.label}</div>
                    <div className={`mt-1 text-[10px] tracking-[0.3em] uppercase ${i === steps.length - 1 ? "text-white/60" : "text-on-paper-subtle"}`}>
                      Step 0{i + 1}
                    </div>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight size={20} className="text-purple shrink-0" />
                )}
              </StaggerItem>
            ))}
          </div>
        </StaggerGroup>

        <Reveal className="mt-14 max-w-3xl mx-auto text-center">
          <div className="space-y-2 text-lg sm:text-xl text-on-paper">
            {lines.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
          <p className="mt-8 font-display font-black text-3xl sm:text-4xl text-ink-deep">
            And impact is <span className="text-gradient-dark">success</span>.
          </p>
        </Reveal>
      </div>
      <SectionDivider to="ink" variant="curve" />
    </section>
  );
}
