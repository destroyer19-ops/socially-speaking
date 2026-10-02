import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { Instagram, Youtube, Linkedin, ArrowUpRight } from "lucide-react";
import logoImg from "@/assets/logo.PNG";

// TikTok has no Lucide icon — using a simple SVG inline
function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.88a8.16 8.16 0 004.77 1.52V7.01a4.85 4.85 0 01-1-.32z" />
    </svg>
  );
}

const accounts = [
  {
    name: "Socially Speaking Community",
    description: "Main community account",
    socials: [
      {
        label: "sociallyspeaking.tribe",
        icon: Instagram,
        href: "https://instagram.com/sociallyspeaking.tribe",
      },
      {
        label: "sociallyspeaking.tribe",
        icon: TikTokIcon,
        href: "https://tiktok.com/@sociallyspeaking.tribe",
      },
      {
        label: "sociallyspeakingtribe",
        icon: Youtube,
        href: "https://youtube.com/@sociallyspeakingtribe",
      },
    ],
  },
  {
    name: "Socially Speaking Outreach",
    description: "Outreach campaigns, impact stories and opportunities to support.",
    socials: [
      {
        label: "sociallyspeaking.outreach",
        icon: Instagram,
        href: "https://instagram.com/sociallyspeaking.outreach",
      },
    ],
  },
  {
    name: "Campus Chapters / The Exchange",
    description: "Campus conversations, university events and chapter activities.",
    socials: [
      { label: "sscthe.exchange", icon: Instagram, href: "https://instagram.com/sscthe.exchange" },
    ],
  },
  {
    name: "The Takeover Network",
    description:
      "Connecting ambitious young leaders, creatives, professionals and changemakers across countries and industries.",
    socials: [
      {
        label: "thetakeovernetwork",
        icon: Instagram,
        href: "https://instagram.com/thetakeovernetwork",
      },
      {
        label: "The Takeover Network",
        icon: Linkedin,
        href: "https://linkedin.com/company/thetakeover-network",
      },
    ],
  },
];

export function MediaGallery() {
  return (
    <div className="w-full">
      <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((account) => (
          <StaggerItem key={account.name}>
            <div className="flex flex-col rounded-3xl glass-strong p-8 border border-white/5 h-full hover:border-brand/30 transition-all">
              {/* Logo */}
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 p-2 mb-5 shadow-glow flex items-center justify-center shrink-0">
                <img
                  src={logoImg}
                  alt={account.name}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>

              {/* Name + description */}
              <h3 className="font-display font-bold text-xl text-white mb-2">{account.name}</h3>
              <p className="text-sm text-foreground-muted leading-relaxed mb-6 flex-1">
                {account.description}
              </p>

              {/* Social links */}
              <div className="flex flex-col gap-2">
                {account.socials.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.href}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link inline-flex items-center gap-2.5 text-sm text-foreground-muted hover:text-blue-glow transition-colors"
                    >
                      <Icon size={16} className="shrink-0" />
                      <span>@{s.label}</span>
                      <ArrowUpRight
                        size={13}
                        className="opacity-0 -translate-x-1 translate-y-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 group-hover/link:translate-y-0 transition-all"
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  );
}
