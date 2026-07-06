import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { Quote, Play, X } from "lucide-react";
import speakerImg from "@/assets/speaker.jpg";
import tribeImg from "@/assets/tribe.jpg";
import campusImg from "@/assets/campus.jpg";
import outreachImg from "@/assets/outreach.jpg";
import crowdImg from "@/assets/crowd-cheering.jpg";
import campusCandidImg from "@/assets/campus-candid.jpg";
import portraitImg from "@/assets/portrait-leader.jpg";
import foodDriveImg from "@/assets/food-drive.jpg";

// NOTE: swap these `video` paths for your real video files/URLs
// (e.g. imported .mp4 assets, or hosted links from your CMS/YouTube/Vimeo embeds).
const stories = [
  { kind: "Conference Attendee", img: speakerImg, video: "/videos/conference-attendee.mp4", span: "lg:col-span-2" },
  { kind: "Tribe Member", img: tribeImg, video: "/videos/tribe-member.mp4", span: "lg:row-span-2" },
  { kind: "Campus Chapter Member", img: campusImg, video: "/videos/campus-chapter-member.mp4", span: "" },
  { kind: "Outreach Beneficiary", img: outreachImg, video: "/videos/outreach-beneficiary.mp4", span: "" },
];

const gallery = [crowdImg, campusCandidImg, portraitImg, foodDriveImg];

export function Stories() {
  const [activeVideo, setActiveVideo] = useState(null);

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

        {/* Bento grid — click any card to play its video in a lightbox */}
        <StaggerGroup className="mt-14 grid grid-cols-2 lg:grid-cols-3 auto-rows-[220px] gap-4">
          {stories.map(function (s) {
            return (
              <StaggerItem key={s.kind} className={s.span}>
                <button
                  type="button"
                  onClick={function () { setActiveVideo(s); }}
                  className="group relative h-full w-full rounded-3xl overflow-hidden ring-1 ring-white/10 hover-lift text-left"
                >
                  <img
                    src={s.img}
                    alt={s.kind}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/40 to-transparent" />
                  <span className="absolute top-4 right-4 grid h-11 w-11 place-items-center rounded-full glass-strong text-white opacity-90 group-hover:scale-110 transition-transform">
                    <Play size={16} fill="currentColor" />
                  </span>
                  <div className="absolute bottom-5 left-5 right-5">
                    <Quote className="text-blue-glow mb-2" size={20} aria-hidden />
                    <div className="font-display font-bold text-lg leading-tight">
                      {s.kind}
                    </div>
                    <div className="mt-1 text-xs text-foreground-muted">
                      Watch their story →
                    </div>
                  </div>
                </button>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>

      {/* Edge-to-edge gallery strip — decorative, unchanged */}
      <div className="grid grid-cols-4 gap-1.5 h-[180px] sm:h-[260px]">
        {gallery.map(function (src, i) {
          return (
            <div key={i} className="relative overflow-hidden group">
              <img
                src={src}
                alt=""
                aria-hidden
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-ink-deep/20" />
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
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
              {activeVideo.kind}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}