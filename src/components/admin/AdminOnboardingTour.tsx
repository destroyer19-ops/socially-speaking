import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  LayoutDashboard,
  Users,
  Award,
  HeartHandshake,
  ScanLine,
  MessageSquare,
  PenTool,
  HelpCircle,
} from "lucide-react";

export interface TourStep {
  id: string;
  tabKey: string;
  title: string;
  badge: string;
  description: string;
  tip?: string;
  icon: React.ReactNode;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    tabKey: "overview",
    title: "Welcome to the SSC2026 Admin Portal",
    badge: "Step 1 of 8 · Welcome",
    description:
      "This is your central command center for Socially Speaking Conference 2026: The Takeover Generation. From here, you can monitor registrations, review volunteers, track referral mobilization, manage WhatsApp group rotations, and publish news.",
    tip: "You can restart this interactive walkthrough anytime by clicking 'Take a Tour' at the bottom of the navigation sidebar.",
    icon: <Sparkles className="text-purple-glow w-6 h-6" />,
  },
  {
    id: "overview",
    tabKey: "overview",
    title: "Executive Overview & Quick Actions",
    badge: "Step 2 of 8 · Overview",
    description:
      "The Overview screen gives you an instant pulse on SSC2026. Review high-level cards showing Total Registrations, Volunteer Applications, Verified Check-Ins, and Mobilized Turnout, with fast one-click shortcuts to key tasks.",
    tip: "Important operational alerts (such as pending volunteer reviews or WhatsApp group capacities) appear prominently here.",
    icon: <LayoutDashboard className="text-blue-glow w-6 h-6" />,
  },
  {
    id: "attendees",
    tabKey: "attendees",
    title: "Attendee Records & Search",
    badge: "Step 3 of 8 · Attendees",
    description:
      "Browse, search, and filter all registered conference attendees. Look up individuals by name, email, or registration ID (SSC26-XXXXXXXX), inspect QR codes, view assigned WhatsApp groups, and export clean CSV rosters.",
    tip: "Use the search bar to find attendees instantly when helping them with registration inquiries.",
    icon: <Users className="text-purple-400 w-6 h-6" />,
  },
  {
    id: "volunteers",
    tabKey: "volunteers",
    title: "Volunteer Applications & Recruitment",
    badge: "Step 4 of 8 · Volunteers",
    description:
      "Review applicants ready to serve across conference departments (Media, Protocol, Logistics, Ushers, Technical, Welfare). Inspect roles, change review statuses, and execute bulk approvals when teams are selected.",
    tip: "Download volunteer rosters per department to share with departmental team leads.",
    icon: <HeartHandshake className="text-pink-400 w-6 h-6" />,
  },
  {
    id: "mobilization",
    tabKey: "mobilization",
    title: "Referral & Mobilizer Leaderboard",
    badge: "Step 5 of 8 · Mobilization",
    description:
      "Track who is bringing attendees to SSC2026! Monitor student mobilizers, organizations, and attendee referrers with first-touch attribution. Drill into any mobilizer's squad to check registered attendees and verified turnout.",
    tip: "First-touch attribution ensures the first person who shared their link gets verified credit.",
    icon: <Award className="text-yellow-400 w-6 h-6" />,
  },
  {
    id: "checkin",
    tabKey: "scanner",
    title: "QR Attendance & Gate Check-In",
    badge: "Step 6 of 8 · Attendance",
    description:
      "On event day (Saturday, 5 Dec 2026), gates use this check-in module to scan attendee QR codes. It supports both device camera scanning and handheld laser barcode scanners, preventing duplicate entries automatically.",
    tip: "A dedicated mobile-optimized check-in screen is also available for door staff at /checkin.",
    icon: <ScanLine className="text-green-400 w-6 h-6" />,
  },
  {
    id: "whatsapp",
    tabKey: "whatsapp",
    title: "WhatsApp Group Rotation",
    badge: "Step 7 of 8 · Event Automation",
    description:
      "Manage attendee WhatsApp community groups. The system automatically routes new registrants to the active group, tracking capacity and switching to the next group when full (e.g. Groups 01–05).",
    tip: "Group 01 is configured with the official active invite link. Capacity counts update atomically on each registration.",
    icon: <MessageSquare className="text-emerald-400 w-6 h-6" />,
  },
  {
    id: "blog",
    tabKey: "blog",
    title: "Rich Text Blog & Media CMS",
    badge: "Step 8 of 8 · Content CMS",
    description:
      "Create, format, and publish professional blog articles directly from the dashboard. Format text with H2/H3 headings, embed photos anywhere in the story, add captions, upload featured banners to Cloudflare R2, and save drafts before publishing.",
    tip: "Use the 'Preview Layout' button to inspect how your article will look on the public website before publishing.",
    icon: <PenTool className="text-blue-400 w-6 h-6" />,
  },
];

interface AdminOnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tabKey: string) => void;
}

export function AdminOnboardingTour({ isOpen, onClose, onSelectTab }: AdminOnboardingTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const step = TOUR_STEPS[currentStepIndex];
      if (step) {
        onSelectTab(step.tabKey);
      }
    }
  }, [currentStepIndex, isOpen, onSelectTab]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleFinish();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem("ssc_admin_tour_completed", "true");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-4 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-gradient-to-b from-[#141829] to-[#0a0d18] p-6 sm:p-8 shadow-2xl text-foreground">
        
        {/* Close / Skip button */}
        <button
          onClick={handleFinish}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 text-foreground-subtle hover:text-white hover:bg-white/10 transition-colors"
          title="Skip Tour"
        >
          <X size={16} />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
            {step.icon}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-glow">
              {step.badge}
            </span>
            <h3 className="font-display font-black text-xl text-white leading-tight">
              {step.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-foreground-muted leading-relaxed mb-4">
          {step.description}
        </p>

        {/* Pro Tip */}
        {step.tip && (
          <div className="rounded-xl border border-purple-glow/20 bg-purple-glow/5 p-3 text-xs text-purple-glow/90 mb-6 flex items-start gap-2">
            <span className="font-bold shrink-0">PRO TIP:</span>
            <span>{step.tip}</span>
          </div>
        )}

        {/* Progress Dots */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentStepIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentStepIndex
                    ? "w-6 bg-purple-glow"
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold text-foreground-muted hover:text-white transition-colors flex items-center gap-1"
              >
                <ArrowLeft size={13} /> Back
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="btn-primary py-2 px-5 text-xs font-bold shadow-lg shadow-brand/20 flex items-center gap-1.5"
            >
              <span>{isLast ? "Finish Tour" : "Next"}</span>
              {isLast ? <CheckCircle2 size={14} /> : <ArrowRight size={14} />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
