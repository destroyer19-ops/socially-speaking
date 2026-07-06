import { Link } from "@tanstack/react-router";
import { CalendarDays, Clock3, Sparkles, Video } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import webinarImg from "@/assets/generated/webinar-poster.jpg";

const details = [
  { icon: CalendarDays, label: "Date", value: "Thursday, 17 September 2026" },
  { icon: Clock3, label: "Time", value: "7:00 PM GMT+1" },
  { icon: Video, label: "Venue", value: "Zoom" },
  { icon: Sparkles, label: "Attendance", value: "FREE" },
];

export function FirstClassFormula() {
  return (
    <section
      id="first-class-formula"
      className="relative overflow-hidden bg-gradient-to-b from-[#f6f3fb] via-white to-[#f4f7ff] text-on-paper"
    >
      <div className="pointer-events-none absolute left-[-6%] top-[-8%] h-[28rem] w-[28rem] rounded-full bg-purple/10 blur-[130px]" />
      <div className="pointer-events-none absolute right-[-10%] bottom-[-14%] h-[24rem] w-[24rem] rounded-full bg-blue-glow/10 blur-[120px]" />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
        <Reveal>
          <div className="max-w-2xl">
            <SectionLabel>Free Academic Success Webinar</SectionLabel>
            <h2 className="mt-6 font-display text-4xl font-black leading-[1.02] tracking-[-0.04em] text-ink-deep sm:text-5xl lg:text-6xl">
              THE FIRST CLASS FORMULA
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-foreground-muted">
              Your First Class journey starts long before final year. The First Class Formula is a
              free Academic Success Webinar for incoming and current university students who want to
              start strong, navigate university with the right strategies, and excel academically.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-foreground-muted">
              Learn directly from First Class graduates as they share the systems, decisions,
              lessons and practical strategies that helped them succeed.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {details.map((detail) => {
                const Icon = detail.icon;

                return (
                  <div
                    key={detail.label}
                    className="rounded-2xl border border-black/5 bg-white/80 p-4 shadow-[0_12px_40px_rgba(12,17,39,0.06)] backdrop-blur"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink-deep text-white shadow-[0_10px_24px_rgba(16,24,58,0.18)]">
                        <Icon size={18} />
                      </span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-foreground-subtle">
                          {detail.label}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-ink-deep">{detail.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-[2rem] border border-black/5 bg-white/85 p-6 shadow-[0_18px_60px_rgba(12,17,39,0.08)] backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue">
                Start university with a formula for excellence.
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground-muted">
                Register now to secure your place on Zoom and prepare for university with a clear
                plan, sharper systems and practical guidance from graduates who have done it.
              </p>
              <Link to="/first-class-formula" className="btn-primary mt-5 inline-flex">
                REGISTER FOR FREE
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal className="lg:justify-self-end">
          <div className="relative mx-auto w-full max-w-[34rem] overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_24px_80px_rgba(12,17,39,0.12)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(86,160,255,0.12),transparent_55%)]" />
            <img
              src={webinarImg}
              alt="The First Class Formula e-card"
              className="relative z-10 block w-full object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
