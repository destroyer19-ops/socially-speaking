import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import {
  Brain, Sprout, Rocket, Handshake, Heart,
  MessageCircle, Video, Swords, Coffee, Gamepad2, Users2, TrendingUp, Network,
} from "lucide-react";
import { SectionDivider } from "@/components/SectionDivider";
import tribeImg from "@/assets/tribe.jpg";
import campusCandidImg from "@/assets/campus-candid.jpg";
import portraitImg from "@/assets/portrait-leader.jpg";

const pillars = [
  { icon: Brain, color: "#6a189a", title: "Think Better", body: "Critical thinking, psychology, society, culture, current affairs." },
  { icon: Sprout, color: "#1f7bb6", title: "Grow Better", body: "Faith, character, discipline, emotional intelligence, personal growth." },
  { icon: Rocket, color: "#56a0ff", title: "Build Better", body: "Career growth, business, entrepreneurship, money and skills." },
  { icon: Handshake, color: "#9d4edd", title: "Connect Better", body: "Relationships, networking, communication and collaboration." },
  { icon: Heart, color: "#f22f22", title: "Serve Better", body: "Leadership, volunteering, social impact and nation building." },
];

const activitiesRow1 = [
  { icon: MessageCircle, label: "Weekly discussions", color: "#9d4edd" },
  { icon: Video, label: "Webinars", color: "#56a0ff" },
  { icon: Swords, label: "Debates", color: "#f22f22" },
  { icon: Coffee, label: "Community Hangouts", color: "#ffb703" },
];

const activitiesRow2 = [
  { icon: Gamepad2, label: "Games Nights", color: "#1f7bb6" },
  { icon: Users2, label: "Mentorship", color: "#6a189a" },
  { icon: TrendingUp, label: "Growth Challenges", color: "#f22f22" },
  { icon: Network, label: "Networking Sessions", color: "#56a0ff" },
];

// Tripled so the continuous scroll never runs out of buffer before looping.
const row1Loop = [...activitiesRow1, ...activitiesRow1, ...activitiesRow1];
const row2Loop = [...activitiesRow2, ...activitiesRow2, ...activitiesRow2];

function ActivityChip({ icon: Icon, label, color }) {
  return (
    <span
      className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full glass-light text-sm text-white whitespace-nowrap shrink-0"
    >
      <span
        className="grid h-7 w-7 place-items-center rounded-full"
        style={{ backgroundColor: color + "33" }}
      >
        <Icon size={14} style={{ color: color }} />
      </span>
      {label}
    </span>
  );
}

export function Tribe() {
  return (
    <section id="tribe" className="relative overflow-hidden bg-gradient-to-b from-white via-[#f6f3fb] to-white text-on-paper">
      {/* Ambient blue/purple wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple/[0.14] via-transparent to-blue-glow/[0.16]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[8%] h-[500px] w-[500px] rounded-full bg-purple/20 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-15%] left-[-6%] h-[440px] w-[440px] rounded-full bg-blue-glow/20 blur-[130px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-24 sm:py-32">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
          <Reveal>
            <div className="chip-dark">The Tribe</div>
            <h2 className="mt-5 font-display font-black text-4xl sm:text-5xl lg:text-6xl text-ink-deep">
              Your <span className="text-gradient-dark">Growth Ecosystem</span>.
            </h2>
            <p className="mt-6 text-on-paper text-lg leading-relaxed">
              The Socially Speaking Tribe is a community for young Africans
              committed to becoming the standard and the difference they want to
              see in the world.
            </p>
            <p className="mt-3 text-on-paper text-lg leading-relaxed">
              Everything we do revolves around five pillars:
            </p>
          </Reveal>

          <Reveal delay={0.1} className="h-[420px] sm:h-[480px]">
            <div className="grid h-full grid-cols-2 grid-rows-2 gap-4">
              <div className="row-span-2 rounded-3xl overflow-hidden shadow-[var(--shadow-card-light)]">
                <img src={tribeImg} alt="Members of The Tribe community" loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="rounded-3xl overflow-hidden shadow-[var(--shadow-card-light)]">
                <img src={portraitImg} alt="Young African leader" loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="rounded-3xl overflow-hidden shadow-[var(--shadow-card-light)]">
                <img src={campusCandidImg} alt="Friends on campus" loading="lazy" className="h-full w-full object-cover" />
              </div>
            </div>
          </Reveal>
        </div>

        <StaggerGroup className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map(function (p, i) {
            const Icon = p.icon;
            return (
              <StaggerItem key={p.title}>
                <div className="group relative h-full bg-white rounded-3xl p-7 hover-lift shadow-[var(--shadow-card-light)] ring-1 ring-black/5">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-12 w-12 place-items-center rounded-2xl"
                      style={{ backgroundColor: p.color + "1f" }}
                    >
                      <Icon size={20} style={{ color: p.color }} />
                    </span>
                    <span className="text-[10px] tracking-[0.3em] uppercase text-on-paper-subtle">
                      Pillar 0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display font-black text-2xl text-ink-deep">{p.title}</h3>
                  <p className="mt-2 text-sm text-on-paper leading-relaxed">{p.body}</p>
                  <div className="mt-5 h-1 w-12 rounded-full bg-gradient-to-r from-purple to-blue-glow" />
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        {/* Community Activities — dual-row marquee instead of a flat tag list */}
        <Reveal className="mt-16">
          <div className="relative overflow-hidden bg-ink-deep text-white rounded-3xl py-10 sm:py-12">
            {/* subtle glow accents inside the dark card */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-purple/20 blur-[100px]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-blue-glow/20 blur-[100px]"
            />

            <div className="relative px-8 sm:px-10">
              <div className="flex items-center gap-3 text-sm tracking-[0.3em] uppercase text-foreground-subtle">
                <span className="h-px w-10 bg-blue-glow" /> Community Activities
              </div>
            </div>

            {/* Row 1 — scrolls left */}
            <div className="relative mt-8 group/row">
              <div className="overflow-hidden">
                <div className="flex w-max gap-3 animate-tribe-marquee-left group-hover/row:[animation-play-state:paused] px-8 sm:px-10">
                  {row1Loop.map(function (a, i) {
                    return <ActivityChip key={a.label + "-" + i} {...a} />;
                  })}
                </div>
              </div>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-ink-deep to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-ink-deep to-transparent" />
            </div>

            {/* Row 2 — scrolls right, opposite direction for visual rhythm */}
            <div className="relative mt-4 group/row">
              <div className="overflow-hidden">
                <div className="flex w-max gap-3 animate-tribe-marquee-right group-hover/row:[animation-play-state:paused] px-8 sm:px-10">
                  {row2Loop.map(function (a, i) {
                    return <ActivityChip key={a.label + "-" + i} {...a} />;
                  })}
                </div>
              </div>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-ink-deep to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-ink-deep to-transparent" />
            </div>
          </div>
        </Reveal>
      </div>

      <style>{`
        @keyframes tribe-marquee-left {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
        @keyframes tribe-marquee-right {
          from { transform: translateX(-33.333%); }
          to { transform: translateX(0); }
        }
        .animate-tribe-marquee-left {
          animation: tribe-marquee-left 26s linear infinite;
        }
        .animate-tribe-marquee-right {
          animation: tribe-marquee-right 26s linear infinite;
        }
      `}</style>

      {/* <SectionDivider to="ink" variant="wave" /> */}
    </section>
  );
}