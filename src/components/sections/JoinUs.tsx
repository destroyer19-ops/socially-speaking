import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { ArrowRight, Check } from "lucide-react";
import { z } from "zod";
import crowdImg from "@/assets/crowd-cheering.jpg";

const schema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(80),
  email: z.string().trim().email("Valid email please").max(160),
  interest: z.string().min(1, "Pick one"),
  message: z.string().trim().max(800).optional(),
});

const interests = [
  "The Tribe",
  "Campus Chapter",
  "Conference 2026 Waiting List",
  "Outreach / Volunteer",
  "Sponsor / Partner",
  "Newsletter",
];

export function JoinUs() {
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    const res = schema.safeParse(data);
    if (!res.success) {
      const errs: Record<string, string> = {};
      for (const issue of res.error.issues) {
        errs[String(issue.path[0])] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    setPending(true);
    setTimeout(() => {
      setPending(false);
      setDone(true);
    }, 800);
  }

  return (
    <section id="join" className="relative  overflow-hidden">
      {/* Full-bleed photographic backdrop */}
      <img src={crowdImg} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover ken-burns" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_30%_20%,rgba(106,24,154,0.65),transparent),linear-gradient(to_bottom,rgba(6,9,26,0.85),rgba(6,9,26,0.95))]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
          <Reveal>
            <SectionLabel>Join Us</SectionLabel>
            <h2 className="mt-5 font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.02]">
              Become the <span className="text-gradient">standard</span>.
              Be the difference.
            </h2>
            <p className="mt-5 text-foreground-muted text-lg leading-relaxed">
              Whether you're joining the Tribe, signing up for the 2026
              Conference waiting list, starting a campus chapter, supporting
              an outreach, or partnering with us — this is your front door.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "A community of 1,000+ young African leaders",
                "Weekly growth programs & mentorship",
                "First access to Conference 2026",
              ].map((b) => (
                <div key={b} className="flex items-center gap-3 text-sm text-foreground/90">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-brand text-white">
                    <Check size={12} />
                  </span>
                  {b}
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            {done ? (
              <div className="glass-strong rounded-3xl p-10 text-center min-h-[420px] grid place-items-center">
                <div>
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand text-white text-2xl">
                    ✓
                  </div>
                  <h3 className="mt-5 font-display font-black text-2xl">You're in.</h3>
                  <p className="mt-2 text-foreground-muted max-w-sm mx-auto">
                    We'll be in touch shortly with next steps. Welcome to the
                    movement.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="glass-strong rounded-3xl p-7 sm:p-8 space-y-5">
                <Field label="Full name" name="name" error={errors.name}>
                  <input name="name" type="text" placeholder="Adaeze Okeke" className="input" maxLength={80} />
                </Field>
                <Field label="Email" name="email" error={errors.email}>
                  <input name="email" type="email" placeholder="you@example.com" className="input" maxLength={160} />
                </Field>
                <Field label="What brings you here?" name="interest" error={errors.interest}>
                  <select name="interest" defaultValue="" className="input">
                    <option value="" disabled>Choose one…</option>
                    {interests.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Anything we should know? (optional)" name="message" error={errors.message}>
                  <textarea name="message" rows={3} placeholder="A line or two…" className="input resize-none" maxLength={800} />
                </Field>
                <button type="submit" disabled={pending} className="btn-primary w-full justify-center group">
                  {pending ? "Sending…" : "Count me in"}
                  {!pending && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
                </button>
                <p className="text-[11px] text-foreground-subtle text-center">
                  By submitting you agree to be contacted by Socially Speaking.
                </p>
              </form>
            )}
          </Reveal>
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.12);
          color: var(--foreground);
          border-radius: 14px;
          padding: 0.85rem 1rem;
          font-size: 0.95rem;
          transition: border-color 200ms, background 200ms, box-shadow 200ms;
          outline: none;
        }
        .input::placeholder { color: var(--foreground-subtle); }
        .input:focus {
          border-color: rgba(86,160,255,0.6);
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 4px rgba(86,160,255,0.12);
        }
        select.input option { background: #0b1024; color: #fff; }
      `}</style>
    </section>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={name} className="block">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs tracking-[0.15em] uppercase text-foreground-subtle">{label}</span>
        {error && <span className="text-[11px] text-flame">{error}</span>}
      </div>
      {children}
    </label>
  );
}
