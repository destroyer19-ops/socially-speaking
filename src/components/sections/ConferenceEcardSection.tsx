import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { Calendar, MapPin, Sparkles, ArrowRight, Users, CheckCircle2 } from "lucide-react";
import ecardImg from "@/assets/ssc2026-ecard.webp";

export function ConferenceEcardSection() {
  return (
    <section
      id="ssc2026"
      className="relative overflow-hidden bg-ink-deep border-b border-white/10 py-20 sm:py-28 lg:py-32"
    >
      {/* Ambient background glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_20%_25%,rgba(106,24,154,0.35),transparent_70%),radial-gradient(ellipse_55%_50%_at_80%_75%,rgba(31,123,182,0.25),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-10 h-96 w-96 rounded-full bg-purple/15 blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          
          {/* Column 1: Prominent E-Card Presentation */}
          <div className="lg:col-span-5 flex justify-center">
            <Reveal>
              <div className="relative group max-w-sm sm:max-w-md w-full">
                {/* Outer decorative ambient glow */}
                <div
                  aria-hidden
                  className="absolute -inset-2 sm:-inset-3 rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-tr from-brand via-purple-glow to-blue-glow opacity-30 blur-2xl transition duration-700 group-hover:opacity-50"
                />

                {/* E-Card Card Frame */}
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-gradient-to-b from-white/10 to-white/5 p-2 shadow-2xl backdrop-blur-xl">
                  {/* Aspect-ratio preserved image (original flyer is 960x1200, aspect-ratio 4:5) */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-ink">
                    <img
                      src={ecardImg}
                      alt="Official Socially Speaking Conference 2026 E-Card — The Takeover Generation"
                      className="h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                      loading="eager"
                      width={960}
                      height={1200}
                    />
                    
                    {/* Subtle corner badge on mobile */}
                    <div className="absolute top-3 right-3 sm:hidden">
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                        <Sparkles size={11} className="text-purple-glow" /> SSC 2026
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subtitle caption below the flyer */}
                <p className="mt-3 text-center text-xs text-foreground-subtle tracking-wide">
                  Official Conference E-Card · Saturday, 5 December 2026
                </p>
              </div>
            </Reveal>
          </div>

          {/* Column 2: Event Vision & Prominent CTAs */}
          <div className="lg:col-span-7">
            <Reveal delay={0.1}>
              <div className="space-y-6">
                
                {/* Top chip badge */}
                <div className="flex flex-wrap items-center gap-2">
                  <SectionLabel>SSC 2026 · FLAGSHIP EVENT</SectionLabel>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-0.5 text-xs font-semibold text-purple-glow">
                    <Sparkles size={12} />
                    Free Entry · Registration Required
                  </span>
                </div>

                {/* Main Heading */}
                <div>
                  <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-5xl tracking-tight text-white leading-[1.08]">
                    THE TAKEOVER{" "}
                    <span className="text-gradient block sm:inline">GENERATION</span>
                  </h2>
                  <p className="mt-2 text-lg sm:text-xl font-medium text-purple-glow tracking-wide">
                    Theme: Conquer You First
                  </p>
                </div>

                {/* Quick Event Metadata Pills */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-foreground">
                    <Calendar size={16} className="text-blue-glow shrink-0" />
                    <span className="font-semibold">Saturday, 5 December 2026</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-foreground">
                    <MapPin size={16} className="text-purple-glow shrink-0" />
                    <span className="font-semibold">Main Auditorium · Lagos, Nigeria</span>
                  </div>
                </div>

                {/* Inspiring Supporting Copy */}
                <p className="text-base sm:text-lg text-foreground-muted leading-relaxed">
                  Africa&apos;s defining youth conference returns. Join thousands of audacious young
                  leaders, students, and professionals for a life-altering day of worship, film,
                  high-caliber keynote sessions, honest panel discussions, and empowering leadership networks.
                </p>

                {/* Highlights checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-sm text-foreground/90">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-brand shrink-0" />
                    <span>Visionary keynote speakers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-brand shrink-0" />
                    <span>Empowerment & networking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-brand shrink-0" />
                    <span>Worship, music & media showcase</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-brand shrink-0" />
                    <span>Unique attendee referral tracking</span>
                  </div>
                </div>

                {/* ── TWO CLEAR PROMINENT CALL-TO-ACTION BUTTONS ───────────────── */}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                    
                    {/* CTA 1: Register as an Attendee */}
                    <Link
                      to="/conference-register"
                      className="btn-primary group flex-1 py-4 px-7 text-base font-bold shadow-xl shadow-brand/25 text-center justify-center"
                    >
                      <span>Register as an Attendee</span>
                      <ArrowRight
                        size={18}
                        className="transition-transform duration-300 group-hover:translate-x-1.5"
                      />
                    </Link>

                    {/* CTA 2: Volunteer for SSC2026 */}
                    <Link
                      to="/volunteer"
                      className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/5 py-4 px-7 text-base font-bold text-white transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:shadow-lg hover:shadow-white/5 focus:outline-none focus:ring-2 focus:ring-purple-glow active:scale-[0.98] text-center"
                    >
                      <Users size={18} className="text-purple-glow" />
                      <span>Volunteer for SSC2026</span>
                    </Link>
                  </div>

                  {/* Mobilizer & Group Invitation Note */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-foreground-subtle">
                    <span>
                      Representing a school, fellowship, or organization?
                    </span>
                    <Link
                      to="/mobilize"
                      className="font-semibold text-blue-glow hover:text-white transition-colors underline decoration-blue-glow/40 underline-offset-4"
                    >
                      Mobilize Attendees &amp; Get a Link →
                    </Link>
                  </div>
                </div>

              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}
