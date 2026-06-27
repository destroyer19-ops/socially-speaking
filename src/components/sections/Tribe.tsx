import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { Brain, Sprout, Rocket, Handshake, Heart } from "lucide-react";
import { SectionDivider } from "@/components/SectionDivider";
import tribeImg from "@/assets/tribe.jpg";
import campusCandidImg from "@/assets/campus-candid.jpg";
import portraitImg from "@/assets/portrait-leader.jpg";

const pillars = [
  { icon: Brain, emoji: "🧠", title: "Think Better", body: "Critical thinking, psychology, society, culture, current affairs." },
  { icon: Sprout, emoji: "🌱", title: "Grow Better", body: "Faith, character, discipline, emotional intelligence, personal growth." },
  { icon: Rocket, emoji: "🚀", title: "Build Better", body: "Career growth, business, entrepreneurship, money and skills." },
  { icon: Handshake, emoji: "🤝", title: "Connect Better", body: "Relationships, networking, communication and collaboration." },
  { icon: Heart, emoji: "❤️", title: "Serve Better", body: "Leadership, volunteering, social impact and nation building." },
];

const activities = [
  "Weekly discussions",
  "Webinars",
  "Debates",
  "Community Hangouts",
  "Games Nights",
  "Mentorship",
  "Growth Challenges",
  "Networking Sessions",
];

export function Tribe() {
  return (
    <section id="tribe" className="relative bg-paper-soft text-on-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24 sm:py-32">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-start">
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

          {/* Image trio */}
          <Reveal delay={0.1} className="relative h-[420px] sm:h-[520px]">
            <div className="absolute top-0 right-0 h-[70%] w-[68%] rounded-3xl overflow-hidden shadow-[var(--shadow-card-light)]">
              <img src={tribeImg} alt="" aria-hidden loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="absolute bottom-0 left-0 h-[55%] w-[55%] rounded-3xl overflow-hidden ring-4 ring-paper-soft shadow-[var(--shadow-card-light)]">
              <img src={campusCandidImg} alt="" aria-hidden loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="absolute top-[8%] left-[14%] h-28 w-28 rounded-2xl overflow-hidden ring-4 ring-paper-soft">
              <img src={portraitImg} alt="" aria-hidden loading="lazy" className="h-full w-full object-cover" />
            </div>
          </Reveal>
        </div>

        <StaggerGroup className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p, i) => (
            <StaggerItem key={p.title}>
              <div className="group relative h-full bg-white rounded-3xl p-7 hover-lift shadow-[var(--shadow-card-light)] ring-1 ring-black/5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{p.emoji}</span>
                  <span className="text-[10px] tracking-[0.3em] uppercase text-on-paper-subtle">
                    Pillar 0{i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-display font-black text-2xl text-ink-deep">{p.title}</h3>
                <p className="mt-2 text-sm text-on-paper leading-relaxed">{p.body}</p>
                <div className="mt-5 h-1 w-12 rounded-full bg-gradient-to-r from-purple to-blue-glow" />
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal className="mt-16">
          <div className="bg-ink-deep text-white rounded-3xl p-8 sm:p-10">
            <div className="flex items-center gap-3 text-sm tracking-[0.3em] uppercase text-foreground-subtle">
              <span className="h-px w-10 bg-blue-glow" /> Community Activities
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {activities.map((a) => (
                <span
                  key={a}
                  className="px-4 py-2.5 rounded-full glass-light text-sm hover:border-blue-glow/60 transition-colors"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
      <SectionDivider to="ink" variant="wave" />
    </section>
  );
}
