import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { SectionDivider } from "@/components/SectionDivider";
import { VideoBackdrop } from "@/components/VideoBackdrop";
import { Mail, Building2, Instagram, ArrowRight } from "lucide-react";
import outreachImg from "@/assets/outreach20.jpg";
import foodDriveImg from "@/assets/food-drive.JPG";
import outreach25Img from "@/assets/outreach25.jpg";
import teacherImg from "@/assets/teacher.jpg";

// Three editorial full-screen panels
const initiatives = [
  {
    id: "orphanage",
    title: "Orphanage Outreach",
    body: "Supporting children across orphanages through relief materials, educational support, meaningful experiences, and direct engagement.",
    impact: [
      { number: "9", label: "Orphanages Reached" },
      { number: "340+", label: "Children Impacted" },
    ],
    image: outreachImg,
    color: "#6a189a",
  },
  {
    id: "hygiene",
    title: "Hygiene & Dignity Outreach",
    body: "Our secondary school initiative focused on menstrual health, hygiene education, confidence, and dignity for young girls. Beyond distributing hygiene essentials, we equip girls with practical knowledge about their bodies, personal care, and wellbeing.",
    impact: [{ number: "400+", label: "Secondary School Girls Reached" }],
    image: outreach25Img,
    color: "#f22f22",
  },
  {
    id: "teachers",
    title: "Teachers' Appreciation Outreach",
    body: "Honouring the People Who Build Generations. An appreciation initiative created to recognise and support public school teachers whose daily work continues to shape the lives and futures of young Nigerians. Through relief packages, appreciation resources, and direct engagement, we celebrate teachers while providing practical support for those serving within Nigeria's public education system.",
    impact: [
      { number: "100+", label: "Public School Teachers (2026 Goal)" },
      { number: "₦50,000", label: "Worth of Support Per Teacher" },
    ],
    image: teacherImg,
    color: "#56a0ff",
    isGoal: true,
  },
];

const impacts = [
  { number: "9", label: "Orphanages Reached", accentClass: "border-t-purple" },
  { number: "340+", label: "Children Impacted", accentClass: "border-t-blue" },
  { number: "400+", label: "Girls Reached", accentClass: "border-t-flame" },
  { number: "100+", label: "Teachers Targeted", accentClass: "border-t-green-400" },
];

export function Outreach() {
  return (
    <section
      id="outreach"
      className="relative bg-gradient-to-b from-white via-[#f6f3fb] to-white text-on-paper overflow-hidden"
    >
      {/* Full-bleed image-led intro */}
      <VideoBackdrop
        poster={outreachImg}
        rounded={false}
        height="min-h-[70svh]"
        overlay="flame"
        badge="Outreach in motion"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-full flex flex-col justify-end pb-12 sm:pb-16 pt-32">
          <Reveal className="max-w-3xl">
            <h2 className="mt-5 font-display font-black text-4xl sm:text-5xl lg:text-7xl leading-[1.02] text-white">
              Success Must Produce <span className="text-gradient">Contribution</span>.
            </h2>
            <div className="mt-6 space-y-3 text-white/85 text-lg leading-relaxed max-w-2xl">
              <p>We believe success is making the world around you better than how you met it.</p>
              <p>
                Socially Speaking Outreach is our social impact arm, where we turn service into
                action through initiatives designed to support children, students, educators, and
                communities.
              </p>
            </div>
          </Reveal>
        </div>
      </VideoBackdrop>

      {/* Three large editorial-style panels */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 sm:pt-28">
        <Reveal>
          <div className="flex items-center gap-3 text-sm tracking-[0.3em] uppercase text-on-paper-subtle mb-10">
            <span className="h-px w-10 bg-purple" />
            Our Outreach Initiatives
          </div>
        </Reveal>
      </div>

      {/* Editorial panels — each takes over the viewport */}
      <div className="space-y-6 px-4 sm:px-6 pb-6">
        {initiatives.map((initiative, i) => (
          <Reveal key={initiative.id} delay={i * 0.06}>
            <div className="relative rounded-[2rem] overflow-hidden min-h-[85svh] flex items-end shadow-card">
              <img
                src={initiative.image}
                alt={initiative.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* Dark overlay — stronger at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/96 via-ink-deep/60 to-ink-deep/15" />
              {/* Brand colour accent overlay */}
              <div
                className="absolute inset-0 mix-blend-multiply opacity-25"
                style={{
                  background: `linear-gradient(135deg, ${initiative.color}, transparent 60%)`,
                }}
                aria-hidden
              />

              {/* Content anchored to bottom */}
              <div className="relative w-full p-8 sm:p-12 lg:p-16">
                <div className="max-w-3xl">
                  {initiative.isGoal && (
                    <span className="inline-block mb-4 px-3 py-1.5 rounded-full text-xs tracking-[0.2em] uppercase bg-white/15 text-white border border-white/20">
                      2026 Goal
                    </span>
                  )}
                  <h3 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
                    {initiative.title}
                  </h3>
                  <p className="mt-5 text-white/80 text-lg leading-relaxed max-w-2xl">
                    {initiative.body}
                  </p>

                  {/* Impact numbers — displayed prominently */}
                  <div className="mt-8 flex flex-wrap gap-8">
                    {initiative.impact.map((stat) => (
                      <div key={stat.label}>
                        <div
                          className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-none"
                          style={{ color: "white" }}
                        >
                          {stat.number}
                        </div>
                        <div className="mt-2 text-sm text-white/70 tracking-wide">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Impact Highlights strip */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
        <Reveal className="mt-0">
          <div className="text-xs tracking-[0.3em] uppercase text-on-paper-subtle mb-4">
            Impact Highlights
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {impacts.map((s) => (
              <div
                key={s.label}
                className={`glass-paper rounded-2xl p-6 text-center border-t-4 ${s.accentClass}`}
              >
                <div className="font-display font-black text-3xl sm:text-5xl text-gradient-brand">
                  {s.number}
                </div>
                <div className="mt-1 text-xs sm:text-sm text-on-paper-subtle">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* See Our Impact CTA */}
        <Reveal className="mt-8">
          <a
            href="https://instagram.com/sociallyspeaking.outreach"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 btn-primary group"
          >
            <Instagram size={16} />
            See Our Impact
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </a>
        </Reveal>

        {/* Food Drive — full-bleed photographic feature */}
        <Reveal className="mt-20">
          <div className="relative rounded-[2rem] overflow-hidden shadow-card">
            <img
              src={foodDriveImg}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,9,26,0.96)_0%,rgba(6,9,26,0.85)_55%,rgba(6,9,26,0.4)_100%)]" />
            <div className="relative p-8 sm:p-12 lg:p-16 max-w-3xl">
              <div className="chip">Featured Initiative</div>
              <h3 className="mt-5 font-display font-black text-3xl sm:text-4xl lg:text-5xl leading-[1.05] text-white">
                The Socially Speaking <span className="text-gradient">Community Food Drive</span>
              </h3>
              <div className="mt-6 space-y-4 text-white/80 leading-relaxed">
                <p>
                  At Socially Speaking Community, we believe conversations are powerful, but
                  compassion in action is transformational. That is why we launched the Socially
                  Speaking Community Food Drive, a recurring outreach initiative dedicated to
                  providing quality nonperishable food supplies to children, public school teachers,
                  and other underserved members of our communities.
                </p>
                <p>
                  Through this initiative, we are building a culture of generosity, dignity, and
                  consistent community support, one outreach at a time.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Contact cards */}
        <div className="mt-10 grid md:grid-cols-2 gap-5">
          <div className="glass-paper rounded-2xl p-7 shadow-card-light">
            <h4 className="font-display font-bold text-2xl">Support the Food Drive</h4>
            <p className="mt-2 text-sm text-on-paper">
              Whether you're donating food items, making a financial contribution, or exploring a
              partnership, we'd love to hear from you.
            </p>
            <p className="mt-4 text-sm text-on-paper-subtle">
              To arrange a donation or learn more about supporting this initiative, please contact
              us:
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <Mail size={14} className="text-blue" /> Email: ssc.outreach@gmail.com
              </div>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-7 shadow-glow-blue hover-lift">
            <h4 className="font-display font-bold text-2xl text-foreground">
              For Financial Donations
            </h4>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Building2 size={14} className="text-blue-glow mt-0.5" />
                <div>
                  <div className="text-foreground-subtle">Account Name</div>
                  <div className="font-medium text-foreground">
                    Socially Speaking Community Foundation
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 size={14} className="text-blue-glow mt-0.5" />
                <div>
                  <div className="text-foreground-subtle">Bank</div>
                  <div className="font-medium text-foreground">Fidelity Bank</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 size={14} className="text-blue-glow mt-0.5" />
                <div>
                  <div className="text-foreground-subtle">Account Number</div>
                  <div className="font-medium text-foreground">4110235252</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <a
          href="https://instagram.com/sociallyspeaking.outreach"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 text-sm text-blue hover:text-purple transition-colors"
        >
          <Instagram size={16} /> Follow for more: sociallyspeaking.outreach
        </a>
      </div>
    </section>
  );
}
