import { Instagram, Linkedin, Youtube, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";

import logoImg from "@/assets/logo.PNG";

const links = [
  { label: "Conference", to: "/conference" },
  { label: "The Tribe", to: "/tribe" },
  { label: "Campus Chapters", to: "/campus" },
  { label: "Outreach", to: "/outreach" },
  { label: "Impact", to: "/impact" },
  { label: "Join Us", to: "/join" },
  { label: "Media", to: "/media" },
];

const socials = [
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com" },
  { icon: Mail, label: "Email Contact", href: "mailto:ssc.outreach@gmail.com" },
];

export function Footer() {
  return (
    <footer className="relative pt-20 pb-10 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-aurora opacity-50" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-[1.4fr_1fr_1fr] gap-12">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src={logoImg}
                alt="Socially Speaking Logo"
                className="h-11 w-11 object-contain rounded-full shadow-glow"
              />
              <span className="font-display font-black text-2xl">
                Socially Speaking<span className="text-blue-glow">.</span>
              </span>
            </Link>
            <p className="mt-5 text-foreground-muted max-w-md leading-relaxed">
              Building Africa's next generation of thinkers, leaders and
              changemakers. We build. We equip. We develop.
            </p>
            <div className="mt-7 flex items-center gap-3">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="grid h-11 w-11 place-items-center rounded-full glass-light hover:ring-glow transition-shadow"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-foreground-subtle mb-4">
              Quick Links
            </div>
            <ul className="space-y-2.5">
              {links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-foreground-muted hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-foreground-subtle mb-4">
              Social Media
            </div>
            <ul className="space-y-2.5">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="text-foreground-muted hover:text-foreground transition-colors">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-foreground-subtle">
          <div>© {new Date().getFullYear()} Socially Speaking. All rights reserved.</div>
          <div>Copyright Socially Speaking</div>
        </div>
      </div>
    </footer>
  );
}
