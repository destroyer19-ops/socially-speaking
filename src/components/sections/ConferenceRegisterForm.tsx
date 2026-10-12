import { useState, useEffect } from "react";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { ArrowRight, Check, Send, ExternalLink, Copy, CheckCircle2, Share2, QrCode } from "lucide-react";
import tribeImg from "@/assets/ssc2026-ecard.webp";

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  age_range: string;
  gender: string;
  state_country: string;
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
  state_country: "",
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
  "Socially Speaking: Campus Chapter",
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
  const [whatsappGroupLink, setWhatsappGroupLink] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState<string>("");
  const [referralCode, setReferralCode] = useState<string>("");
  const [registrationId, setRegistrationId] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Preserve first-touch referral attribution
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const refParam = searchParams.get("ref");
      if (refParam && refParam.trim()) {
        const cleanRef = refParam.trim().toUpperCase();
        const existingRef = localStorage.getItem("ssc_referral_code");
        // Only set if not already set (first-touch rule)
        if (!existingRef) {
          localStorage.setItem("ssc_referral_code", cleanRef);
        }
      }
    } catch {
      // ignore storage access restrictions
    }
  }, []);

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
    if (!formData.state_country.trim()) newErrors.state_country = "State / Country is required";
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

    const refCode = localStorage.getItem("ssc_referral_code") || "";
    const payload = {
      ...formData,
      ref: refCode,
    };

    try {
      if (import.meta.env.DEV) {
        // Fallback simulation in dev environment if php-cgi is not running
        try {
          const testRes = await fetch("/process-ssc2026.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const testData = await testRes.json();
          if (testData.ok) {
            setRegistrationId(testData.id || "SSC26-DEV0001");
            setQrCodeUrl(testData.qr_code_url || "");
            setReferralCode(testData.referral_code || "REFDEV01");
            setReferralLink(testData.referral_link || `${window.location.origin}/conference-register?ref=REFDEV01`);
            setWhatsappGroupLink(testData.whatsapp_group_link || "https://chat.whatsapp.com/EJ1DMJwBvr8JpSzhFk1btV?s=cl&p=i&mlu=4&ilr=4");
            setSubmitSuccess(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
          }
        } catch {
          // Fall through to mock in dev
          await new Promise((resolve) => setTimeout(resolve, 800));
          const mockRef = "REF" + Math.random().toString(36).substring(2, 8).toUpperCase();
          const mockId = "SSC26-" + Math.random().toString(36).substring(2, 10).toUpperCase();
          setRegistrationId(mockId);
          setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?data=${mockId}&size=300x300&format=png&margin=10`);
          setReferralCode(mockRef);
          setReferralLink(`${window.location.origin}/conference-register?ref=${mockRef}`);
          setWhatsappGroupLink("https://chat.whatsapp.com/EJ1DMJwBvr8JpSzhFk1btV?s=cl&p=i&mlu=4&ilr=4");
          setSubmitSuccess(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      }

      const res = await fetch("/process-ssc2026.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok && !data.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setRegistrationId(data.id || "");
      setQrCodeUrl(data.qr_code_url || "");
      setReferralCode(data.referral_code || "");
      const fullRefLink = data.referral_link || (data.referral_code ? `${window.location.origin}/conference-register?ref=${data.referral_code}` : "");
      setReferralLink(fullRefLink);
      setWhatsappGroupLink(data.whatsapp_group_link ?? null);
      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrors({ _general: err.message || "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (submitSuccess) {
    return (
      <section className="relative min-h-screen bg-ink-deep flex items-center justify-center px-4 py-24">
        <div className="max-w-xl mx-auto w-full text-center">
          <div className="mb-6 mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-500/15 border border-green-500/30">
            <Check size={32} className="text-green-400" />
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white">
            Registration Successful! 🎉
          </h2>
          <p className="mt-3 text-foreground-muted text-base leading-relaxed">
            You're officially registered for SSC 2026: The Takeover Generation.
          </p>

          {/* Registration Details & QR Code */}
          <div className="mt-8 glass-strong rounded-3xl p-6 sm:p-8 border border-white/10 text-left space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-glow">Your Registration ID</span>
                <p className="font-mono font-black text-2xl text-white tracking-wide">{registrationId}</p>
                <p className="text-xs text-foreground-muted mt-1">Saturday, 5 December 2026</p>
              </div>
              {qrCodeUrl && (
                <div className="p-2 bg-white rounded-xl shadow-lg shrink-0">
                  <img
                    src={qrCodeUrl}
                    alt={`Entry QR Code for ${registrationId}`}
                    className="w-24 h-24 object-contain"
                  />
                </div>
              )}
            </div>

            <p className="text-xs text-foreground-subtle leading-relaxed">
              A copy of your registration details, QR entry pass, and referral link has been sent to your email. Present your QR code at the desk on event day.
            </p>

            {/* Referral Mobilization Card */}
            {referralLink && (
              <div className="rounded-2xl bg-gradient-to-br from-purple/15 to-blue-glow/10 border border-purple/30 p-5 space-y-3">
                <div className="flex items-center gap-2 text-purple-300">
                  <Share2 size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Your Referral Link</span>
                </div>
                <p className="text-sm text-white font-medium">
                  Invite friends, classmates, and colleagues to join you at SSC 2026!
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-1 rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs text-foreground font-mono truncate focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="btn-primary text-xs py-2 px-3 inline-flex items-center gap-1.5 shrink-0"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 size={14} className="text-green-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="pt-1 flex gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `I just registered for SSC 2026: The Takeover Generation! Join me on Saturday, Dec 5, 2026. Register for free here: ${referralLink}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand hover:underline inline-flex items-center gap-1"
                  >
                    Share directly on WhatsApp →
                  </a>
                </div>
              </div>
            )}

            {/* WhatsApp Group Join Button */}
            {whatsappGroupLink ? (
              <div className="pt-2">
                <p className="text-xs text-foreground-muted mb-3">
                  Join your assigned SSC 2026 Attendees WhatsApp Group to receive official conference announcements:
                </p>
                <a
                  href={whatsappGroupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full group inline-flex justify-center items-center gap-2 py-3.5"
                >
                  Join SSC 2026 Attendees Group
                  <ExternalLink size={16} />
                </a>
              </div>
            ) : null}
          </div>
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
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-20">
          <Reveal>
            <div className="chip mb-6">The Takeover Generation</div>
            <h1 className="mt-6 font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.0]">
              Socially Speaking <span className="text-gradient">Conference 2026</span>
            </h1>
            <p className="mt-4 text-foreground-muted text-lg max-w-xl">
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

              {/* State / Country */}
              <div>
                <FieldLabel required>State / Country</FieldLabel>
                <TextInput
                  name="state_country"
                  value={formData.state_country}
                  onChange={handleInput}
                  placeholder="e.g. Lagos, Nigeria"
                  error={errors.state_country}
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
        <Reveal className="mt-6">
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
