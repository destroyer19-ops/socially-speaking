import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Users } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { WhoWeAre } from "@/components/sections/WhoWeAre";
import { Ecosystem } from "@/components/sections/Ecosystem";
import { SuccessPath } from "@/components/sections/SuccessPath";
import { Stories } from "@/components/sections/Stories";
import { Journey } from "@/components/sections/Journey";
import { JoinUs } from "@/components/sections/JoinUs";
import { VolunteerSection } from "@/components/sections/VolunteerSection";
import { ConferenceEcardSection } from "@/components/sections/ConferenceEcardSection";
import popupImage from "@/assets/ssc2026-popup.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Socially Speaking — Building Africa's Next Generation of Leaders" },
      {
        name: "description",
        content:
          "Conferences, university chapters, community programs and outreach raising young Africans who think better, grow better, build better, connect better and serve better.",
      },
      { property: "og:title", content: "Socially Speaking — A Movement, Not a Page" },
      {
        property: "og:description",
        content:
          "We build, equip and develop the next generation of excellent, audacious, and resilient young African leaders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const [showSscPopup, setShowSscPopup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSscPopup(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Lock scroll when popup is visible
  useEffect(() => {
    if (!showSscPopup) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showSscPopup]);

  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <ConferenceEcardSection />
      <WhoWeAre />
      <Ecosystem />
      <SuccessPath />
      <Stories />
      <Journey />
      <VolunteerSection />
      <JoinUs />
      <Footer />

      {/* SSC 2026 Modal Popup */}
      <AnimatePresence>
        {showSscPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-deep/85 px-4 py-6 backdrop-blur-sm"
            onClick={() => setShowSscPopup(false)}
            role="dialog"
            aria-modal="true"
            aria-label="SSC 2026 — Register or Volunteer"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl"
              style={{ background: "linear-gradient(145deg, #060412 0%, #0f0520 60%, #080318 100%)" }}
            >
              {/* Close button */}
              <button
                onClick={() => setShowSscPopup(false)}
                className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              {/* Photo backdrop strip */}
              <div className="relative h-44 sm:h-52 overflow-hidden">
                <img
                  src={popupImage}
                  alt="SSC 2026 popup image"
                  className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#060412]" />
                <div className="absolute inset-0 bg-gradient-to-r from-brand/30 to-blue-glow/10" />

                {/* Top badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/80 backdrop-blur-sm">
                    5 December 2026 · Lagos
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="px-7 pb-8 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand">
                  Socially Speaking Conference 2026
                </p>
                <h2 className="mt-2 font-display font-black text-3xl sm:text-4xl leading-tight text-white">
                  THE TAKEOVER<br />
                  <span className="text-gradient">GENERATION</span>
                </h2>
                <p className="mt-3 text-sm text-white/65 leading-relaxed">
                  Conquer You First. Join thousands of young people for a powerful day of worship, music, testimonies, film and transformational experiences.
                </p>

                {/* Divider */}
                <div className="my-6 h-px bg-white/8" />

                {/* CTAs */}
                <div className="flex flex-col gap-3">
                  <Link
                    to="/conference-register"
                    onClick={() => setShowSscPopup(false)}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white px-5 py-3.5 font-bold text-sm uppercase tracking-wider text-ink-deep transition-all hover:bg-white/90 group"
                  >
                    <span>REGISTER FOR SSC 2026</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    to="/volunteer"
                    onClick={() => setShowSscPopup(false)}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 font-bold text-sm uppercase tracking-wider text-white/90 transition-all hover:border-white/30 hover:bg-white/10 group"
                  >
                    <span className="flex items-center gap-2">
                      <Users size={15} className="text-brand" />
                      REGISTER AS A VOLUNTEER
                    </span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 text-white/50" />
                  </Link>
                </div>

                <p className="mt-5 text-center text-[10px] text-white/30 tracking-wider">
                  Click outside or press × to dismiss
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
