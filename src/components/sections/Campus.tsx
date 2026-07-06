import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { SectionDivider } from "@/components/SectionDivider";
import { GraduationCap, Lightbulb, Users, Heart, ArrowUpRight, Check, Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import campusCandidImg from "@/assets/ssc1.jpg";
import tribeImg from "@/assets/ssc2.jpg";
import exchangeImg from "@/assets/ssc4.JPG";
import crowdImgEx from "@/assets/crowd-ex.jpg";

const focus = [
  {
    icon: GraduationCap,
    title: "Academic Excellence",
    body: "Study with high-performing peers, join accountability groups, participate in study hubs, and develop habits that help you thrive academically.",
    color: "#6a189a",
  },
  {
    icon: Lightbulb,
    title: "Leadership & Innovation",
    body: "Take on leadership opportunities, launch projects, solve problems, and develop the confidence to turn ideas into action.",
    color: "#ffb703",
  },
  {
    icon: Users,
    title: "Community & Connection",
    body: "Build meaningful friendships, expand your network, and participate in activities that make university more engaging and rewarding.",
    color: "#56a0ff",
  },
  {
    icon: Heart,
    title: "Impact & Service",
    body: "Lead initiatives, serve your campus community, and create projects that leave your university better than you met it.",
    color: "#f22f22",
  },
];

const why = [
  "Join a community of ambitious students",
  "Improve your academic performance",
  "Build meaningful friendships and networks",
  "Develop leadership and communication skills",
  "Participate in innovation and impact projects",
  "Gain experiences beyond the classroom",
  "Graduate with a track record that sets you apart",
];

const unis = [
  { name: "UNILAG", status: "Active" },
  { name: "Bayero University", status: "Active" },
  { name: "Ebonyi State University", status: "Coming Soon" },
  { name: "Future Campuses", status: "Coming Soon" },
];

const exchangeActs = [
  "Keynote Sessions",
  "Opposition Circle",
  "Alumni Conversations",
  "Panels",
  "University Tours",
];

export function Campus() {
  return (
    <section id="campus" className="relative bg-ink-deep overflow-hidden">
      {/* Full-bleed campus banner image */}
      <div className="relative h-[44vh] sm:h-[56vh] overflow-hidden">
        <img
          src={crowdImgEx}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 sm:px-6 pb-10 sm:pb-14">
          <SectionLabel>Campus Chapters</SectionLabel>
          <div className="mt-4 text-xs tracking-[0.4em] uppercase text-blue-glow font-semibold">
            The College Success Engine
          </div>
          <h2 className="mt-3 font-display font-black text-4xl sm:text-5xl lg:text-7xl leading-[1.02] max-w-4xl">
            Building Students Who <span className="text-gradient">Stand Out</span>
          </h2>
        </div>
      </div>

      {/* Ambient glow, so the rest of the section isn't flat dark */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[30%] left-[-5%] h-[440px] w-[440px] rounded-full bg-purple/15 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[10%] right-[-5%] h-[420px] w-[420px] rounded-full bg-blue-glow/15 blur-[140px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-24">
        <Reveal className="max-w-3xl">
          <div className="space-y-4 text-foreground-muted text-lg leading-relaxed">
            <p>
              Socially Speaking Campus Chapters are university-based communities designed to help
              students make the most of their university experience.
            </p>
            <p>
              Through study hubs, leadership opportunities, innovation projects, social activities,
              and community impact initiatives, we help students grow academically, build meaningful
              relationships, develop practical skills, and create lasting impact on their campuses.
            </p>
            <p>
              We believe university should be more than lectures, exams, and graduation. It should
              be a season of growth, leadership, discovery, and contribution.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid lg:grid-cols-[1.2fr_1fr] gap-10">
          <div>
            <div className="text-sm tracking-[0.3em] uppercase text-foreground-subtle mb-6">
              <span className="inline-block h-px w-10 bg-blue-glow align-middle mr-3" />
              Our Focus
            </div>
            <StaggerGroup className="grid sm:grid-cols-2 gap-4">
              {focus.map(function (f) {
                const Icon = f.icon;
                return (
                  <StaggerItem key={f.title}>
                    <div className="group relative glass-strong rounded-2xl p-6 h-full hover-lift overflow-hidden">
                      <div
                        aria-hidden
                        className="absolute -top-10 -right-10 h-28 w-28 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                        style={{
                          background: `radial-gradient(circle, ${f.color}, transparent 70%)`,
                        }}
                      />
                      <span
                        className="relative grid h-11 w-11 place-items-center rounded-xl"
                        style={{ backgroundColor: f.color + "26" }}
                      >
                        <Icon size={18} style={{ color: f.color }} />
                      </span>
                      <h4 className="relative mt-4 font-display font-bold text-lg">{f.title}</h4>
                      <p className="relative mt-2 text-sm text-foreground-muted leading-relaxed">
                        {f.body}
                      </p>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>
          </div>

          <Reveal
            delay={0.15}
            className="relative rounded-3xl overflow-hidden min-h-[480px] ring-1 ring-white/10"
          >
            <img
              src={tribeImg}
              alt="Students connecting on campus"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink/30 to-transparent" />
            <div className="absolute inset-x-6 bottom-6">
              <div className="glass-strong rounded-2xl p-5">
                <div className="text-xs tracking-[0.3em] uppercase text-blue-glow">Why Join?</div>
                <ul className="mt-3 space-y-2">
                  {why.map(function (w) {
                    return (
                      <li key={w} className="flex items-start gap-2 text-sm text-foreground/90">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-purple to-blue-glow shrink-0" />
                        {w}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>

        <StaggerGroup className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {unis.map(function (u) {
            const isActive = u.status === "Active";
            const uniId =
              u.name === "UNILAG"
                ? "UNILAG"
                : u.name === "Ebonyi State University"
                  ? "EBSU"
                  : "Other";

            const cardContent = (
              <div className="group glass-strong rounded-2xl p-6 hover-lift relative overflow-hidden h-full">
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-purple/30 to-blue/30 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex flex-col justify-between h-full">
                  <div>
                    <span
                      className={
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] tracking-[0.15em] uppercase " +
                        (isActive
                          ? "bg-green-500/15 text-green-400"
                          : "bg-amber-500/15 text-amber-400")
                      }
                    >
                      {isActive ? <Check size={11} /> : <Clock size={11} />}
                      {u.status}
                    </span>
                    <div className="mt-3 font-display font-bold text-lg text-white">{u.name}</div>
                  </div>
                  {isActive && (
                    <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-blue-glow group-hover:text-white transition-colors">
                      <span>Register Now</span>
                      <ArrowUpRight
                        size={14}
                        className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                      />
                    </div>
                  )}
                </div>
              </div>
            );

            return (
              <StaggerItem key={u.name}>
                {isActive ? (
                  <Link
                    to="/campus-register"
                    search={{ university: uniId }}
                    className="block h-full"
                  >
                    {cardContent}
                  </Link>
                ) : (
                  cardContent
                )}
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        {/* The Exchange — full bleed image */}
        <Reveal className="mt-24">
          <div className="relative rounded-[2rem] overflow-hidden min-h-[460px]">
            <img
              src={exchangeImg}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover ken-burns"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,9,26,0.95)_0%,rgba(6,9,26,0.75)_50%,rgba(6,9,26,0.2)_100%)]" />
            <div className="relative grid lg:grid-cols-2 gap-10 p-8 sm:p-12">
              <div>
                <div className="chip">Powered By The Exchange</div>
                <h3 className="mt-4 font-display font-black text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">
                  Where Young People <span className="text-gradient">Learn To Think</span>.
                </h3>
                <p className="mt-5 text-foreground-muted text-lg leading-relaxed max-w-xl">
                  The Exchange is Socially Speaking's university conversation platform designed to
                  spark bold discussions around leadership, influence, culture, media, systems,
                  faith, creativity, and society.
                </p>
                <div className="mt-6">
                  <a
                    href="https://instagram.com/sscthe.exchange"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-blue-glow hover:text-white transition-colors"
                  >
                    Follow on Instagram: @sscthe.exchange
                  </a>
                </div>
              </div>
              <div className="lg:pl-8">
                <div className="text-xs tracking-[0.3em] uppercase text-blue-glow mb-4">
                  Activities
                </div>
                <ul className="space-y-3">
                  {exchangeActs.map(function (a, i) {
                    return (
                      <li
                        key={a}
                        className="flex items-center gap-4 glass-light rounded-2xl px-5 py-4 hover:translate-x-1 transition-transform"
                      >
                        <span className="font-display font-black text-xl text-gradient w-8">
                          0{i + 1}
                        </span>
                        <span className="font-medium">{a}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
      {/* <SectionDivider to="ink-warm" variant="slope" flip /> */}
    </section>
  );
}
