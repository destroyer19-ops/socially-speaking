/**
 * ImageMarquee — full-bleed scrolling photo strip.
 * Renders a duplicated row so the marquee keyframe wraps seamlessly.
 */
export function ImageMarquee({
  images,
  height = "h-[260px] sm:h-[340px]",
  reverse = false,
  speed = "marquee",
}: {
  images: string[];
  height?: string;
  reverse?: boolean;
  speed?: "marquee" | "marquee-slow";
}) {
  const row = [...images, ...images];
  return (
    <div className={`relative w-full overflow-hidden ${height}`}>
      <div
        className={`flex gap-4 w-max h-full ${speed}`}
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {row.map((src, i) => (
          <div
            key={i}
            className="relative h-full aspect-[4/5] sm:aspect-[3/4] shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10"
          >
            <img
              src={src}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
