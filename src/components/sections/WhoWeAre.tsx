import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { Hammer, Zap, Rocket } from "lucide-react";
import { SectionDivider } from "@/components/SectionDivider";
import portraitImg from "@/assets/portrait-leader.jpg";
import campusCandidImg from "@/assets/campus-candid.jpg";
import speakerImg from "@/assets/speaker.jpg";

const pillars = [
  {
    icon: Hammer,
    title: "BUILD",
    body: "We provide a foundation through ideas, values, culture, and ways of thinking that shape who young people become.",
  },
  {
    icon: Zap,
    title: "EQUIP",
    body: "We provide knowledge, skills, opportunities, resources, networks, and exposure required for growth and success.",
  },
  {
    icon: Rocket,
    title: "DEVELOP",
    body: "We create opportunities for young people to apply what they learn through leadership, projects, competitions, outreach initiatives, community activities, and real-world impact.",
  },
];

export function WhoWeAre() {
  return (
    <section id="who" className="relative bg-paper text-on-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24 sm:py-32">
        <div className="grid lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-16 items-center">
          {/* Image collage */}
          <Reveal className="relative h-[460px] sm:h-[560px] lg:h-[640px] order-2 lg:order-1">
            <div className="absolute top-0 left-0 h-[78%] w-[68%] rounded-3xl overflow-hidden shadow-[var(--shadow-card-light)]">
              <img
                src={portraitImg}
                alt="Young African leader"
                loading="lazy"
                className="h-full w-full object-cover"
                width={1280}
                height={1600}
              />
            </div>
            <div className="absolute bottom-0 right-0 h-[60%] w-[60%] rounded-3xl overflow-hidden ring-1 ring-black/10 shadow-[var(--shadow-card-light)]">
              <img
                src={campusCandidImg}
                alt="Friends on campus"
                loading="lazy"
                className="h-full w-full object-cover"
                width={1280}
                height={1600}
              />
            </div>
            <div className="absolute top-[40%] right-[6%] h-32 w-32 sm:h-40 sm:w-40 rounded-2xl overflow-hidden ring-4 ring-paper">
              <img src={speakerImg} alt="" aria-hidden loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="absolute top-[8%] right-[2%] glass-paper rounded-2xl p-4 max-w-[180px] shadow-[var(--shadow-card-light)]">
              <div className="text-[10px] tracking-[0.2em] uppercase text-on-paper-subtle">
                The Movement
              </div>
              <div className="mt-1 font-display font-black text-2xl text-ink-deep leading-none">
                1,000+
              </div>
              <div className="mt-1 text-xs text-on-paper-subtle">
                Young leaders, one tribe.
              </div>
            </div>
          </Reveal>

          {/* Copy */}
          <div className="order-1 lg:order-2">
            <Reveal>
              <div className="chip-dark">Who We Are</div>
              <h2 className="mt-5 font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-[0.95] text-ink-deep">
                We <span className="text-gradient-dark">Build.</span>
                <br />
                <span className="text-gradient-dark">Equip.</span> Develop.
              </h2>
            </Reveal>

            <Reveal delay={0.1} className="mt-7 space-y-5 text-on-paper text-lg leading-relaxed">
              <p>
                Socially Speaking exists to build, equip, and develop a new
                generation of excellent, audacious, and resilient young leaders
                who invest in the quality of their personalities in order to
                stand out, be the standard, and be the difference they want to
                see.
              </p>
              <p className="text-ink-deep font-medium">
                We believe success is more than personal achievement.
              </p>
              <ul className="space-y-3 border-l-2 border-purple/60 pl-5">
                <li>Success is impacting your world with the investment of your personality.</li>
                <li>Success is influencing the world around you to think better, aspire higher, and be excellent.</li>
                <li>Success is making the world around you better than how you met it.</li>
              </ul>
              <p className="text-ink-deep font-semibold">That is why Socially Speaking exists.</p>
              <p>
                We are building a generation of young Africans who think
                critically, grow intentionally, build valuable skills, form
                meaningful relationships, and create lasting impact.
              </p>
            </Reveal>
          </div>
        </div>

        <StaggerGroup className="mt-20 grid gap-6 md:grid-cols-3">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <StaggerItem key={p.title}>
                <div className="group relative h-full rounded-3xl p-8 bg-ink-deep text-white overflow-hidden hover-lift">
                  <div
                    aria-hidden
                    className="absolute -top-20 -right-20 h-52 w-52 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
                    style={{
                      background:
                        i === 0
                          ? "radial-gradient(circle, #6a189a, transparent 70%)"
                          : i === 1
                          ? "radial-gradient(circle, #1f7bb6, transparent 70%)"
                          : "radial-gradient(circle, #56a0ff, transparent 70%)",
                    }}
                  />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-white">
                        <Icon size={22} />
                      </span>
                      <span className="font-display text-7xl font-black text-white/10 leading-none">
                        0{i + 1}
                      </span>
                    </div>
                    <h3 className="mt-6 font-display font-black text-3xl tracking-tight">
                      {p.title}
                    </h3>
                    <p className="mt-3 text-foreground-muted leading-relaxed">{p.body}</p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
      <SectionDivider to="ink" variant="curve" />
    </section>
  );
}
