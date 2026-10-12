import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { Check, Copy, CheckCircle2, ArrowRight, Share2, Sparkles, RefreshCw, ExternalLink } from "lucide-react";
import tribeImg from "@/assets/ssc2026-ecard.webp";

export const Route = createFileRoute("/mobilize")({
  component: MobilizerRegisterPage,
});

const COUNTRY_CODES = [
  { code: "+234", country: "NG" },
  { code: "+233", country: "GH" },
  { code: "+254", country: "KE" },
  { code: "+27", country: "ZA" },
  { code: "+44", country: "UK" },
  { code: "+1", country: "US/CA" },
];

function MobilizerRegisterPage() {
  const [mode, setMode] = useState<"register" | "recover">("register");
  
  // Registration form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+234");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  
  // Recovery form state
  const [recoverEmail, setRecoverEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Success state
  const [result, setResult] = useState<{
    ok: boolean;
    is_existing?: boolean;
    message?: string;
    full_name?: string;
    organization?: string;
    referral_code?: string;
    referral_link?: string;
    token?: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  function validateRegister(): boolean {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Full name is required";
    if (!email.trim()) errs.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address";
    if (!phone.trim()) errs.phone = "Phone number is required";
    if (!organization.trim()) errs.organization = "Institution or organization is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmitRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!validateRegister()) return;
    setIsSubmitting(true);
    setErrors({});

    const fullPhone = `${countryCode} ${phone.trim()}`;
    const payload = {
      action: "register",
      full_name: fullName.trim(),
      email: email.trim(),
      phone: fullPhone,
      organization: organization.trim(),
    };

    try {
      if (import.meta.env.DEV) {
        try {
          const testRes = await fetch("/process-mobilizer.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const testData = await testRes.json();
          if (testData.ok) {
            setResult(testData);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
          }
        } catch {
          // Dev mock fallback
          await new Promise((r) => setTimeout(r, 800));
          const mockCode = "MOB" + Math.random().toString(36).substring(2, 8).toUpperCase();
          const mockToken = "tok_" + Math.random().toString(36).substring(2, 16);
          setResult({
            ok: true,
            is_existing: false,
            message: "Mobilizer registered successfully!",
            full_name: fullName,
            organization: organization,
            referral_code: mockCode,
            referral_link: `${window.location.origin}/conference-register?ref=${mockCode}`,
            token: mockToken,
          });
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      }

      const res = await fetch("/process-mobilizer.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to register. Please try again.");
      }
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrors({ _general: err.message || "An unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRecover(e: React.FormEvent) {
    e.preventDefault();
    if (!recoverEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoverEmail)) {
      setErrors({ recoverEmail: "Please enter a valid registered email." });
      return;
    }
    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await fetch("/process-mobilizer.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "recover", email: recoverEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "No mobilizer record found for this email.");
      }
      setResult({
        ...data,
        is_existing: true,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrors({ _recover: err.message || "Could not retrieve mobilizer link." });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCopyLink = () => {
    if (!result?.referral_link) return;
    navigator.clipboard.writeText(result.referral_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <main className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <div className="flex-1 pt-24 pb-20">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto pt-8 pb-12">
            <Reveal>
              <div className="chip mx-auto w-fit mb-4 flex items-center gap-2">
                <Sparkles size={14} className="text-purple-glow" />
                SSC 2026 Mobilization Team
              </div>
              <h1 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-white">
                Mobilize for <span className="text-gradient">The Takeover</span>
              </h1>
              <p className="mt-4 text-base text-foreground-muted leading-relaxed">
                Empower your university chapter, fellowship, church, or organization.
                Get your unique referral link, invite attendees, and track verified event-day attendance.
              </p>
            </Reveal>
          </div>

          {/* Form Card or Success Card */}
          <div className="max-w-xl mx-auto">
            {result ? (
              <Reveal>
                <div className="glass-strong rounded-3xl p-8 sm:p-10 border border-purple/30 shadow-2xl relative overflow-hidden">
                  <div className="mb-6 mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-500/15 border border-green-500/30">
                    <Check size={32} className="text-green-400" />
                  </div>

                  <h2 className="text-2xl font-bold font-display text-white text-center">
                    {result.is_existing ? "Welcome Back!" : "Mobilizer Registration Confirmed!"}
                  </h2>
                  <p className="mt-2 text-sm text-foreground-muted text-center leading-relaxed">
                    {result.organization ? `Representing: ${result.organization}` : "Your unique mobilizer link is ready to share."}
                  </p>

                  {/* Referral Link Box */}
                  <div className="mt-8 rounded-2xl bg-black/50 border border-white/10 p-5 space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-glow">
                      Your Unique Mobilizer Link
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={result.referral_link}
                        className="flex-1 rounded-xl bg-black/60 border border-white/10 px-3.5 py-2.5 text-xs text-white font-mono truncate focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="btn-primary text-xs py-2.5 px-3.5 inline-flex items-center gap-1.5 shrink-0"
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 size={14} className="text-green-300" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                      <span className="text-foreground-subtle">
                        Referral Code: <strong className="text-white font-mono">{result.referral_code}</strong>
                      </span>
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `Join us at Socially Speaking Conference 2026: The Takeover Generation! Free registration is now open: ${result.referral_link}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1"
                      >
                        <Share2 size={13} />
                        Share on WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Dashboard Access Button */}
                  {result.token && (
                    <div className="mt-6 pt-2">
                      <a
                        href={`/mobilizer-dashboard?token=${result.token}`}
                        className="btn-primary w-full py-3.5 inline-flex justify-center items-center gap-2 text-sm font-bold shadow-lg shadow-purple/20"
                      >
                        Access Your Mobilizer Dashboard
                        <ArrowRight size={16} />
                      </a>
                    </div>
                  )}

                  <p className="mt-6 text-xs text-foreground-subtle text-center leading-relaxed">
                    A confirmation email has been dispatched with your referral instructions and personal dashboard recovery link.
                  </p>
                </div>
              </Reveal>
            ) : (
              <Reveal>
                <div className="glass-strong rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl">
                  {/* Mode Selector Tabs */}
                  <div className="flex rounded-xl bg-black/40 p-1 mb-8 border border-white/5">
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                        mode === "register"
                          ? "bg-purple/20 text-white border border-purple/30 shadow-sm"
                          : "text-foreground-muted hover:text-white"
                      }`}
                    >
                      New Mobilizer Registration
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("recover")}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                        mode === "recover"
                          ? "bg-purple/20 text-white border border-purple/30 shadow-sm"
                          : "text-foreground-muted hover:text-white"
                      }`}
                    >
                      Retrieve My Link
                    </button>
                  </div>

                  {errors._general && (
                    <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 p-3.5 text-xs text-red-400">
                      {errors._general}
                    </div>
                  )}
                  {errors._recover && (
                    <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 p-3.5 text-xs text-red-400">
                      {errors._recover}
                    </div>
                  )}

                  {mode === "register" ? (
                    <form onSubmit={handleSubmitRegister} className="space-y-5" noValidate>
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Samuel Adekunle"
                          className={`w-full rounded-xl bg-white/5 border px-4 py-3 text-sm text-white placeholder:text-foreground-subtle focus:outline-none focus:border-purple ${
                            errors.fullName ? "border-red-400" : "border-white/10"
                          }`}
                        />
                        {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. samuel@example.com"
                          className={`w-full rounded-xl bg-white/5 border px-4 py-3 text-sm text-white placeholder:text-foreground-subtle focus:outline-none focus:border-purple ${
                            errors.email ? "border-red-400" : "border-white/10"
                          }`}
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                      </div>

                      {/* Institution / Organization */}
                      <div>
                        <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
                          Institution or Organization Represented *
                        </label>
                        <input
                          type="text"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder="e.g. UNILAG Law Society, RCCG Youth, etc."
                          className={`w-full rounded-xl bg-white/5 border px-4 py-3 text-sm text-white placeholder:text-foreground-subtle focus:outline-none focus:border-purple ${
                            errors.organization ? "border-red-400" : "border-white/10"
                          }`}
                        />
                        {errors.organization && <p className="mt-1 text-xs text-red-400">{errors.organization}</p>}
                      </div>

                      {/* Phone with country code */}
                      <div>
                        <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
                          Phone Number *
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="rounded-xl bg-ink-deep border border-white/10 px-3 py-3 text-sm text-white focus:outline-none focus:border-purple shrink-0"
                          >
                            {COUNTRY_CODES.map((c) => (
                              <option key={c.code} value={c.code} className="bg-ink-deep text-white">
                                {c.country} ({c.code})
                              </option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="8012345678"
                            className={`flex-1 rounded-xl bg-white/5 border px-4 py-3 text-sm text-white placeholder:text-foreground-subtle focus:outline-none focus:border-purple ${
                              errors.phone ? "border-red-400" : "border-white/10"
                            }`}
                          />
                        </div>
                        {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
                      </div>

                      <div className="pt-3">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn-primary w-full py-3.5 text-sm font-bold flex justify-center items-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <RefreshCw size={16} className="animate-spin" />
                              <span>Generating Your Link...</span>
                            </>
                          ) : (
                            <>
                              <span>Register as Mobilizer</span>
                              <ArrowRight size={16} />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleRecover} className="space-y-5" noValidate>
                      <p className="text-xs text-foreground-muted leading-relaxed">
                        Enter the email address you registered with to retrieve your unique referral link and dashboard access.
                      </p>

                      <div>
                        <label className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">
                          Your Registered Email *
                        </label>
                        <input
                          type="email"
                          value={recoverEmail}
                          onChange={(e) => setRecoverEmail(e.target.value)}
                          placeholder="e.g. samuel@example.com"
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-foreground-subtle focus:outline-none focus:border-purple"
                        />
                        {errors.recoverEmail && <p className="mt-1 text-xs text-red-400">{errors.recoverEmail}</p>}
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn-primary w-full py-3.5 text-sm font-bold flex justify-center items-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <RefreshCw size={16} className="animate-spin" />
                              <span>Retrieving...</span>
                            </>
                          ) : (
                            <>
                              <span>Retrieve Link & Dashboard</span>
                              <ArrowRight size={16} />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
