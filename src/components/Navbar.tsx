import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

const links = [
  { label: "Home", to: "/" },
  { label: "The Conference", to: "/conference" },
  { label: "The Tribe", to: "/tribe" },
  { label: "Campus Chapters", to: "/campus" },
  { label: "Outreach", to: "/outreach" },
  { label: "Impact", to: "/impact" },
  { label: "Media", to: "/media" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div
          className={`flex items-center justify-between rounded-full px-4 py-2 transition-all duration-500 ${
            scrolled ? "glass-strong" : ""
          }`}
        >
          <Link to="/" className="flex items-center gap-2.5 pl-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-white font-display font-black text-sm shadow-glow">
              SS
            </span>
            <span className="font-display font-bold text-base tracking-tight">
              Socially<span className="text-blue-glow">.</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="relative px-3.5 py-2 text-sm text-foreground-muted hover:text-foreground transition-colors group [&.active]:text-foreground [&.active>span]:scale-x-100"
              >
                {l.label}
                <span className="pointer-events-none absolute inset-x-3.5 -bottom-0.5 h-px scale-x-0 bg-gradient-to-r from-purple-glow to-blue-glow transition-transform duration-300 group-hover:scale-x-100 origin-left" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/join" className="hidden md:inline-flex btn-primary !py-2.5 !px-5 !text-xs">
              Join The Tribe
            </Link>
            <button
              aria-label="Menu"
              className="lg:hidden grid h-10 w-10 place-items-center rounded-full glass-light"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden mx-4 mt-3 rounded-3xl glass-strong p-4"
          >
            <div className="flex flex-col">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-sm border-b border-white/5 last:border-0 text-foreground-muted hover:text-foreground [&.active]:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
              <Link to="/join" onClick={() => setOpen(false)} className="btn-primary mt-3">
                Join The Tribe
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
