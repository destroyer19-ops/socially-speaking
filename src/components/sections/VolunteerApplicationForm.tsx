import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { Check, Send, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import volunteerImg from "@/assets/ssc10.JPG";

const DEPARTMENTS = [
  "Hospitality and Guest Experience",
  "Creative / Graphics",
  "Registration",
  "Marketing and Publicity",
  "Ushering / Audience Management",
  "Merchandise",
  "Operations and Logistics",
  "Security / Crowd Support",
  "Media and Content",
  "Medical / Welfare",
  "Photography / Videography",
  "Prayer Unit",
  "Production Support",
  "Stage / Backstage Support",
];

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-white/90 mb-2">
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );
}

function TextInput({ name, value, onChange, placeholder, type = "text", error }: any) {
  return (
    <div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-xl bg-white/5 border ${error ? "border-red-500" : "border-white/10"} px-4 py-3 text-sm text-foreground focus:outline-none focus:border-purple-glow`}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function TextareaInput({ name, value, onChange, placeholder, error }: any) {
  return (
    <div>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className={`w-full rounded-xl bg-white/5 border ${error ? "border-red-500" : "border-white/10"} px-4 py-3 text-sm text-foreground focus:outline-none focus:border-purple-glow`}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function SelectInput({
  name,
  value,
  onChange,
  options,
  placeholder,
  error,
  disabledOptions = [],
}: any) {
  return (
    <div>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl bg-ink-deep border ${error ? "border-red-500" : "border-white/10"} px-4 py-3 text-sm text-foreground focus:outline-none focus:border-purple-glow`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt: string) => (
          <option key={opt} value={opt} disabled={disabledOptions.includes(opt)}>
            {opt}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function RadioGroup({ options, name, value, onChange, error }: any) {
  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-2">
        {options.map((opt: string) => (
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
              className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${value === opt ? "border-purple bg-purple" : "border-white/30"}`}
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

export function VolunteerApplicationForm() {
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    whatsapp: "",
    email: "",
    age: "",
    gender: "",
    location: "",
    occupation: "",
    instagram: "",
    volunteered_ssc: "",
    volunteered_ssc_role: "",
    volunteered_other: "",
    volunteered_other_role: "",
    first_choice: "",
    second_choice: "",
    department_reason: "",
    skills: "",
    willing_second_choice: "",
    willing_reassign: "",
    reason_volunteer: "",
    excellence_meaning: "",
    three_words: "",
    pressure_response: "",
    avail_conference: "",
    avail_training: "",
    avail_calltime: "",
    avail_preevent: "",
    emergency_name: "",
    emergency_rel: "",
    emergency_phone: "",
    declaration_agreed: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [sameAsPhone, setSameAsPhone] = useState(false);

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRadio = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.full_name) newErrors.full_name = "Required";
      if (!formData.phone) newErrors.phone = "Required";
      if (!formData.whatsapp) newErrors.whatsapp = "Required";
      if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email))
        newErrors.email = "Valid email required";
      if (!formData.age || isNaN(Number(formData.age))) newErrors.age = "Valid age required";
      if (!formData.gender) newErrors.gender = "Required";
      if (!formData.location) newErrors.location = "Required";
      if (!formData.occupation) newErrors.occupation = "Required";
    } else if (currentStep === 2) {
      if (!formData.volunteered_ssc) newErrors.volunteered_ssc = "Required";
      if (!formData.volunteered_other) newErrors.volunteered_other = "Required";
    } else if (currentStep === 3) {
      if (!formData.first_choice) newErrors.first_choice = "Required";
      if (formData.second_choice && formData.first_choice === formData.second_choice) {
        newErrors.second_choice = "Must be different from first choice";
      }
      if (!formData.department_reason) newErrors.department_reason = "Required";
      if (!formData.skills) newErrors.skills = "Required";
      if (!formData.willing_second_choice) newErrors.willing_second_choice = "Required";
      if (!formData.willing_reassign) newErrors.willing_reassign = "Required";
    } else if (currentStep === 4) {
      if (!formData.reason_volunteer) newErrors.reason_volunteer = "Required";
      if (!formData.excellence_meaning) newErrors.excellence_meaning = "Required";
      if (!formData.three_words) newErrors.three_words = "Required";
      if (!formData.pressure_response) newErrors.pressure_response = "Required";
    } else if (currentStep === 5) {
      if (!formData.avail_conference) newErrors.avail_conference = "Required";
      if (!formData.avail_training) newErrors.avail_training = "Required";
      if (!formData.avail_calltime) newErrors.avail_calltime = "Required";
      if (!formData.avail_preevent) newErrors.avail_preevent = "Required";
    } else if (currentStep === 6) {
      if (!formData.emergency_name) newErrors.emergency_name = "Required";
      if (!formData.emergency_rel) newErrors.emergency_rel = "Required";
      if (!formData.emergency_phone) newErrors.emergency_phone = "Required";
    } else if (currentStep === 7) {
      if (!formData.declaration_agreed)
        newErrors.declaration_agreed = "You must agree to the expectations";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(7)) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/process-volunteer.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrors({ _general: "Submission failed. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <section className="relative min-h-screen bg-ink-deep flex items-center justify-center px-4 py-24">
        <div className="text-center max-w-lg mx-auto">
          <div className="mx-auto mb-8 grid h-20 w-20 place-items-center rounded-full bg-green-500/15 border border-green-500/30">
            <Check size={36} className="text-green-400" />
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-wider">
            APPLICATION RECEIVED
          </h2>
          <p className="mt-5 text-foreground-muted text-lg leading-relaxed">
            Thank you for applying to volunteer at SSC 2026. Your application has been received
            successfully.
          </p>
          <p className="mt-4 text-foreground-muted leading-relaxed">
            Please check your email inbox now for a confirmation email containing important next
            steps and the link to join the official SSC 2026 Volunteers WhatsApp group.
          </p>
          <p className="mt-4 text-xs text-foreground-subtle">
            If you do not see the email in your inbox, please check your Promotions or Spam folder.
          </p>
          <a
            href="https://chat.whatsapp.com/ssc2026volunteers"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 btn-primary group inline-flex"
          >
            Join WhatsApp Group Now
            <ExternalLink size={16} className="ml-2" />
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen bg-background">
      <div className="absolute inset-0">
        <img
          src={volunteerImg}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-[0.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-20">
        <Reveal>
          <div className="text-center mb-10">
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white">
              SSC 2026 Volunteer Application
            </h1>
            <p className="mt-4 text-foreground-muted text-lg">
              Thank you for your interest in serving at Socially Speaking Conference 2026. Please
              complete this application carefully. Your responses will help us understand your
              strengths, experience, availability and the department where you would serve best.
            </p>
            <p className="mt-4 text-sm font-semibold text-brand">
              Please note: Submitting this form does not guarantee selection. Applications will be
              reviewed before final volunteer confirmation and department allocation.
            </p>
          </div>

          <div className="glass-strong rounded-3xl border border-white/5 p-6 sm:p-10 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 h-1 bg-brand transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />

            <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                {step === 1 && "Step 1 — Personal Information"}
                {step === 2 && "Step 2 — Experience"}
                {step === 3 && "Step 3 — Department Selection"}
                {step === 4 && "Step 4 — About You"}
                {step === 5 && "Step 5 — Availability"}
                {step === 6 && "Step 6 — Emergency Contact"}
                {step === 7 && "Step 7 — Declaration"}
              </h2>
              <span className="text-xs font-bold text-foreground-subtle bg-white/5 px-3 py-1 rounded-full">
                {step} of {totalSteps}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {errors._general && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 mb-6">
                  {errors._general}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid sm:grid-cols-2 gap-5">
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
                    <div>
                      <FieldLabel required>Email Address</FieldLabel>
                      <TextInput
                        name="email"
                        value={formData.email}
                        onChange={handleInput}
                        type="email"
                        placeholder="you@email.com"
                        error={errors.email}
                      />
                    </div>
                  </div>
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
                        type="tel"
                        placeholder="Your phone number"
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
                        type="tel"
                        placeholder="Your WhatsApp number"
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
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <FieldLabel required>Age</FieldLabel>
                      <TextInput
                        name="age"
                        value={formData.age}
                        onChange={handleInput}
                        type="number"
                        placeholder="Your age"
                        error={errors.age}
                      />
                    </div>
                    <div>
                      <FieldLabel required>Gender</FieldLabel>
                      <SelectInput
                        name="gender"
                        value={formData.gender}
                        onChange={handleInput}
                        options={["Male", "Female"]}
                        placeholder="Select gender"
                        error={errors.gender}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <FieldLabel required>Current Location</FieldLabel>
                      <TextInput
                        name="location"
                        value={formData.location}
                        onChange={handleInput}
                        placeholder="City, Country"
                        error={errors.location}
                      />
                    </div>
                    <div>
                      <FieldLabel required>Occupation / School / Organisation</FieldLabel>
                      <TextInput
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInput}
                        placeholder="What do you do?"
                        error={errors.occupation}
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Instagram Handle (Optional)</FieldLabel>
                    <TextInput
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInput}
                      placeholder="@yourhandle"
                      error={errors.instagram}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <FieldLabel required>
                      Have you volunteered with Socially Speaking before?
                    </FieldLabel>
                    <RadioGroup
                      name="volunteered_ssc"
                      value={formData.volunteered_ssc}
                      options={["Yes", "No"]}
                      onChange={(v: string) => handleRadio("volunteered_ssc", v)}
                      error={errors.volunteered_ssc}
                    />
                  </div>
                  {formData.volunteered_ssc === "Yes" && (
                    <div>
                      <FieldLabel>
                        If yes, which event, project or department did you serve in?
                      </FieldLabel>
                      <TextareaInput
                        name="volunteered_ssc_role"
                        value={formData.volunteered_ssc_role}
                        onChange={handleInput}
                        placeholder="Describe your role"
                        error={errors.volunteered_ssc_role}
                      />
                    </div>
                  )}

                  <div className="mt-8">
                    <FieldLabel required>
                      Have you volunteered at another conference, event, church programme, outreach
                      or large gathering before?
                    </FieldLabel>
                    <RadioGroup
                      name="volunteered_other"
                      value={formData.volunteered_other}
                      options={["Yes", "No"]}
                      onChange={(v: string) => handleRadio("volunteered_other", v)}
                      error={errors.volunteered_other}
                    />
                  </div>
                  {formData.volunteered_other === "Yes" && (
                    <div>
                      <FieldLabel>
                        If yes, briefly describe your role and responsibilities.
                      </FieldLabel>
                      <TextareaInput
                        name="volunteered_other_role"
                        value={formData.volunteered_other_role}
                        onChange={handleInput}
                        placeholder="Describe your responsibilities"
                        error={errors.volunteered_other_role}
                      />
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <p className="text-sm text-foreground-muted mb-4">
                    You may select a maximum of two departments. Your first choice should be the
                    department where you believe you can serve most effectively.
                  </p>
                  <div>
                    <FieldLabel required>First Choice Department</FieldLabel>
                    <SelectInput
                      name="first_choice"
                      value={formData.first_choice}
                      onChange={handleInput}
                      options={DEPARTMENTS}
                      placeholder="Select first choice"
                      error={errors.first_choice}
                    />
                  </div>
                  <div>
                    <FieldLabel>Second Choice Department (Optional)</FieldLabel>
                    <SelectInput
                      name="second_choice"
                      value={formData.second_choice}
                      onChange={handleInput}
                      options={DEPARTMENTS}
                      disabledOptions={[formData.first_choice]}
                      placeholder="Select second choice"
                      error={errors.second_choice}
                    />
                  </div>

                  <div>
                    <FieldLabel required>
                      Why did you choose your selected department(s)?
                    </FieldLabel>
                    <TextareaInput
                      name="department_reason"
                      value={formData.department_reason}
                      onChange={handleInput}
                      placeholder="Your reason"
                      error={errors.department_reason}
                    />
                  </div>
                  <div>
                    <FieldLabel required>
                      What skills, experience, training or strengths do you have that would help you
                      serve effectively in your selected department(s)?
                    </FieldLabel>
                    <TextareaInput
                      name="skills"
                      value={formData.skills}
                      onChange={handleInput}
                      placeholder="Your skills and strengths"
                      error={errors.skills}
                    />
                  </div>

                  <div>
                    <FieldLabel required>
                      Are you willing to serve in your second-choice department if your first-choice
                      department is full?
                    </FieldLabel>
                    <RadioGroup
                      name="willing_second_choice"
                      value={formData.willing_second_choice}
                      options={["Yes", "No"]}
                      onChange={(v: string) => handleRadio("willing_second_choice", v)}
                      error={errors.willing_second_choice}
                    />
                  </div>
                  <div>
                    <FieldLabel required>
                      If necessary, are you willing to be reassigned to another department based on
                      the needs of the conference?
                    </FieldLabel>
                    <RadioGroup
                      name="willing_reassign"
                      value={formData.willing_reassign}
                      options={["Yes", "No"]}
                      onChange={(v: string) => handleRadio("willing_reassign", v)}
                      error={errors.willing_reassign}
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <FieldLabel required>Why do you want to volunteer at SSC 2026?</FieldLabel>
                    <TextareaInput
                      name="reason_volunteer"
                      value={formData.reason_volunteer}
                      onChange={handleInput}
                      placeholder="Tell us why"
                      error={errors.reason_volunteer}
                    />
                  </div>
                  <div>
                    <FieldLabel required>What does serving with excellence mean to you?</FieldLabel>
                    <TextareaInput
                      name="excellence_meaning"
                      value={formData.excellence_meaning}
                      onChange={handleInput}
                      placeholder="Your definition"
                      error={errors.excellence_meaning}
                    />
                  </div>
                  <div>
                    <FieldLabel required>Describe yourself in three words.</FieldLabel>
                    <TextInput
                      name="three_words"
                      value={formData.three_words}
                      onChange={handleInput}
                      placeholder="Word 1, Word 2, Word 3"
                      error={errors.three_words}
                    />
                  </div>
                  <div>
                    <FieldLabel required>
                      How do you respond when working under pressure or receiving instructions from
                      a team lead?
                    </FieldLabel>
                    <TextareaInput
                      name="pressure_response"
                      value={formData.pressure_response}
                      onChange={handleInput}
                      placeholder="Your response"
                      error={errors.pressure_response}
                    />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <FieldLabel required>
                      Are you available on Saturday, 5 December 2026?
                    </FieldLabel>
                    <RadioGroup
                      name="avail_conference"
                      value={formData.avail_conference}
                      options={["Yes", "No"]}
                      onChange={(v: string) => handleRadio("avail_conference", v)}
                      error={errors.avail_conference}
                    />
                  </div>
                  <div>
                    <FieldLabel required>
                      Are you available for mandatory volunteer training and briefings before the
                      conference?
                    </FieldLabel>
                    <RadioGroup
                      name="avail_training"
                      value={formData.avail_training}
                      options={["Yes", "No"]}
                      onChange={(v: string) => handleRadio("avail_training", v)}
                      error={errors.avail_training}
                    />
                  </div>
                  <div>
                    <FieldLabel required>
                      Are you willing to arrive at the venue at the required call time and remain
                      until your assigned responsibilities are completed?
                    </FieldLabel>
                    <RadioGroup
                      name="avail_calltime"
                      value={formData.avail_calltime}
                      options={["Yes", "No"]}
                      onChange={(v: string) => handleRadio("avail_calltime", v)}
                      error={errors.avail_calltime}
                    />
                  </div>
                  <div>
                    <FieldLabel required>
                      Are you available to support pre-event preparations if your department
                      requires it?
                    </FieldLabel>
                    <RadioGroup
                      name="avail_preevent"
                      value={formData.avail_preevent}
                      options={["Yes", "No"]}
                      onChange={(v: string) => handleRadio("avail_preevent", v)}
                      error={errors.avail_preevent}
                    />
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <FieldLabel required>Emergency Contact Name</FieldLabel>
                    <TextInput
                      name="emergency_name"
                      value={formData.emergency_name}
                      onChange={handleInput}
                      placeholder="Contact's full name"
                      error={errors.emergency_name}
                    />
                  </div>
                  <div>
                    <FieldLabel required>Relationship to You</FieldLabel>
                    <TextInput
                      name="emergency_rel"
                      value={formData.emergency_rel}
                      onChange={handleInput}
                      placeholder="e.g. Parent, Sibling, Friend"
                      error={errors.emergency_rel}
                    />
                  </div>
                  <div>
                    <FieldLabel required>Emergency Contact Phone Number</FieldLabel>
                    <TextInput
                      name="emergency_phone"
                      value={formData.emergency_phone}
                      onChange={handleInput}
                      type="tel"
                      placeholder="Contact's phone number"
                      error={errors.emergency_phone}
                    />
                  </div>
                </div>
              )}

              {step === 7 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-sm text-foreground-muted space-y-3">
                    <p>
                      By submitting this application, I understand that applying does not guarantee
                      selection as an SSC 2026 volunteer.
                    </p>
                    <p>If selected, I agree to:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Attend required training and briefings.</li>
                      <li>Report at the assigned time.</li>
                      <li>Follow instructions from my team lead.</li>
                      <li>Carry out my assigned responsibilities responsibly.</li>
                      <li>
                        Treat delegates, guests, fellow volunteers and team members respectfully.
                      </li>
                      <li>Maintain confidentiality where required.</li>
                      <li>Represent Socially Speaking professionally.</li>
                      <li>
                        Remain committed to my assigned department throughout the conference unless
                        officially reassigned.
                      </li>
                    </ul>
                  </div>

                  <label className="flex items-start gap-4 cursor-pointer p-2">
                    <div className="mt-1 flex items-center justify-center h-5 w-5 rounded border-2 border-white/30 shrink-0">
                      <input
                        type="checkbox"
                        name="declaration_agreed"
                        checked={formData.declaration_agreed}
                        onChange={handleInput}
                        className="sr-only"
                      />
                      {formData.declaration_agreed && <Check size={12} className="text-white" />}
                    </div>
                    <span
                      className={`text-sm ${errors.declaration_agreed ? "text-red-400 font-medium" : "text-white"}`}
                    >
                      I have read and agree to the volunteer expectations above. *
                    </span>
                  </label>
                </div>
              )}

              <div className="mt-10 flex gap-4 pt-6 border-t border-white/5">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors flex items-center justify-center flex-1 sm:flex-none"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                  </button>
                )}
                {step < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 rounded-xl bg-white text-ink-deep font-bold hover:bg-white/90 transition-colors flex items-center justify-center flex-1"
                  >
                    Continue
                    <ArrowRight size={16} className="ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-xl bg-brand text-white font-bold hover:bg-brand/90 transition-colors flex items-center justify-center flex-1 disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "SUBMIT APPLICATION"}
                    {!isSubmitting && <Send size={16} className="ml-2" />}
                  </button>
                )}
              </div>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
