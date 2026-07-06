import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { SectionDivider } from "@/components/SectionDivider";
import crowdImg from "@/assets/crowd-cheering.jpg";
import panelImg from "@/assets/panel-stage.jpg";
import campusImg from "@/assets/campus.jpg";
import campusCandidImg from "@/assets/campus-candid.jpg";
import tribeImg from "@/assets/tribe.jpg";
import outreachImg from "@/assets/outreach.jpg";
import speakerImg from "@/assets/speaker.jpg";
import foodDriveImg from "@/assets/food-drive.jpg";

const timeline = [
  { year: "2024", title: "Socially Speaking Conference Launch.", image: crowdImg },
  { year: "2025", title: "Socially Speaking Tribe Launch", image: tribeImg },
  { year: "2025", title: "Community Webinars & Growth Programs", image: panelImg },
  { year: "2025", title: "The Takeover Conference", image: speakerImg },
  { year: "2026", title: "The Exchange University Tour", image: campusImg },
  { year: "2026", title: "Campus Chapter Expansion", image: campusCandidImg },
  { year: "2026", title: "Outreach Expansion", image: outreachImg },
];

export function Journey() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#f6f3fb] to-white text-on-paper">
      {/* Ambient blue/purple wash, matching the Who We Are section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple/[0.14] via-transparent to-blue-glow/[0.16]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[10%] h-[480px] w-[480px] rounded-full bg-blue-glow/20 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-15%] left-[-5%] h-[440px] w-[440px] rounded-full bg-purple/20 blur-[130px]"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32">
        <Reveal className="text-center max-w-2xl mx-auto">
          <div className="chip-dark mx-auto">Our Journey</div>
          <h2 className="mt-5 font-display font-black text-4xl sm:text-5xl lg:text-6xl text-ink-deep">
            From <span className="text-gradient-dark">spark</span> to movement.
          </h2>
        </Reveal>

        <div className="relative mt-16">
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-purple via-blue to-blue-glow opacity-40" />
          <StaggerGroup className="space-y-8">
            {timeline.map(function (t, i) {
              const isLeft = i % 2 === 0;
              return (
                <StaggerItem key={t.year + "-" + i}>
                  <div className="relative pl-12 sm:pl-0 sm:grid sm:grid-cols-2 sm:gap-12">
                    <span className="absolute left-4 sm:left-1/2 top-4 -translate-x-1/2 grid h-3 w-3 place-items-center z-10">
                      <span className="h-3 w-3 rounded-full bg-gradient-to-br from-purple to-blue-glow ring-4 ring-white" />
                    </span>

                    <div className={isLeft ? "sm:col-start-1 sm:pr-8" : "sm:col-start-2 sm:pl-8"}>
                      <div className="group relative overflow-hidden rounded-2xl hover-lift shadow-[var(--shadow-card-light)] ring-1 ring-black/5 h-40 sm:h-44">
                        <img
                          src={t.image}
                          alt=""
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Color overlay so text stays readable over any photo */}
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/90 via-ink-deep/40 to-ink-deep/10" />
                        <div className="absolute inset-0 bg-gradient-to-br from-purple/30 via-transparent to-blue-glow/20 mix-blend-multiply" />

                        <div className="relative flex h-full flex-col justify-end p-5 sm:p-6">
                          <div className="text-xs tracking-[0.3em] uppercase text-blue-glow font-bold">
                            {t.year}
                          </div>
                          <div className="mt-1 font-display font-bold text-lg sm:text-xl leading-tight text-white">
                            {t.title}
                          </div>
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
      {/* <SectionDivider to="ink" variant="curve" /> */}
    </section>
  );
}