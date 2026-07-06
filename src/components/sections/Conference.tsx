import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { SectionDivider } from "@/components/SectionDivider";
import { VideoBackdrop } from "@/components/VideoBackdrop";
import { Mic, MessageSquare, Users, Gift, ArrowRight, Play, X } from "lucide-react";
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
    video: "/videos/conference-2024-recap.mp4",
  },
  {
    year: "2025",
    title: "The Takeover Conference — Power Moves Only",
    body: "The second edition challenged young people to move beyond potential and begin taking ownership of the spaces, industries, communities, and systems around them. The focus was raising a generation prepared to lead, influence culture, and create meaningful change.",
    themes: ["Leadership", "Influence", "Innovation", "Industry Impact", "Nation Building"],
    image: panelImg,
    video: "/videos/conference-2025-recap.mp4",
  },
];

// NOTE: swap these `video` paths for your real conference footage.
// Leave `video: null` on any card without a clip — its play button won't render.
const happens = [
  { icon: Mic, title: "Keynote Sessions", body: "Learn from accomplished leaders, innovators, entrepreneurs, and change makers.", video: "/videos/keynote-sessions.mp4" },
  { icon: MessageSquare, title: "Panel Conversations", body: "Real discussions about careers, leadership, business, faith, media, family, and society.", video: "/videos/panel-conversations.mp4" },
  { icon: Users, title: "Networking", body: "Meaningful connections with ambitious young people and industry leaders.", video: "/videos/networking.mp4" },
  { icon: Gift, title: "Empowerment Opportunities", body: "Scholarships, resources, mentorship opportunities, and growth support.", video: null },
];

// Duplicated for a seamless continuous loop with enough slides to fill the buffer.
const happensLoop = [...happens, ...happens, ...happens];

const photoStrip = [
  { image: speakerImg, caption: "Keynote on the main stage" },
  { image: flatlayImg, caption: "Conference essentials" },
  { image: crowdImg, caption: "The crowd, fully present" },
];

export function Conference() {
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeDot, setActiveDot] = useState(0);
  const swiperRef = useRef(null);

  useEffect(function () {
    function onKeyDown(e) {
      if (e.key === "Escape") {
        setActiveVideo(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return function () {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(function () {
    if (activeVideo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return function () {
      document.body.style.overflow = "";
    };
  }, [activeVideo]);

  function goToCard(index) {
    setActiveDot(index);
    if (swiperRef.current) {
      swiperRef.current.slideToLoop(index, 600);
    }
  }

  return (
    <section id="conference" className="relative bg-ink-warm overflow-hidden">
      {/* Full-bleed cinematic intro */}
      <VideoBackdrop
        poster={crowdImg}
        rounded={false}
        height="min-h-[60svh]"
        overlay="purple"
      // badge="Conference 2025 highlights"
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
          {journey.map(function (j, i) {
            return (
              <Reveal key={j.year + "-" + i} delay={i * 0.08}>
                <div className="grid lg:grid-cols-2 gap-0 items-stretch overflow-hidden rounded-3xl">
                  <div className={"relative min-h-[360px] lg:min-h-[520px] group" + (i % 2 ? " lg:order-2" : "")}>
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
                    {j.video && (
                      <button
                        type="button"
                        onClick={function () { setActiveVideo({ video: j.video, title: j.title }); }}
                        aria-label={"Play recap video for " + j.title}
                        className="absolute top-6 right-6 grid h-12 w-12 place-items-center rounded-full glass-strong text-white opacity-90 hover:scale-110 transition-transform"
                      >
                        <Play size={18} fill="currentColor" />
                      </button>
                    )}
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
                        {j.themes.map(function (t) {
                          return (
                            <span
                              key={t}
                              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs"
                            >
                              {t}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Editorial photo strip */}
        <Reveal className="mt-16">
          <div className="grid sm:grid-cols-3 gap-3 h-[200px] sm:h-[280px]">
            {photoStrip.map(function (p, i) {
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden">
                  <img
                    src={p.image}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/80 via-ink-deep/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 right-4 text-sm text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    {p.caption}
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* What happens — continuous marquee, switchable via pagination dots */}
        <Reveal className="mt-24">
          <h3 className="font-display font-black text-3xl sm:text-4xl">
            What Happens at the Conference?
          </h3>
        </Reveal>

        <StaggerGroup className="mt-8">
          <div className="conference-marquee">
            <Swiper
              modules={[FreeMode, Autoplay]}
              onSwiper={function (swiper) { swiperRef.current = swiper; }}
              slidesPerView="auto"
              spaceBetween={20}
              loop
              speed={5000}
              autoplay={{
                delay: 0,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              freeMode={{ enabled: true, momentum: false }}
              allowTouchMove
              onSlideChange={function (swiper) {
                setActiveDot(swiper.realIndex);
              }}
              className="!pb-4"
            >
              {happensLoop.map(function (h, i) {
                const Icon = h.icon;
                return (
                  <SwiperSlide key={h.title + "-" + i} className="!w-[300px] sm:!w-[360px]">
                    <div className="glass-strong rounded-3xl p-8 h-[280px] flex flex-col hover-lift relative">
                      <div className="flex items-center justify-between">
                        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-white">
                          <Icon size={22} />
                        </span>
                        {/* {h.video && (
                          <button
                            type="button"
                            onClick={function () { setActiveVideo({ video: h.video, title: h.title }); }}
                            aria-label={"Play video about " + h.title}
                            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                          >
                            <Play size={14} fill="currentColor" />
                          </button>
                        )} */}
                      </div>
                      <h4 className="mt-5 font-display font-bold text-xl">{h.title}</h4>
                      <p className="mt-3 text-sm text-foreground-muted leading-relaxed">{h.body}</p>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>

          {/* Custom pagination dots — one per unique card, not per looped duplicate */}
          <div className="mt-6 flex items-center justify-center gap-2.5">
            {happens.map(function (h, i) {
              const isActive = i === activeDot;
              return (
                <button
                  key={h.title}
                  type="button"
                  onClick={function () { goToCard(i); }}
                  aria-label={"Jump to " + h.title}
                  aria-current={isActive}
                  className={
                    "h-2 rounded-full transition-all duration-300 " +
                    (isActive
                      ? "w-6 bg-gradient-to-r from-purple to-blue-glow"
                      : "w-2 bg-white/25 hover:bg-white/40")
                  }
                />
              );
            })}
          </div>
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

      {/* Lightbox — shared by journey cards and "what happens" cards */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-8"
            onClick={function () { setActiveVideo(null); }}
          >
            <button
              type="button"
              onClick={function () { setActiveVideo(null); }}
              aria-label="Close video"
              className="absolute top-4 right-4 sm:top-6 sm:right-6 grid h-11 w-11 place-items-center rounded-full glass-strong text-white hover:scale-105 transition-transform"
            >
              <X size={20} />
            </button>

            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl"
              onClick={function (e) { e.stopPropagation(); }}
            >
              <video
                key={activeVideo.video}
                src={activeVideo.video}
                controls
                autoPlay
                className="h-full w-full object-contain bg-black"
              />
            </motion.div>

            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-white/70 text-sm"
              onClick={function (e) { e.stopPropagation(); }}
            >
              {activeVideo.title}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .conference-marquee .swiper-wrapper {
          transition-timing-function: linear !important;
        }
      `}</style>

      {/* <SectionDivider to="paper-soft" variant="curve" /> */}
    </section>
  );
}