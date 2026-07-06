import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { ArrowRight } from "lucide-react";
import volunteerImg from "@/assets/ssc10.JPG";

export function VolunteerSection() {
  return (
    <section
      id="volunteer"
      className="relative overflow-hidden bg-ink-deep border-t border-white/5 py-24 sm:py-32"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 50% 0%, rgba(157,78,221,0.1), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-12 items-center">
          <Reveal>
            <SectionLabel>VOLUNTEER AT SSC 2026</SectionLabel>
            <h2 className="mt-5 font-display font-black text-4xl sm:text-5xl leading-[1.02] text-white">
              Be part of the team bringing <br />
              <span className="text-gradient">The Takeover Generation</span> to life.
            </h2>
            <p className="mt-5 text-foreground-muted text-lg leading-relaxed">
              SSC 2026 will welcome thousands of young people for a powerful day of worship, film,
              conversations, testimonies, music and transformational experiences.
            </p>
            <p className="mt-4 text-foreground-muted text-lg leading-relaxed">
              We are looking for committed, responsible and energetic volunteers ready to serve with
              excellence across different areas of the conference.
            </p>
            <p className="mt-4 text-foreground-muted text-lg leading-relaxed font-semibold text-white/90">
              If you are ready to contribute your time, skills and energy to making SSC 2026 happen,
              apply below.
            </p>

            <div className="mt-10">
              <Link to="/volunteer" className="btn-primary inline-flex group py-3.5 px-8">
                APPLY TO VOLUNTEER
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative rounded-[2rem] overflow-hidden border border-white/10 aspect-[4/3]">
              <img
                src={volunteerImg}
                alt="Volunteers at Socially Speaking"
                className="w-full h-full object-cover grayscale opacity-80 mix-blend-lighten hover:grayscale-0 hover:opacity-100 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-brand/20 to-transparent pointer-events-none" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
