import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import crowdImg from "@/assets/ssc10.JPG";

export function JoinUs() {
  return (
    <section
      id="join"
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(140deg, #060412 0%, #0f0520 55%, #070318 100%)" }}
    >
      {/* Full-bleed photographic backdrop */}
      <img
        src={crowdImg}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover ken-burns"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 30% 20%, rgba(157,78,221,0.5), transparent), radial-gradient(ellipse 50% 60% at 80% 85%, rgba(86,160,255,0.18), transparent), linear-gradient(to bottom, rgba(6,9,26,0.72), rgba(6,9,26,0.93))",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <Reveal>
            <SectionLabel>Join Us</SectionLabel>
            <h2 className="mt-5 font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.02]">
              Become the <span className="text-gradient">standard</span>.<br />
              Be the difference.
            </h2>
            <p className="mt-5 text-foreground-muted text-lg leading-relaxed">
              Whether you're joining the Tribe, signing up for the 2026 Conference waiting list,
              starting a campus chapter, supporting an outreach, or partnering with us — this is
              your front door.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "A community of 1,000+ young African leaders",
                "Weekly growth programs & mentorship",
                "First access to Conference 2026",
              ].map((b) => (
                <div key={b} className="flex items-center gap-3 text-sm text-foreground/90">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-brand text-white">
                    <Check size={12} />
                  </span>
                  {b}
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass-strong rounded-3xl p-8 sm:p-10 border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
              <div className="absolute -right-16 -top-16 w-36 h-36 bg-brand/20 rounded-full blur-2xl" />
              <div className="absolute -left-16 -bottom-16 w-36 h-36 bg-blue-glow/20 rounded-full blur-2xl" />

              <div className="relative">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-blue-glow mb-4">
                  <Sparkles size={12} /> Live Your Purpose
                </span>
                <h3 className="font-display font-black text-2xl text-white leading-tight">
                  Tribe Application is Open
                </h3>
                <p className="mt-3 text-sm text-foreground-muted leading-relaxed">
                  We don't do mailing lists. We do decisions. If you are ready to invest in who you
                  are becoming, apply to join the Tribe today.
                </p>
              </div>

              <div className="relative mt-8 space-y-4">
                <Link to="/join" className="btn-primary w-full justify-center group py-3.5 text-sm">
                  Apply to Join the Tribe
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <p className="text-[11px] text-foreground-subtle text-center">
                  Registration is required for all community leadership programs and events.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
