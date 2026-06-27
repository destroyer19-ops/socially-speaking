import { motion } from "framer-motion";
import { Play } from "lucide-react";
import type { ReactNode } from "react";

/**
 * VideoBackdrop — cinematic, video-like full-bleed media slot.
 *
 * Uses a Ken Burns–animated still as the looping backdrop and exposes a
 * "PLAY REEL" badge so the moment reads as motion content. When a real
 * <video src> ships, drop it in via the `videoSrc` prop and the poster
 * will be used as the still fallback.
 */
export function VideoBackdrop({
  poster,
  videoSrc,
  overlay = "dark",
  badge = "Play the reel",
  children,
  className = "",
  rounded = true,
  height = "min-h-[520px] sm:min-h-[620px]",
}: {
  poster: string;
  videoSrc?: string;
  overlay?: "dark" | "navy" | "purple" | "flame" | "none";
  badge?: string | null;
  children?: ReactNode;
  className?: string;
  rounded?: boolean;
  height?: string;
}) {
  const overlayClass = {
    dark: "bg-gradient-to-t from-ink-deep via-ink-deep/55 to-ink-deep/30",
    navy: "bg-gradient-to-b from-ink-deep/40 via-ink-deep/55 to-ink-deep",
    purple:
      "bg-[radial-gradient(60%_80%_at_30%_20%,rgba(106,24,154,0.55),transparent),linear-gradient(to_top,rgba(6,9,26,0.85),rgba(6,9,26,0.25))]",
    flame:
      "bg-[radial-gradient(60%_80%_at_70%_30%,rgba(242,47,34,0.45),transparent),linear-gradient(to_top,rgba(6,9,26,0.8),rgba(6,9,26,0.3))]",
    none: "",
  }[overlay];

  return (
    <div
      className={`relative overflow-hidden ${rounded ? "rounded-[2rem]" : ""} ${height} ${className}`}
    >
      {videoSrc ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        <img
          src={poster}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover ken-burns"
        />
      )}
      <div className={`absolute inset-0 ${overlayClass}`} />

      {badge !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="absolute top-6 left-6 z-10 inline-flex items-center gap-2 rounded-full glass-strong px-3 py-1.5 text-[11px] tracking-[0.2em] uppercase text-white/90"
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-ink-deep">
            <Play size={10} fill="currentColor" />
          </span>
          {badge}
        </motion.div>
      )}

      <div className="relative h-full">{children}</div>
    </div>
  );
}
