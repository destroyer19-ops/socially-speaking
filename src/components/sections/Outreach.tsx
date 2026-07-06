import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { SectionDivider } from "@/components/SectionDivider";
import { VideoBackdrop } from "@/components/VideoBackdrop";
import { Phone, Mail, Building2, Instagram } from "lucide-react";
import outreachImg from "@/assets/outreach.jpg";
import foodDriveImg from "@/assets/food-drive.jpg";

const programs = [
  {
    title: "Orphanage Outreach Initiative",
    body: "Reaching children through support, engagement, resources, and community service.",
    media: "Videos from the outreach",
  },
  {
    title: "Hygiene & Dignity Initiative",
    body: "Supporting secondary school girls with menstrual hygiene education, dignity kits, and practical resources.",
    media: "Videos from the outreach",
  },
];

const impacts = [
  { number: "9", label: "Orphanages Reached" },
  { number: "340+", label: "Children Impacted" },
  { number: "400+", label: "Girls Reached" },
];

const collecting = [
  "Rice",
  "Beans",
  "Garri",
  "Palm Oil",
  "Pasta",
  "Drinks/Water",
  "Other sealed, long-lasting staples",
];

const support = [
  "Bulk food donations",
  "Financial contributions",
  "Logistics support",
  "Monthly sponsorship pledges",
];

export function Outreach() {
  return (
    <section id="outreach" className="relative bg-ink-warm overflow-hidden">
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
            {/* <SectionLabel>Outreach</SectionLabel> */}
            <h2 className="mt-5 font-display font-black text-4xl sm:text-5xl lg:text-7xl leading-[1.02] text-white">
              Success Must Produce{" "}
              <span className="text-gradient">Contribution</span>.
            </h2>
            <div className="mt-6 space-y-3 text-white/85 text-lg leading-relaxed max-w-2xl">
              <p>We believe success is making the world around you better than how you met it.</p>
              <p>Through Socially Speaking Outreach, we create initiatives that improve lives and strengthen communities.</p>
            </div>
          </Reveal>
        </div>
      </VideoBackdrop>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
        {/* Programs */}
        <StaggerGroup className="grid md:grid-cols-2 gap-5">
          {programs.map((p) => (
            <StaggerItem key={p.title}>
              <div className="glass-strong rounded-3xl p-7 h-full hover-lift">
                <h3 className="font-display font-bold text-xl sm:text-2xl">{p.title}</h3>
                <p className="mt-3 text-foreground-muted leading-relaxed">{p.body}</p>
                <div className="mt-5 flex items-center gap-2 text-xs text-blue-glow">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-blue/15 border border-blue-glow/40">▶</span>
                  {p.media}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* Impact strip */}
        <Reveal className="mt-10">
          <div className="text-xs tracking-[0.3em] uppercase text-foreground-subtle mb-4">
            Impact Highlights
          </div>
          <div className="grid grid-cols-3 gap-3">
            {impacts.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-6 text-center">
                <div className="font-display font-black text-3xl sm:text-5xl text-gradient">{s.number}</div>
                <div className="mt-1 text-xs sm:text-sm text-foreground-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Food Drive — full-bleed photographic feature */}
        <Reveal className="mt-20">
          <div className="relative rounded-[2rem] overflow-hidden">
            <img src={foodDriveImg} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,9,26,0.96)_0%,rgba(6,9,26,0.85)_55%,rgba(6,9,26,0.4)_100%)]" />
            <div className="relative p-8 sm:p-12 lg:p-16 max-w-3xl">
              <div className="chip" style={{ background: "rgba(242,47,34,0.12)", borderColor: "rgba(242,47,34,0.4)", color: "#ff7a70" }}>
                Featured Initiative
              </div>
              <h3 className="mt-5 font-display font-black text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">
                The Socially Speaking{" "}
                <span className="text-gradient">Community Food Drive</span>
              </h3>
              <div className="mt-6 space-y-4 text-foreground-muted leading-relaxed">
                <p>
                  At Socially Speaking Community, we believe conversations are
                  powerful, but compassion in action is transformational. That
                  is why we launched the Socially Speaking Community Food Drive,
                  a recurring outreach initiative dedicated to providing quality
                  nonperishable food supplies to children, public school
                  teachers, and other underserved members of our communities.
                </p>
                <p>
                  Through this initiative, we are building a culture of
                  generosity, dignity, and consistent community support, one
                  outreach at a time.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid lg:grid-cols-2 gap-5">
          <div className="glass rounded-2xl p-7">
            <h4 className="font-display font-bold text-xl">What Are We Collecting?</h4>
            <p className="mt-2 text-sm text-foreground-muted">
              We're calling on our incredible community to donate quality,
              nutritious nonperishable food items, such as:
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {collecting.map((c) => (
                <span key={c} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm">
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-foreground-muted italic">
              If it's shelf-stable, nutritious, and suitable for families, we
              would love to receive it.
            </p>
          </div>

          <div className="glass rounded-2xl p-7">
            <h4 className="font-display font-bold text-xl">Why This Matters</h4>
            <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
              For many families, children, and even public school teachers,
              access to essential food supplies is not always guaranteed.
              Together, we can help ease that burden through consistent acts of
              generosity.
            </p>
            <p className="mt-3 text-sm text-foreground-muted leading-relaxed">
              Every bag of rice, every carton of food, and every contribution
              helps strengthen families, support educators, and bring hope to
              communities that need it most.
            </p>
          </div>
        </div>

        <div className="mt-6 glass rounded-2xl p-7">
          <h4 className="font-display font-bold text-xl">Want to Do More?</h4>
          <p className="mt-2 text-sm text-foreground-muted">
            We welcome sponsors, partners, businesses, and individuals who want
            to make a lasting impact. You can support this initiative through:
          </p>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {support.map((s) => (
              <div key={s} className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm">
                {s}
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-foreground-muted leading-relaxed">
            Together, we are building a sustainable outreach that serves
            communities with consistency, compassion, and dignity.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-5">
          <div className="glass-strong rounded-2xl p-7">
            <h4 className="font-display font-bold text-2xl">Support the Food Drive</h4>
            <p className="mt-2 text-sm text-foreground-muted">
              Whether you're donating food items, making a financial
              contribution, or exploring a partnership, we'd love to hear from
              you.
            </p>
            <p className="mt-4 text-sm text-foreground-subtle">
              To arrange a donation or learn more about supporting this
              initiative, please contact us:
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-3"><Phone size={14} className="text-blue-glow" /> Phone: [Phone Number]</div>
              <div className="flex items-center gap-3"><Mail size={14} className="text-blue-glow" /> Email: ssc.outreach@gmail.com</div>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-7">
            <h4 className="font-display font-bold text-2xl">For Financial Donations</h4>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Building2 size={14} className="text-blue-glow mt-0.5" />
                <div>
                  <div className="text-foreground-subtle">Account Name</div>
                  <div className="font-medium">Socially Speaking Community Foundation</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 size={14} className="text-blue-glow mt-0.5" />
                <div>
                  <div className="text-foreground-subtle">Bank</div>
                  <div className="font-medium">Fidelity Bank</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 size={14} className="text-blue-glow mt-0.5" />
                <div>
                  <div className="text-foreground-subtle">Account Number</div>
                  <div className="font-medium">[Account Number]</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-foreground-muted leading-relaxed max-w-3xl">
          Together, we can provide hope, dignity, and practical support to
          children, public school teachers, and underserved communities.
        </p>

        <a
          href="https://instagram.com/sociallyspeaking.outreach"
          className="mt-6 inline-flex items-center gap-2 text-sm text-blue-glow hover:text-foreground transition-colors"
        >
          <Instagram size={16} /> Follow for more: sociallyspeaking.outreach
        </a>
      </div>
      <SectionDivider to="aurora" variant="curve" />
    </section>
  );
}
