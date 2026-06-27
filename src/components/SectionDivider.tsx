/**
 * SectionDivider — seamless curved transitions between sections.
 *
 * Place at the BOTTOM of a section. `from` = current section background,
 * `to` = next section background. The curve is filled with `to` and bleeds
 * downward so the next section's flat color extends naturally upward.
 */
type Tone =
  | "ink"
  | "ink-warm"
  | "paper"
  | "paper-soft"
  | "cream"
  | "aurora"
  | "brand"
  | "transparent";

const fillFor: Record<Tone, string> = {
  ink: "var(--ink-deep)",
  "ink-warm": "var(--ink-warm)",
  paper: "var(--paper)",
  "paper-soft": "var(--paper-soft)",
  cream: "var(--cream)",
  aurora: "var(--ink-deep)",
  brand: "#6a189a",
  transparent: "transparent",
};

export function SectionDivider({
  to,
  variant = "curve",
  flip = false,
  height = 90,
}: {
  to: Tone;
  variant?: "curve" | "wave" | "slope" | "fade";
  flip?: boolean;
  height?: number;
}) {
  const fill = fillFor[to];

  if (variant === "fade") {
    return (
      <div
        aria-hidden
        className="relative w-full pointer-events-none"
        style={{
          height,
          marginTop: -height / 2,
          background: `linear-gradient(to bottom, transparent 0%, ${fill} 100%)`,
        }}
      />
    );
  }

  const d =
    variant === "wave"
      ? "M0,40 C240,90 480,0 720,40 C960,80 1200,10 1440,50 L1440,100 L0,100 Z"
      : variant === "slope"
      ? "M0,80 L1440,10 L1440,100 L0,100 Z"
      : "M0,30 C360,100 1080,100 1440,30 L1440,100 L0,100 Z";

  return (
    <div
      aria-hidden
      className="relative w-full pointer-events-none -mt-px"
      style={{ height, transform: flip ? "scaleY(-1)" : undefined }}
    >
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full block"
      >
        <path d={d} fill={fill} />
      </svg>
    </div>
  );
}
