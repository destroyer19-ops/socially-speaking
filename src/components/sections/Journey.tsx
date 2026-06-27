import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { SectionDivider } from "@/components/SectionDivider";

const timeline = [
  { year: "2024", title: "Socially Speaking Conference Launch." },
  { year: "2025", title: "Socially Speaking Tribe Launch" },
  { year: "2025", title: "Community Webinars & Growth Programs" },
  { year: "2025", title: "The Takeover Conference" },
  { year: "2026", title: "The Exchange University Tour" },
  { year: "2026", title: "Campus Chapter Expansion" },
  { year: "2026", title: "Outreach Expansion" },
];

export function Journey() {
  return (
    <section className="relative bg-paper-soft text-on-paper">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32">
        <Reveal className="text-center max-w-2xl mx-auto">
          <div className="chip-dark mx-auto">Our Journey</div>
          <h2 className="mt-5 font-display font-black text-4xl sm:text-5xl lg:text-6xl text-ink-deep">
            From <span className="text-gradient-dark">spark</span> to movement.
          </h2>
        </Reveal>

        <div className="relative mt-16">
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-purple via-blue to-blue-glow opacity-40" />
          <StaggerGroup className="space-y-8">
            {timeline.map((t, i) => {
              const isLeft = i % 2 === 0;
              return (
                <StaggerItem key={`${t.year}-${i}`}>
                  <div className={`relative pl-12 sm:pl-0 sm:grid sm:grid-cols-2 sm:gap-12`}>
                    <span className="absolute left-4 sm:left-1/2 top-4 -translate-x-1/2 grid h-3 w-3 place-items-center">
                      <span className="h-3 w-3 rounded-full bg-gradient-to-br from-purple to-blue-glow ring-4 ring-paper-soft" />
                    </span>

                    <div className={`${isLeft ? "sm:text-right sm:pr-8" : "sm:col-start-2 sm:pl-8"}`}>
                      <div className="bg-white rounded-2xl p-5 sm:p-6 inline-block w-full text-left hover-lift shadow-[var(--shadow-card-light)] ring-1 ring-black/5">
                        <div className="text-xs tracking-[0.3em] uppercase text-purple font-bold">
                          {t.year}
                        </div>
                        <div className="mt-2 font-display font-bold text-lg sm:text-xl leading-tight text-ink-deep">
                          {t.title}
                        </div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </div>
      <SectionDivider to="ink" variant="curve" />
    </section>
  );
}
