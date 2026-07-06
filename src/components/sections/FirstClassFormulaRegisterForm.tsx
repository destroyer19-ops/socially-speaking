import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Check, Clock3, Sparkles, Video } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import webinarImg from "@/assets/generated/webinar-poster.jpg";

interface FormData {
  full_name: string;
  email: string;
  whatsapp_number: string;
  age_range: string;
  university: string;
  academic_level: string;
  biggest_challenge: string;
  most_to_learn: string;
  heard_about: string;
}

const initialData: FormData = {
  full_name: "",
  email: "",
  whatsapp_number: "",
  age_range: "",
  university: "",
  academic_level: "",
  biggest_challenge: "",
  most_to_learn: "",
  heard_about: "",
};

const AGE_RANGES = ["15–17", "18–20", "21–23", "24+"];
const ACADEMIC_LEVELS = [
  "Incoming Student / Fresher",
  "100 Level",
  "200 Level",
  "300 Level",
  "400 Level",
  "500 Level+",
  "Other",
];
const HEARD_ABOUT = [
  "Socially Speaking Community",
  "Instagram",
  "WhatsApp",
  "TikTok",
  "A Speaker",
  "Friend / Referral",
  "School / Campus Community",
  "Church",
  "Other",
];

function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-2 block text-sm font-medium text-foreground">
      {children}
      {required && <span className="ml-1 text-red-400">*</span>}
    </label>
  );
}

function TextInput({
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}: {
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-xl border px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-foreground-subtle ${
          error ? "border-red-400" : "border-white/10 focus:border-purple bg-white/5"
        }`}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function Textarea({
  name,
  value,
  onChange,
  placeholder,
  error,
}: {
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className={`w-full resize-none rounded-xl border px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-foreground-subtle ${
          error ? "border-red-400" : "border-white/10 focus:border-purple bg-white/5"
        }`}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function ChoiceGroup({
  options,
  name,
  value,
  onChange,
  error,
}: {
  options: string[];
  name: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const checked = value === opt;
          return (
            <label
              key={opt}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                checked
                  ? "border-purple bg-brand/15 text-white"
                  : "border-white/10 bg-white/5 text-foreground-muted hover:border-white/25"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={opt}
                checked={checked}
                onChange={() => onChange(opt)}
                className="sr-only"
              />
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                  checked ? "border-purple bg-purple" : "border-white/30"
                }`}
              >
                {checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <span className="text-sm">{opt}</span>
            </label>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function FirstClassFormulaRegisterForm() {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInput = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleChoice = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) nextErrors.full_name = "Full name is required";
    if (!formData.email.trim()) nextErrors.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Enter a valid email address";
    }
    if (!formData.whatsapp_number.trim()) {
      nextErrors.whatsapp_number = "WhatsApp number is required";
    }
    if (!formData.age_range) nextErrors.age_range = "Please select your age range";
    if (!formData.university.trim()) nextErrors.university = "University is required";
    if (!formData.academic_level) {
      nextErrors.academic_level = "Please select your current academic level";
    }
    if (!formData.biggest_challenge.trim()) {
      nextErrors.biggest_challenge = "Tell us your biggest academic challenge";
    }
    if (!formData.most_to_learn.trim()) {
      nextErrors.most_to_learn = "Tell us what you most want to learn";
    }
    if (!formData.heard_about) nextErrors.heard_about = "Please tell us how you heard about us";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("process-first-class-formula.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrors({ _general: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-ink-deep px-4 py-20">
        <div className="pointer-events-none absolute left-[10%] top-[-10%] h-[380px] w-[380px] rounded-full bg-purple/20 blur-[120px]" />
        <div className="pointer-events-none absolute right-[5%] bottom-[-15%] h-[340px] w-[340px] rounded-full bg-blue-glow/20 blur-[120px]" />

        <div className="relative mx-auto max-w-xl text-center">
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full border border-green-500/30 bg-green-500/15">
            <Check size={36} className="text-green-400" />
          </div>
          <h2 className="font-display text-3xl font-black text-white sm:text-4xl">
            Your spot has been secured.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-foreground-muted">
            We have received your registration for The First Class Formula. We&apos;ll send the Zoom
            details and event reminders to your email and WhatsApp number.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/" className="btn-primary inline-flex">
              Back to homepage
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-ink-deep">
      <div className="pointer-events-none absolute left-[10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-purple/20 blur-[130px]" />
      <div className="pointer-events-none absolute right-[6%] top-[12%] h-[360px] w-[360px] rounded-full bg-blue-glow/20 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-24">
        <Reveal>
          <SectionLabel>Free Academic Success Webinar</SectionLabel>
          <div className="mt-6 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="space-y-8">
              <div className="max-w-2xl">
                <h1 className="font-display text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-6xl">
                  The First Class Formula
                </h1>
                <p className="mt-5 text-lg leading-relaxed text-foreground-muted">
                  Your First Class journey starts long before final year. This free webinar is for
                  incoming and current university students who want to start strong, navigate
                  university with the right strategies, and excel academically.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-foreground-muted">
                  Learn directly from First Class graduates as they share the systems, decisions,
                  lessons and practical strategies that helped them succeed.
                </p>
              </div>

              <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-2xl">
                <img
                  src={webinarImg}
                  alt="The First Class Formula webinar e-card"
                  className="block w-full object-cover"
                />
                <div className="border-t border-white/10 px-5 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                    Webinar E-card
                  </p>
                  <p className="mt-1 text-sm text-white/80">
                    Thursday, 17 September 2026 · 7:00 PM GMT+1 · Zoom
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: CalendarDays, label: "Date", value: "Thursday, 17 September 2026" },
                  { icon: Clock3, label: "Time", value: "7:00 PM GMT+1" },
                  { icon: Video, label: "Venue", value: "Zoom" },
                  { icon: Sparkles, label: "Attendance", value: "FREE" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                  >
                    <div className="flex items-center gap-3 text-white/90">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white">
                        <item.icon size={18} />
                      </span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm font-semibold">{item.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0c1127] via-[#111a3a] to-[#1c1025] p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#cbd5ff]">
                      Ecard / Event Brief
                    </p>
                    <h2 className="mt-3 max-w-sm font-display text-2xl font-black text-white">
                      Start university with a formula for excellence.
                    </h2>
                    <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75">
                      If you are in 100 level, incoming, or already on the journey, this session
                      will help you build the habits and systems that support a first-class outcome.
                    </p>
                  </div>
                  <div className="hidden shrink-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right sm:block">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                      Attendance
                    </p>
                    <p className="mt-2 text-2xl font-black text-white">Free</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    "First Class graduates sharing real systems",
                    "Practical strategies for university success",
                    "Actionable guidance you can use immediately",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8 shadow-2xl backdrop-blur">
              <h2 className="font-display text-2xl font-bold text-white">
                Registration Information
              </h2>
              <p className="mt-2 text-sm text-foreground-muted">
                Please fill this form to secure your spot.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
                {errors._general && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {errors._general}
                  </div>
                )}

                <div>
                  <FieldLabel required>Full Name</FieldLabel>
                  <TextInput
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInput}
                    placeholder="Enter your full name"
                    error={errors.full_name}
                  />
                </div>

                <div>
                  <FieldLabel required>Email Address</FieldLabel>
                  <TextInput
                    name="email"
                    value={formData.email}
                    onChange={handleInput}
                    placeholder="you@example.com"
                    type="email"
                    error={errors.email}
                  />
                </div>

                <div>
                  <FieldLabel required>WhatsApp Number</FieldLabel>
                  <TextInput
                    name="whatsapp_number"
                    value={formData.whatsapp_number}
                    onChange={handleInput}
                    placeholder="e.g. +2348012345678"
                    type="tel"
                    error={errors.whatsapp_number}
                  />
                </div>

                <div>
                  <FieldLabel required>Age Range</FieldLabel>
                  <ChoiceGroup
                    options={AGE_RANGES}
                    name="age_range"
                    value={formData.age_range}
                    onChange={(v) => handleChoice("age_range", v)}
                    error={errors.age_range}
                  />
                </div>

                <div>
                  <FieldLabel required>University / Intended University</FieldLabel>
                  <TextInput
                    name="university"
                    value={formData.university}
                    onChange={handleInput}
                    placeholder="Your university or intended university"
                    error={errors.university}
                  />
                </div>

                <div>
                  <FieldLabel required>Current Academic Level</FieldLabel>
                  <ChoiceGroup
                    options={ACADEMIC_LEVELS}
                    name="academic_level"
                    value={formData.academic_level}
                    onChange={(v) => handleChoice("academic_level", v)}
                    error={errors.academic_level}
                  />
                </div>

                <div>
                  <FieldLabel required>
                    What is your biggest academic challenge or concern right now?
                  </FieldLabel>
                  <Textarea
                    name="biggest_challenge"
                    value={formData.biggest_challenge}
                    onChange={handleInput}
                    placeholder="Short answer"
                    error={errors.biggest_challenge}
                  />
                </div>

                <div>
                  <FieldLabel required>
                    What would you most like to learn from The First Class Formula?
                  </FieldLabel>
                  <Textarea
                    name="most_to_learn"
                    value={formData.most_to_learn}
                    onChange={handleInput}
                    placeholder="Short answer"
                    error={errors.most_to_learn}
                  />
                </div>

                <div>
                  <FieldLabel required>How did you hear about The First Class Formula?</FieldLabel>
                  <ChoiceGroup
                    options={HEARD_ABOUT}
                    name="heard_about"
                    value={formData.heard_about}
                    onChange={(v) => handleChoice("heard_about", v)}
                    error={errors.heard_about}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-[#10183a] transition-colors hover:bg-[#e5e7eb] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#10183a]/20 border-t-[#10183a]" />
                      Submitting...
                    </span>
                  ) : (
                    <>
                      Secure My Spot
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-8 text-center">
          <p className="text-sm text-foreground-subtle">
            If you need help with registration, reach out via the Socially Speaking community
            channels.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
