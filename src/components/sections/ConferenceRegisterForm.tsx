import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { ArrowRight, Check, Send, ExternalLink } from "lucide-react";
import tribeImg from "@/assets/ssc4.JPG";

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  age_range: string;
  gender: string;
  city_state: string;
  school_org: string;
  occupation: string;
  how_heard: string;
  attended_before: string;
  editions_attended: string[];
  hoping_to_gain: string;
}

const initialData: FormData = {
  full_name: "",
  email: "",
  phone: "",
  whatsapp: "",
  age_range: "",
  gender: "",
  city_state: "",
  school_org: "",
  occupation: "",
  how_heard: "",
  attended_before: "",
  editions_attended: [],
  hoping_to_gain: "",
};

const AGE_RANGES = ["Under 18", "18–21", "22–25", "26–30", "31–35", "36+"];
const GENDERS = ["Female", "Male"];
const HOW_HEARD = [
  "Instagram / Social Media",
  "WhatsApp",
  "Friend or Family",
  "Socially Speaking Community",
  "Church / School / Organisation",
  "Others",
];
const EDITIONS = [
  "2024: Mastering the Art of Personal Excellence",
  "2025: The Takeover Conference",
  "This will be my first",
];
const OCCUPATIONS = ["Student", "Employed", "Entrepreneur", "Creative", "Other"];

function RadioGroup({
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
      <div className="grid sm:grid-cols-2 gap-2">
        {options.map((opt) => (
          <label
            key={opt}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer border transition-all ${
              value === opt
                ? "bg-brand/15 border-purple text-white"
                : "glass-strong border-white/10 text-foreground-muted hover:border-white/25"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="sr-only"
            />
            <span
              className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                value === opt ? "border-purple bg-purple" : "border-white/30"
              }`}
            >
              {value === opt && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
            </span>
            <span className="text-sm">{opt}</span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function CheckboxGroup({
  options,
  name,
  values,
  onChange,
  error,
}: {
  options: string[];
  name: string;
  values: string[];
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-2">
        {options.map((opt) => {
          const checked = values.includes(opt);
          return (
            <label
              key={opt}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer border transition-all ${
                checked
                  ? "bg-brand/15 border-purple text-white"
                  : "glass-strong border-white/10 text-foreground-muted hover:border-white/25"
              }`}
            >
              <input
                type="checkbox"
                name={name}
                value={opt}
                checked={checked}
                onChange={() => onChange(opt)}
                className="sr-only"
              />
              <span
                className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 ${
                  checked ? "border-purple bg-purple" : "border-white/30"
                }`}
              >
                {checked && <Check size={10} className="text-white" />}
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

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-foreground mb-2">
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
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
        className={`w-full rounded-xl glass-strong border px-4 py-3 text-sm text-white placeholder:text-foreground-subtle focus:outline-none focus:border-purple transition-colors ${
          error ? "border-red-400" : "border-white/10 focus:border-purple"
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
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
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
        className={`w-full rounded-xl glass-strong border px-4 py-3 text-sm text-white placeholder:text-foreground-subtle focus:outline-none focus:border-purple transition-colors resize-none ${
          error ? "border-red-400" : "border-white/10 focus:border-purple"
        }`}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function ConferenceRegisterForm() {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [sameAsPhone, setSameAsPhone] = useState(false);

  function handleInput(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
    }
  }

  function handleRadio(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  }

  function handleEditions(edition: string) {
    setFormData((prev) => {
      const current = prev.editions_attended.includes(edition)
        ? prev.editions_attended.filter((e) => e !== edition)
        : [...prev.editions_attended, edition];
      return { ...prev, editions_attended: current };
    });
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) newErrors.full_name = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Enter a valid email address";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.whatsapp.trim()) newErrors.whatsapp = "WhatsApp number is required";
    if (!formData.age_range) newErrors.age_range = "Please select your age range";
    if (!formData.gender) newErrors.gender = "Please select your gender";
    if (!formData.city_state.trim()) newErrors.city_state = "City / State is required";
    if (!formData.school_org.trim())
      newErrors.school_org = "School / University / Organisation is required";
    if (!formData.occupation) newErrors.occupation = "Please select your occupation";
    if (!formData.how_heard) newErrors.how_heard = "Please tell us how you heard about SSC";
    if (!formData.attended_before) newErrors.attended_before = "Please answer this question";
    if (!formData.hoping_to_gain.trim())
      newErrors.hoping_to_gain = "Please share what you hope to gain";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/process-ssc2026.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrors({ _general: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitSuccess) {
    return (
      <section className="relative min-h-screen bg-ink-deep flex items-center justify-center px-4 py-24">
        <div className="text-center max-w-lg mx-auto">
          <div className="mx-auto mb-8 grid h-20 w-20 place-items-center rounded-full bg-green-500/15 border border-green-500/30">
            <Check size={36} className="text-green-400" />
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white">
            Thank you for registering for Socially Speaking Conference 2026.
          </h2>
          <p className="mt-5 text-foreground-muted text-lg leading-relaxed">
            Your registration has been received. Further information about the conference will be
            sent to your email shortly.
          </p>
          <p className="mt-4 text-foreground-muted leading-relaxed">
            To receive important conference updates, announcements, and information leading up to
            the event, join the official SSC 2026 WhatsApp community.
          </p>
          <a
            href="https://chat.whatsapp.com/ssc2026"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 btn-primary group inline-flex"
          >
            Join the WhatsApp Community
            <ExternalLink size={16} className="ml-2" />
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-ink-deep overflow-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-[10%] h-[420px] w-[420px] rounded-full bg-purple/20 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-15%] right-[5%] h-[400px] w-[400px] rounded-full bg-blue-glow/20 blur-[130px]"
      />

      {/* Hero intro */}
      <div className="relative">
        <img
          src={tribeImg}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-deep/50 to-ink-deep" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-20 text-center">
          <Reveal>
            <div className="chip mx-auto">The Takeover Generation</div>
            <h1 className="mt-6 font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.0]">
              Socially Speaking <span className="text-gradient">Conference 2026</span>
            </h1>
            <p className="mt-4 text-foreground-muted text-lg max-w-xl mx-auto">
              Saturday, December 5, 2026
            </p>
            <p className="mt-2 text-foreground-muted">Registration is now open.</p>
          </Reveal>
        </div>
      </div>

      {/* Form */}
      <div className="relative mx-auto max-w-2xl px-4 sm:px-6 pb-24">
        <Reveal>
          <div className="glass-strong rounded-3xl p-8 sm:p-10 border border-white/10">
            <h2 className="font-display font-bold text-2xl text-white mb-8">
              Registration Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-7" noValidate>
              {/* General error */}
              {errors._general && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                  {errors._general}
                </div>
              )}

              {/* Full Name */}
              <div>
                <FieldLabel required>Full Name</FieldLabel>
                <TextInput
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInput}
                  placeholder="Your full name"
                  error={errors.full_name}
                />
              </div>

              {/* Email */}
              <div>
                <FieldLabel required>Email Address</FieldLabel>
                <TextInput
                  name="email"
                  value={formData.email}
                  onChange={handleInput}
                  placeholder="your@email.com"
                  type="email"
                  error={errors.email}
                />
              </div>

              {/* Phone & WhatsApp */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel required>Calling Phone Number</FieldLabel>
                  <TextInput
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      handleInput(e);
                      if (sameAsPhone) {
                        setFormData((prev) => ({ ...prev, whatsapp: e.target.value }));
                      }
                    }}
                    placeholder="e.g. +234..."
                    type="tel"
                    error={errors.phone}
                  />
                </div>
                <div>
                  <FieldLabel required>WhatsApp Number</FieldLabel>
                  <TextInput
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => {
                      handleInput(e);
                      if (sameAsPhone) setSameAsPhone(false);
                    }}
                    placeholder="e.g. +234..."
                    type="tel"
                    error={errors.whatsapp}
                  />
                  <label className="mt-3 flex items-center gap-2 cursor-pointer text-sm text-foreground-muted hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSameAsPhone(checked);
                        if (checked) {
                          setFormData((prev) => ({ ...prev, whatsapp: prev.phone }));
                        }
                      }}
                      className="rounded border-white/20 bg-transparent text-purple focus:ring-purple/50 focus:ring-offset-0 h-4 w-4"
                    />
                    Same as calling number
                  </label>
                </div>
              </div>

              {/* Age */}
              <div>
                <FieldLabel required>Age</FieldLabel>
                <RadioGroup
                  options={AGE_RANGES}
                  name="age_range"
                  value={formData.age_range}
                  onChange={(v) => handleRadio("age_range", v)}
                  error={errors.age_range}
                />
              </div>

              {/* Gender */}
              <div>
                <FieldLabel required>Gender</FieldLabel>
                <RadioGroup
                  options={GENDERS}
                  name="gender"
                  value={formData.gender}
                  onChange={(v) => handleRadio("gender", v)}
                  error={errors.gender}
                />
              </div>

              {/* City / State */}
              <div>
                <FieldLabel required>City / State</FieldLabel>
                <TextInput
                  name="city_state"
                  value={formData.city_state}
                  onChange={handleInput}
                  placeholder="e.g. Lagos, Nigeria"
                  error={errors.city_state}
                />
              </div>

              {/* School / University / Organisation */}
              <div>
                <FieldLabel required>School / University / Organisation</FieldLabel>
                <TextInput
                  name="school_org"
                  value={formData.school_org}
                  onChange={handleInput}
                  placeholder="Your school, university, or organisation"
                  error={errors.school_org}
                />
              </div>

              {/* Occupation */}
              <div>
                <FieldLabel required>Occupation / Current Status</FieldLabel>
                <RadioGroup
                  options={OCCUPATIONS}
                  name="occupation"
                  value={formData.occupation}
                  onChange={(v) => handleRadio("occupation", v)}
                  error={errors.occupation}
                />
              </div>

              {/* How did you hear */}
              <div>
                <FieldLabel required>
                  How did you hear about Socially Speaking Conference?
                </FieldLabel>
                <RadioGroup
                  options={HOW_HEARD}
                  name="how_heard"
                  value={formData.how_heard}
                  onChange={(v) => handleRadio("how_heard", v)}
                  error={errors.how_heard}
                />
              </div>

              {/* Attended before */}
              <div>
                <FieldLabel required>
                  Have you attended a Socially Speaking Conference before?
                </FieldLabel>
                <RadioGroup
                  options={["Yes", "No"]}
                  name="attended_before"
                  value={formData.attended_before}
                  onChange={(v) => handleRadio("attended_before", v)}
                  error={errors.attended_before}
                />
              </div>

              {/* Which editions */}
              <div>
                <FieldLabel>Which Socially Speaking Conference have you attended?</FieldLabel>
                <CheckboxGroup
                  options={EDITIONS}
                  name="editions_attended"
                  values={formData.editions_attended}
                  onChange={handleEditions}
                />
              </div>

              {/* Hoping to gain */}
              <div>
                <FieldLabel required>What are you hoping to gain from SSC 2026?</FieldLabel>
                <Textarea
                  name="hoping_to_gain"
                  value={formData.hoping_to_gain}
                  onChange={handleInput}
                  placeholder="Share your expectations and goals for this conference..."
                  error={errors.hoping_to_gain}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary group justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Submitting…
                  </span>
                ) : (
                  <>
                    Register for SSC 2026
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>
          </div>
        </Reveal>

        {/* For more information */}
        <Reveal className="mt-6 text-center">
          <p className="text-sm text-foreground-subtle">
            For more information:{" "}
            <a
              href="https://instagram.com/sociallyspeaking.tribe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue hover:text-purple transition-colors"
            >
              @sociallyspeaking.tribe
            </a>{" "}
            on Instagram
          </p>
        </Reveal>
      </div>
    </section>
  );
}
