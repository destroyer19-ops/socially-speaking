import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { SectionDivider } from "@/components/SectionDivider";
import { VideoBackdrop } from "@/components/VideoBackdrop";
import { Mic, MessageSquare, Users, Gift, ArrowRight } from "lucide-react";
import crowdImg from "@/assets/crowd-cheering.jpg";
import panelImg from "@/assets/panel-stage.jpg";
import speakerImg from "@/assets/speaker.jpg";
import flatlayImg from "@/assets/conference-flatlay.jpg";
import tribeImg from "@/assets/tribe.jpg";

const journey = [
  {
    year: "2024",
    title: "Mastering the Art of Personal Excellence",
    body: "Our inaugural conference focused on helping young people develop the mindset, habits, discipline, character, and personal leadership required for success.",
    themes: ["Personal Excellence", "Discipline", "Leadership", "Growth", "Purpose"],
    image: crowdImg,
  },
  {
    year: "2025",
    title: "The Takeover Conference — Power Moves Only",
    body: "The second edition challenged young people to move beyond potential and begin taking ownership of the spaces, industries, communities, and systems around them. The focus was raising a generation prepared to lead, influence culture, and create meaningful change.",
    themes: ["Leadership", "Influence", "Innovation", "Industry Impact", "Nation Building"],
    image: panelImg,
  },
];

const happens = [
  { icon: Mic, title: "Keynote Sessions", body: "Learn from accomplished leaders, innovators, entrepreneurs, and change makers." },
  { icon: MessageSquare, title: "Panel Conversations", body: "Real discussions about careers, leadership, business, faith, media, family, and society." },
  { icon: Users, title: "Networking", body: "Meaningful connections with ambitious young people and industry leaders." },
  { icon: Gift, title: "Empowerment Opportunities", body: "Scholarships, resources, mentorship opportunities, and growth support." },
];

export function Conference() {
  return (
    <section id="conference" className="relative bg-ink-warm overflow-hidden">
      {/* Full-bleed cinematic intro */}
      <VideoBackdrop
        poster={crowdImg}
        rounded={false}
        height="min-h-[60svh]"
        overlay="purple"
        badge="Conference 2025 highlights"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-full flex items-end pb-12 sm:pb-16 pt-32">
          <Reveal className="max-w-3xl">
            <SectionLabel>Socially Speaking Conference</SectionLabel>
            <h2 className="mt-5 font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.02] text-white">
              The Gathering Place for{" "}
              <span className="text-gradient">Africa's Next Generation</span> of Leaders.
            </h2>
          </Reveal>
        </div>
      </VideoBackdrop>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
        <Reveal className="max-w-3xl">
          <div className="space-y-4 text-foreground-muted text-lg leading-relaxed">
            <p>
              The Socially Speaking Conference is our flagship annual leadership
              and personal development conference, bringing together ambitious
              young people to learn, grow, connect, and prepare for meaningful
              impact.
            </p>
            <p>
              Through keynote sessions, panel discussions, workshops, networking
              opportunities, and empowerment initiatives, the conference
              challenges young people to pursue excellence, think bigger, and
              become the standard in every area of life.
            </p>
          </div>
        </Reveal>

        {/* Conference Journey */}
        <Reveal className="mt-16">
          <div className="flex items-center gap-3 text-sm tracking-[0.3em] uppercase text-foreground-subtle">
            <span className="h-px w-10 bg-blue-glow" /> Conference Journey
          </div>
        </Reveal>

        <div className="mt-8 grid gap-10">
          {journey.map((j, i) => (
            <Reveal key={j.year} delay={i * 0.08}>
              <div className="grid lg:grid-cols-2 gap-0 items-stretch overflow-hidden rounded-3xl">
                <div className={`relative min-h-[360px] lg:min-h-[520px] ${i % 2 ? "lg:order-2" : ""}`}>
                  <img
                    src={j.image}
                    alt={j.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/90 via-ink-deep/20 to-transparent" />
                  <div className="absolute top-6 left-6 chip">
                    {j.year === "2024" ? "SSC 2024" : "SSC 2025"}
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 font-display font-black text-6xl sm:text-8xl text-gradient">
                    {j.year}
                  </div>
                </div>
                <div className="p-8 sm:p-12 flex flex-col justify-center glass-strong">
                  <h3 className="font-display font-bold text-2xl sm:text-3xl leading-tight">
                    {j.title}
                  </h3>
                  <p className="mt-4 text-foreground-muted leading-relaxed">{j.body}</p>
                  <div className="mt-6">
                    <div className="text-[11px] tracking-[0.25em] uppercase text-foreground-subtle mb-3">
                      Key themes
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {j.themes.map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Editorial photo strip */}
        <Reveal className="mt-16">
          <div className="grid sm:grid-cols-3 gap-3 h-[200px] sm:h-[280px]">
            <div className="relative rounded-2xl overflow-hidden">
              <img src={speakerImg} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div className="relative rounded-2xl overflow-hidden">
              <img src={flatlayImg} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div className="relative rounded-2xl overflow-hidden">
              <img src={crowdImg} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </div>
        </Reveal>

        {/* What happens */}
        <Reveal className="mt-24">
          <h3 className="font-display font-black text-3xl sm:text-4xl">
            What Happens at the Conference?
          </h3>
        </Reveal>

        <StaggerGroup className="mt-8">
          <Swiper
            modules={[EffectCoverflow, Pagination, Autoplay]}
            effect="coverflow"
            grabCursor
            centeredSlides
            slidesPerView="auto"
            loop
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            coverflowEffect={{ rotate: 20, stretch: 0, depth: 200, modifier: 1, slideShadows: false }}
            pagination={{ clickable: true }}
            className="!pb-12"
          >
            {happens.map((h) => {
              const Icon = h.icon;
              return (
                <SwiperSlide key={h.title} className="!w-[300px] sm:!w-[360px]">
                  <div className="glass-strong rounded-3xl p-8 h-[280px] flex flex-col hover-lift">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-white">
                      <Icon size={22} />
                    </span>
                    <h4 className="mt-5 font-display font-bold text-xl">{h.title}</h4>
                    <p className="mt-3 text-sm text-foreground-muted leading-relaxed">{h.body}</p>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </StaggerGroup>

        {/* Next destination — full-bleed image */}
        <Reveal className="mt-20">
          <div className="relative overflow-hidden rounded-[2rem] min-h-[420px]">
            <img src={tribeImg} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-cover ken-burns" />
            <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_20%_20%,rgba(106,24,154,0.7),transparent),linear-gradient(to_right,rgba(6,9,26,0.95),rgba(6,9,26,0.3))]" />
            <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center p-10 sm:p-14">
              <div>
                <div className="chip">Next Destination</div>
                <h3 className="mt-4 font-display font-black text-4xl sm:text-5xl">
                  Socially Speaking <span className="text-gradient">Conference 2026</span>
                </h3>
                <p className="mt-4 text-foreground-muted text-lg max-w-xl">
                  Building the next generation of excellent, audacious, and
                  resilient young leaders.
                </p>
              </div>
              <div className="flex lg:justify-end">
                <a href="#join" className="btn-primary group">
                  Join The Waiting List
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
      <SectionDivider to="paper-soft" variant="curve" />
    </section>
  );
}
