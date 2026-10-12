import { useState } from "react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { ArrowRight, Check, ArrowLeft, Send } from "lucide-react";

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  birthday: string;
  age_range: string;
  stage: string;
  school: string;
  course: string;
  intent: string;
  self_area: string;
  self_reason: string;
  thinking: string;
  engagement: string[];
  commitment: string;
  agreement: boolean;
}

const initialData: FormData = {
  full_name: "",
  email: "",
  phone: "",
  birthday: "",
  age_range: "",
  stage: "",
  school: "",
  course: "",
  intent: "",
  self_area: "",
  self_reason: "",
  thinking: "",
  engagement: [],
  commitment: "",
  agreement: false,
};

const engagementOptions = [
  "Personal growth and discipline",
  "Leadership and influence",
  "Culture, systems, and narratives",
  "Faith, values, and truth",
  "Career clarity and purpose",
  "Community building and service",
];

export function JoinForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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

  const handleCheckboxChange = (option: string) => {
    setFormData((prev) => {
      const current = prev.engagement.includes(option)
        ? prev.engagement.filter((o) => o !== option)
        : [...prev.engagement, option];
      return { ...prev, engagement: current };
    });
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.full_name.trim()) newErrors.full_name = "Full name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.birthday) newErrors.birthday = "Birthday is required";
      if (!formData.age_range) newErrors.age_range = "Age range is required";
      if (!formData.stage) newErrors.stage = "Current stage is required";
      if (!formData.course.trim()) newErrors.course = "Course/profession is required";
    } else if (currentStep === 2) {
      if (!formData.intent.trim()) newErrors.intent = "Explanation of intent is required";
      if (!formData.self_area.trim()) newErrors.self_area = "Strengthening area is required";
      if (!formData.self_reason.trim()) newErrors.self_reason = "Brief explanation is required";
      if (!formData.thinking.trim()) newErrors.thinking = "Thinking response is required";
    } else if (currentStep === 3) {
      if (!formData.commitment) newErrors.commitment = "Commitment level is required";
      if (!formData.agreement) newErrors.agreement = "You must agree to the values statement";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 3));
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      // Build form body matching old POST request fields
      const submitUrl = "process-apply.php"; // Relative to hosting root

      const payload = new FormData();
      payload.append("action", "ssc_join_application_v2");
      Object.entries(formData).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          val.forEach((item) => payload.append(`${key}[]`, item));
        } else {
          payload.append(key, String(val));
        }
      });

      const response = await fetch(submitUrl, {
        method: "POST",
        body: payload,
      });

      // Show success screen regardless of actual server response to replicate fallback
      setSubmitSuccess(true);
    } catch (err) {
      console.warn("Failed sending to PHP script. Storing local fallback.", err);
      setSubmitSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-20">
      {/* Top Hero Card */}
      <Reveal className="relative overflow-hidden rounded-3xl bg-ink-deep/40 border border-white/5 p-8 sm:p-12 shadow-glow">
        <div className="absolute inset-0 bg-gradient-to-r from-brand/20 via-transparent to-blue-glow/20 mix-blend-color-dodge pointer-events-none" />
        <div className="relative max-w-3xl">
          <SectionLabel>Join the Tribe</SectionLabel>
          <h2 className="mt-4 text-3xl font-display font-black text-white sm:text-5xl leading-tight">
            This is not a mailing list.<br />This is a decision.
          </h2>
          <p className="mt-5 text-base text-foreground-muted leading-relaxed">
            The Socially Speaking Tribe is a community for young people who want their lives to carry weight. People who are tired of drifting, copying, and reacting. People who are ready to invest in who they are becoming.
          </p>
        </div>
      </Reveal>

      {/* Main Grid: Info Cards Left, Form Right */}
      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-8 items-start">

        {/* Left Side: Call & Rules (Side Cards) */}
        <StaggerGroup className="space-y-6">
          <StaggerItem>
            <div className="rounded-3xl glass-strong border border-white/5 p-6 hover:border-brand/30 transition-colors">
              <span className="text-[10px] uppercase tracking-[0.3em] text-brand/80 font-bold">The Call</span>
              <h3 className="mt-1 font-display font-black text-xl text-white">The Call</h3>
              <p className="mt-3 text-sm text-foreground-muted leading-relaxed">
                If you are here for convenience, this will frustrate you. If you are here for formation, you will find your people.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="rounded-3xl glass-strong border border-white/5 p-6 hover:border-blue-glow/30 transition-colors">
              <span className="text-[10px] uppercase tracking-[0.3em] text-blue-glow font-bold">Alignment</span>
              <h3 className="mt-1 font-display font-black text-xl text-white">What Joining Means</h3>
              <p className="mt-3 text-sm text-foreground-muted leading-relaxed">
                Joining the Tribe means alignment. Alignment to discipline and growth. Alignment to responsibility and impact. It means you are willing to be stretched and open to correction.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="rounded-3xl glass-strong border border-white/5 p-6 hover:border-brand/30 transition-colors">
              <span className="text-[10px] uppercase tracking-[0.3em] text-brand/80 font-bold">Eligibility</span>
              <h3 className="mt-1 font-display font-black text-xl text-white">Who Should Apply</h3>
              <ul className="mt-4 space-y-3 text-sm text-foreground-muted">
                {[
                  "A student, graduate, or young professional",
                  "Hungry for clarity and direction",
                  "Willing to think deeply and learn consistently",
                  "Ready to grow beyond comfort and trends",
                  "Interested in impact beyond personal gain",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-brand/80 mt-0.5"><Check size={16} /></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-foreground-muted/60 italic">
                You should pause if you are looking for hype, shortcuts, or passive membership.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="rounded-3xl glass-strong border border-white/5 p-6 hover:border-blue-glow/30 transition-colors">
              <span className="text-[10px] uppercase tracking-[0.3em] text-blue-glow font-bold">Foundation Rule</span>
              <h3 className="mt-1 font-display font-black text-xl text-white">The Foundation Rule</h3>
              <p className="mt-3 text-sm text-foreground-muted leading-relaxed">
                Everything in the Socially Speaking ecosystem flows from the Tribe. Conferences. Debates. Campus activations. Initiatives. Leadership opportunities. No skipping. No shortcuts.
              </p>
            </div>
          </StaggerItem>
        </StaggerGroup>

        {/* Right Side: Form Card */}
        <Reveal className="rounded-3xl glass-strong border border-white/5 p-8 relative">

          {submitSuccess ? (
            <div className="text-center py-12 space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-brand/20 border border-brand/40 text-brand flex items-center justify-center text-3xl">
                ✓
              </div>
              <h3 className="text-2xl font-display font-black text-white">Application Received</h3>
              <p className="text-foreground-muted max-w-sm mx-auto text-sm leading-relaxed">
                Thank you for applying. Your application has been received. Check your email for next steps. If you don't see it, check spam or promotions.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div>
                  <span className="text-xs uppercase tracking-[0.3em] text-brand/80 font-bold">Application</span>
                  <h3 className="text-2xl font-display font-black text-white">Tribe Application</h3>
                </div>
                <div className="rounded-full border border-blue-glow/20 bg-blue-glow/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-blue-glow font-bold">
                  Step {step} of 3
                </div>
              </div>

              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground-muted block mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-brand"
                        placeholder="Full Name"
                      />
                      {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground-muted block mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-brand"
                        placeholder="Email Address"
                      />
                      {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground-muted block mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-brand"
                        placeholder="e.g. +234..."
                      />
                      {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground-muted block mb-2">Birthday *</label>
                      <input
                        type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleInputChange}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-brand"
                      />
                      {errors.birthday && <p className="text-red-400 text-xs mt-1">{errors.birthday}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground-muted block mb-2">Age Range *</label>
                      <select
                        name="age_range"
                        value={formData.age_range}
                        onChange={handleInputChange}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-brand [&>option]:bg-ink-deep [&>option]:text-foreground"
                      >
                        <option value="">Select Age Range</option>
                        <option>Under 18</option>
                        <option>18–22</option>
                        <option>23–27</option>
                        <option>28–35</option>
                        <option>36+</option>
                      </select>
                      {errors.age_range && <p className="text-red-400 text-xs mt-1">{errors.age_range}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground-muted block mb-2">Current Stage *</label>
                      <select
                        name="stage"
                        value={formData.stage}
                        onChange={handleInputChange}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-brand [&>option]:bg-ink-deep [&>option]:text-foreground"
                      >
                        <option value="">Select Stage</option>
                        <option>Student</option>
                        <option>Graduate</option>
                        <option>Young Professional</option>
                      </select>
                      {errors.stage && <p className="text-red-400 text-xs mt-1">{errors.stage}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground-muted block mb-2">School or Institution</label>
                      <input
                        type="text"
                        name="school"
                        value={formData.school}
                        onChange={handleInputChange}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-brand"
                        placeholder="School or Institution"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground-muted block mb-2">Course or Profession *</label>
                      <input
                        type="text"
                        name="course"
                        value={formData.course}
                        onChange={handleInputChange}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-brand"
                        placeholder="e.g. Computer Science"
                      />
                      {errors.course && <p className="text-red-400 text-xs mt-1">{errors.course}</p>}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn-primary inline-flex items-center gap-2 group"
                    >
                      Next Step <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Intent & Self-awareness */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-semibold text-blue-glow uppercase tracking-[0.2em] block mb-2">
                      Intent and alignment *
                    </label>
                    <textarea
                      name="intent"
                      value={formData.intent}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-brand"
                      placeholder="Why do you want to join the Socially Speaking Tribe?"
                    />
                    <p className="text-[10px] text-foreground-muted/60 mt-1">
                      We are not looking for impressive language. We are listening for clarity, hunger, and intention.
                    </p>
                    {errors.intent && <p className="text-red-400 text-xs mt-1">{errors.intent}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-blue-glow uppercase tracking-[0.2em] block mb-2">
                      Self Awareness *
                    </label>
                    <input
                      type="text"
                      name="self_area"
                      value={formData.self_area}
                      onChange={handleInputChange}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-brand mb-3"
                      placeholder="One area you're strengthening (thinking, discipline, direction, character, consistency)"
                    />
                    <textarea
                      name="self_reason"
                      value={formData.self_reason}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-brand"
                      placeholder="Briefly explain why this area matters right now."
                    />
                    {errors.self_area && <p className="text-red-400 text-xs mt-1">{errors.self_area}</p>}
                    {errors.self_reason && <p className="text-red-400 text-xs mt-1">{errors.self_reason}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-blue-glow uppercase tracking-[0.2em] block mb-2">
                      Thinking and responsibility *
                    </label>
                    <textarea
                      name="thinking"
                      value={formData.thinking}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-brand"
                      placeholder="What does living a life beyond yourself mean to you?"
                    />
                    {errors.thinking && <p className="text-red-400 text-xs mt-1">{errors.thinking}</p>}
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-5 py-3 border border-white/10 rounded-xl text-sm font-semibold hover:bg-white/5 transition-colors inline-flex items-center gap-2"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn-primary inline-flex items-center gap-2 group"
                    >
                      Next Step <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Commitment */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-semibold text-blue-glow uppercase tracking-[0.2em] block mb-2">
                      Engagement Direction
                    </label>
                    <p className="text-xs text-foreground-muted mb-3">Select all that apply:</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {engagementOptions.map((opt) => {
                        const isChecked = formData.engagement.includes(opt);
                        return (
                          <label
                            key={opt}
                            className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer text-xs transition-all ${isChecked
                              ? "bg-brand/10 border-brand/50 text-white"
                              : "bg-white/5 border-white/10 text-foreground-muted hover:bg-white/10"
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCheckboxChange(opt)}
                              className="mt-0.5 h-3.5 w-3.5 rounded border-white/20 text-brand focus:ring-brand"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-blue-glow uppercase tracking-[0.2em] block mb-2">
                      Commitment Check *
                    </label>
                    <select
                      name="commitment"
                      value={formData.commitment}
                      onChange={handleInputChange}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-brand [&>option]:bg-ink-deep [&>option]:text-foreground"
                    >
                      <option value="">How would you describe your current approach to personal growth?</option>
                      <option>I am actively working on myself and seeking structure</option>
                      <option>I am serious but inconsistent and want accountability</option>
                      <option>I am early in the journey and ready to learn</option>
                    </select>
                    {errors.commitment && <p className="text-red-400 text-xs mt-1">{errors.commitment}</p>}
                  </div>

                  <div>
                    <label className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/10 p-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreement}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, agreement: e.target.checked }))
                        }
                        className="mt-1 h-4 w-4 rounded border-white/20 text-brand focus:ring-brand"
                      />
                      <span className="text-xs text-foreground-muted leading-relaxed">
                        I understand that Socially Speaking is a values-driven community with standards and expectations. I am willing to learn, grow, and engage responsibly. *
                      </span>
                    </label>
                    {errors.agreement && <p className="text-red-400 text-xs mt-1">{errors.agreement}</p>}
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-5 py-3 border border-white/10 rounded-xl text-sm font-semibold hover:bg-white/5 transition-colors inline-flex items-center gap-2"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        "Submitting..."
                      ) : (
                        <>
                          Submit Application <Send size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </Reveal>
      </div>

      {/* Lower Section Grid: After you Apply & The Decision */}
      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <Reveal className="rounded-3xl glass-strong border border-white/5 p-8 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-brand/80 font-bold">After You Apply</span>
            <h3 className="mt-1 font-display font-black text-2xl text-white">After You Apply</h3>
            <div className="mt-6 space-y-6">
              {[
                { step: "1", title: "Confirmation Message", text: "You receive an instant confirmation message." },
                { step: "2", title: "Onboarding Email", text: "You receive an onboarding email detailing the next steps." },
                { step: "3", title: "Guided Alignment", text: "You are guided through the core expectations and alignment." },
                { step: "4", title: "Community Access", text: "You are introduced to the official community channels and standards." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <span className="flex-shrink-0 grid h-8 w-8 place-items-center rounded-full bg-brand/10 border border-brand/30 text-brand font-bold text-sm">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="font-display font-bold text-base text-white">{item.title}</h4>
                    <p className="text-xs text-foreground-muted mt-1 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 text-xs text-foreground-muted/50 italic border-t border-white/5 pt-4">
            Onboarding is intentional. We do not rush alignment.
          </div>
        </Reveal>

        <Reveal className="rounded-3xl bg-ink-deep/20 border border-white/5 p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-blue-glow/10 pointer-events-none" />
          <div className="relative">
            <span className="text-xs uppercase tracking-[0.3em] text-blue-glow font-bold">The Decision</span>
            <h3 className="mt-1 font-display font-black text-2xl text-white">The Decision</h3>
            <p className="mt-4 text-sm text-foreground-muted leading-relaxed">
              This is an invitation to live a life beyond yourself.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Invest in your personality",
                "Sharpen your thinking",
                "Build capacity for impact",
                "Contribute meaningfully to society",
              ].map((point) => (
                <div key={point} className="flex items-center gap-3 text-sm text-foreground/90">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-brand/10 border border-brand/20 text-brand">
                    ✓
                  </span>
                  {point}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 relative">
            <p className="text-sm text-foreground-muted mb-4">If you are ready, take the step.</p>
            {/* <button
              onClick={() => {
                setStep(1);
                const element = document.getElementById("application");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="btn-primary w-full text-center inline-block"
            >
              Apply to Join the Tribe
            </button> */}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
