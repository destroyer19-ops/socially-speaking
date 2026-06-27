export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="chip">
      <span className="h-1.5 w-1.5 rounded-full bg-blue-glow shadow-[0_0_12px_2px_rgba(86,160,255,0.8)]" />
      {children}
    </span>
  );
}
