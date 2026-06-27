import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { SectionDivider } from "@/components/SectionDivider";
import { Quote, Play } from "lucide-react";
import speakerImg from "@/assets/speaker.jpg";
import tribeImg from "@/assets/tribe.jpg";
import campusImg from "@/assets/campus.jpg";
import outreachImg from "@/assets/outreach.jpg";
import crowdImg from "@/assets/crowd-cheering.jpg";
import campusCandidImg from "@/assets/campus-candid.jpg";
import portraitImg from "@/assets/portrait-leader.jpg";
import foodDriveImg from "@/assets/food-drive.jpg";

const stories = [
  { kind: "Conference Attendee", img: speakerImg, span: "lg:row-span-2 lg:col-span-2" },
  { kind: "Tribe Member", img: tribeImg, span: "" },
  { kind: "Campus Chapter Member", img: campusImg, span: "" },
  { kind: "Outreach Beneficiary", img: outreachImg, span: "lg:row-span-2" },
];

const gallery = [crowdImg, campusCandidImg, portraitImg, foodDriveImg];

export function Stories() {
  return (
    <section className="relative bg-ink-deep overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24 sm:py-32">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <Reveal>
            <SectionLabel>Real Stories</SectionLabel>
            <h2 className="mt-5 font-display font-black text-4xl sm:text-5xl lg:text-6xl max-w-xl">
              Voices from the <span className="text-gradient">movement</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-foreground-muted max-w-md">
              Video and written testimonials from conference attendees, tribe
              members, campus chapter members, and outreach beneficiaries.
            </p>
          </Reveal>
        </div>

        {/* Bento masonry — first card spans two columns + rows */}
        <StaggerGroup className="mt-14 grid grid-cols-2 lg:grid-cols-4 auto-rows-[220px] gap-4">
          {stories.map((s) => (
            <StaggerItem key={s.kind} className={s.span}>
              <div className="group relative h-full w-full rounded-3xl overflow-hidden ring-1 ring-white/10 hover-lift">
                <img src={s.img} alt={s.kind} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/40 to-transparent" />
                <button className="absolute top-4 right-4 grid h-11 w-11 place-items-center rounded-full glass-strong text-white opacity-90 group-hover:scale-110 transition-transform">
                  <Play size={16} fill="currentColor" />
                </button>
                <div className="absolute bottom-5 left-5 right-5">
                  <Quote className="text-blue-glow mb-2" size={20} />
                  <div className="font-display font-bold text-lg leading-tight">
                    {s.kind}
                  </div>
                  <div className="mt-1 text-xs text-foreground-muted">
                    Their story →
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>

      {/* Edge-to-edge gallery strip */}
      <div className="grid grid-cols-4 gap-1.5 h-[180px] sm:h-[260px]">
        {gallery.map((src, i) => (
          <div key={i} className="relative overflow-hidden group">
            <img src={src} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-ink-deep/20" />
          </div>
        ))}
      </div>
      <SectionDivider to="paper-soft" variant="wave" />
    </section>
  );
}
