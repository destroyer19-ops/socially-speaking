import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, X, ChevronDown, Plus, Minus } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/takeover-table")({
  head: () => ({
    meta: [
      { title: "The Takeover Table | Socially Speaking" },
      {
        name: "description",
        content:
          "A private masterclass banquet focused on the business, influence and future of media, arts and entertainment.",
      },
    ],
  }),
  component: TakeoverTablePage,
});

function TakeoverTablePage() {
  const activeRelease = "FIRST RELEASE";
  const activePrice = "₦80,000";
  const capacityLeft = "FIRST 30 GUESTS";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const [formState, setFormState] = useState({
    full_name: "",
    email: "",
    whatsapp: "",
    city: "",
    payment_method: "First Release (₦80,000)",
    agreement: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        full_name: formState.full_name,
        email: formState.email,
        phone: formState.whatsapp,
        country_city: formState.city,
        payment_method: formState.payment_method,
        agreement: formState.agreement,
      };

      const response = await fetch("/process-takeover.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      const result = await response.json();
      if (!result.ok) {
        throw new Error(result.error || "Submission failed");
      }

      if (result.authorization_url && result.authorization_url !== "#") {
        window.location.href = result.authorization_url;
        return;
      }

      setSubmitSuccess(true);
    } catch {
      setSubmitSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormState((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const faqs = [
    {
      q: "WHAT IS THE TAKEOVER TABLE?",
      a: "The Takeover Table is a private masterclass banquet focused on the business, influence and future of media, arts and entertainment.",
    },
    {
      q: "IS THIS A REGULAR CONFERENCE?",
      a: "No. Attendance is limited to 150 guests. The structure prioritises depth, relevant conversations and intentional connections.",
    },
    {
      q: "WHO SHOULD ATTEND?",
      a: "Emerging and established creatives, media professionals, industry operators and creative entrepreneurs will gain the most value from the experience.",
    },
    {
      q: "WILL FOOD BE SERVED?",
      a: "Yes. Your ticket includes banquet dining.",
    },
    {
      q: "WHERE WILL THE EVENT HOLD?",
      a: "The event will hold in Lagos, Nigeria. Confirmed guests will receive complete venue and arrival information.",
    },
    {
      q: "WHAT IS THE DRESS CODE?",
      a: "Editorial Formal. Choose a polished and expressive look suitable for a private creative-industry banquet.",
    },
    {
      q: "HOW MANY PEOPLE WILL ATTEND?",
      a: "Attendance is limited to 150 guests to protect the quality of the conversations and connections.",
    },
  ];

  return (
    <main className="relative flex min-h-screen flex-col bg-[#0B0B0D] text-[#F1E8D8] font-['Manrope',_Arial,_sans-serif] selection:bg-[#6E1727] selection:text-[#F1E8D8]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Manrope:wght@200..800&display=swap');
      `}</style>

      {/* Announcement Bar */}
      <div className="w-full bg-[#6E1727] text-[#F1E8D8] py-2 px-4 text-center text-xs tracking-[0.15em] font-semibold uppercase relative z-50">
        <span className="opacity-90">{activeRelease} NOW OPEN</span>
        <span className="mx-3 opacity-50">|</span>
        <span className="opacity-90">
          {activePrice} FOR THE {capacityLeft}
        </span>
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-24 lg:pt-32 lg:pb-32 overflow-hidden bg-[#0B0B0D]">
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <Reveal className="max-w-2xl">
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#BDB2A4] mb-8 block opacity-80">
                SOCIALLY SPEAKING PRESENTS
              </span>

              <h1 className="font-['Bodoni_Moda',_Georgia,_serif] font-medium text-5xl sm:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight mb-8">
                THE TAKEOVER
                <br />
                TABLE
              </h1>

              <div className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#BDB2A4] mb-8 flex flex-wrap gap-3 items-center">
                <span>MEDIA</span>
                <span className="w-1 h-1 rounded-full bg-[#6E1727]"></span>
                <span>ARTS</span>
                <span className="w-1 h-1 rounded-full bg-[#6E1727]"></span>
                <span>ENTERTAINMENT</span>
              </div>

              <p className="text-xl sm:text-2xl font-['Bodoni_Moda',_Georgia,_serif] mb-6 leading-relaxed">
                For the people building what Africa will watch, wear, hear and remember next.
              </p>

              <p className="text-[#BDB2A4] mb-12 text-sm sm:text-base leading-relaxed max-w-lg">
                A private masterclass banquet for 150 creatives, media professionals, industry
                operators and business leaders.
              </p>

              <div className="flex flex-wrap items-center gap-6 text-[10px] sm:text-xs font-bold tracking-[0.15em] uppercase text-[#BDB2A4] mb-10">
                <span>07 NOVEMBER 2026</span>
                <span className="hidden sm:inline opacity-30">|</span>
                <span>LAGOS, NIGERIA</span>
                <span className="hidden sm:inline opacity-30">|</span>
                <span>150 GUESTS</span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#6E1727] text-white px-8 py-4 text-xs font-bold tracking-wider uppercase transition-colors hover:bg-[#851e31]"
                >
                  RESERVE YOUR SEAT
                </button>
                <div className="text-xs font-bold tracking-widest text-[#F1E8D8] uppercase">
                  FIRST RELEASE: ₦80,000
                </div>
              </div>
            </Reveal>

            {/* Monogram / Visual Anchor */}
            <Reveal className="hidden lg:flex justify-center items-center h-full">
              <div className="relative w-64 h-96 border border-[#BDB2A4]/30 flex flex-col items-center justify-center p-8">
                <div className="absolute top-0 w-px h-12 bg-[#6E1727] -translate-y-1/2"></div>
                <div className="absolute bottom-0 w-px h-12 bg-[#6E1727] translate-y-1/2"></div>
                <h2 className="font-['Bodoni_Moda',_Georgia,_serif] text-8xl mb-8 relative">
                  <span className="absolute -top-4 left-0 w-full h-1.5 bg-[#F1E8D8]"></span>
                  TT
                </h2>
                <span className="text-[8px] uppercase tracking-[0.3em] text-[#BDB2A4]">
                  The Business of Influence
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* The Premise */}
      <section id="premise" className="py-24 lg:py-32 bg-[#F1E8D8] text-[#0B0B0D]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-5">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E1727] block mb-8">
                THE PREMISE
              </span>
              <h2 className="font-['Bodoni_Moda',_Georgia,_serif] text-4xl lg:text-5xl leading-[1.2] mb-6">
                Talent attracts attention.
                <br />
                Structure builds careers.
                <br />
                Ownership creates power.
                <br />
                Influence shapes culture.
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-6 lg:col-start-7 text-lg leading-relaxed space-y-6 opacity-90 text-justify">
              <p>
                Takeover is more than popularity. It is the ability to enter important rooms,
                understand the business, protect your work, build profitable systems and shape
                culture with intention.
              </p>
              <p>
                The Takeover Table brings serious creative professionals and experienced industry
                leaders into one room for honest conversations about the work behind visible
                success.
              </p>
            </Reveal>
          </div>

          {/* The Four Pillars */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-24">
            {[
              {
                title: "ACCESS",
                desc: "How creative professionals enter important rooms, earn trust and become ready for bigger opportunities.",
              },
              {
                title: "OWNERSHIP",
                desc: "How creatives price their work, protect their ideas, negotiate stronger agreements and build profitable structures.",
              },
              {
                title: "INFLUENCE",
                desc: "How reputation, personal brand, relationships and public visibility shape a creative career.",
              },
              {
                title: "LONGEVITY",
                desc: "How professionals remain relevant, build teams, create institutions and produce work with lasting value.",
              },
            ].map((pillar, i) => (
              <Reveal key={i} className="border-t border-[#0B0B0D]/20 pt-6">
                <h3 className="text-xs font-bold tracking-[0.2em] uppercase mb-4">
                  {pillar.title}
                </h3>
                <p className="text-sm opacity-80 leading-relaxed">{pillar.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Conversations */}
      <section id="conversations" className="py-24 lg:py-32 bg-[#FBF7EF] text-[#0B0B0D]">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="max-w-3xl mb-20">
            <h2 className="font-['Bodoni_Moda',_Georgia,_serif] text-4xl lg:text-5xl leading-[1.2] mb-6">
              ONE ROOM. 150 GUESTS.
              <br />
              FOUR DEEP CONVERSATIONS.
            </h2>
            <p className="text-lg opacity-80 leading-relaxed text-justify">
              The evening is structured as an extended industry masterclass. Three panel
              conversations and one keynote experience will examine entry, enterprise, influence and
              longevity. Expect specific questions, honest answers, live audience participation and
              enough time for each conversation to go beyond rehearsed success stories.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            <Reveal className="border-l-2 border-[#6E1727] pl-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BDB2A4] block mb-2">
                Conversation One
              </span>
              <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">ENTER THE ROOM</h3>
              <p className="text-[#6E1727] font-serif italic mb-4">
                From unknown talent to trusted industry professional.
              </p>
              <p className="text-sm opacity-80 leading-relaxed">
                Positioning. Portfolio. Visibility. Relationships. Referrals. Industry access.
                Commercial readiness.
              </p>
            </Reveal>

            <Reveal className="border-l-2 border-[#6E1727] pl-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BDB2A4] block mb-2">
                Conversation Two
              </span>
              <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">BUILD THE BUSINESS</h3>
              <p className="text-[#6E1727] font-serif italic mb-4">
                From creative talent to profitable enterprise.
              </p>
              <p className="text-sm opacity-80 leading-relaxed">
                Pricing. Contracts. Intellectual property. Teams. Income streams. Negotiation.
                Business systems.
              </p>
            </Reveal>

            <Reveal className="border-l-2 border-[#6E1727] pl-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BDB2A4] block mb-2">
                Conversation Three
              </span>
              <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">SHAPE THE CULTURE</h3>
              <p className="text-[#6E1727] font-serif italic mb-4">
                From public visibility to lasting influence.
              </p>
              <p className="text-sm opacity-80 leading-relaxed">
                Personal brand. Reputation. Reinvention. Values. Responsibility. Longevity.
                Institution building.
              </p>
            </Reveal>

            <Reveal className="border-l-2 border-[#0B0B0D] pl-6 bg-[#0B0B0D] text-[#F1E8D8] p-8 -ml-6 -mt-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BDB2A4] block mb-2">
                Keynote Experience
              </span>
              <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">BEYOND TALENT</h3>
              <p className="text-[#BDB2A4] font-serif italic mb-4">The Business of Influence</p>
              <p className="text-sm opacity-80 leading-relaxed">
                A high-level conversation about the decisions, relationships, systems and discipline
                behind influence, wealth and longevity in the creative industry.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Speakers Placeholder */}
      <section
        id="speakers"
        className="py-24 bg-[#0B0B0D] text-[#F1E8D8] border-y border-[#BDB2A4]/20"
      >
        <div className="mx-auto max-w-7xl px-6 text-center">
          <Reveal>
            <h2 className="font-['Bodoni_Moda',_Georgia,_serif] text-3xl lg:text-4xl leading-[1.2] mb-6">
              THE PEOPLE BEHIND THE WORK
            </h2>
            <p className="text-[#BDB2A4] uppercase tracking-[0.1em] text-sm font-bold mb-8">
              Results over popularity.
            </p>
            <p className="max-w-2xl mx-auto text-sm leading-relaxed opacity-80 mb-8 text-justify">
              Each speaker will be selected for proven work, industry experience, business results
              and the ability to teach with clarity. The table will bring together public figures,
              creative founders, media executives, business operators and influential professionals
              working behind the scenes.
            </p>
            <div className="inline-block border border-[#BDB2A4]/30 px-6 py-3 text-xs uppercase tracking-widest text-[#BDB2A4]">
              Speaker announcements begin soon.
            </div>
          </Reveal>
        </div>
      </section>

      {/* Experience & Inclusions */}
      <section id="experience" className="py-24 lg:py-32 bg-[#F1E8D8] text-[#0B0B0D]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            <Reveal>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6E1727] block mb-4">
                THE EXPERIENCE
              </span>
              <h2 className="font-['Bodoni_Moda',_Georgia,_serif] text-4xl leading-[1.2] mb-6">
                YOUR TABLE IS PART OF
                <br />
                THE EXPERIENCE
              </h2>
              <p className="font-serif italic text-lg mb-6 text-[#6E1727]">
                Networking should never depend on luck.
              </p>
              <p className="text-sm opacity-90 leading-relaxed text-justify mb-8">
                During registration, every guest will identify their primary industry, current
                career stage and professional interests. The seating plan will place people around
                relevant tables with shared interests and possible opportunities for collaboration.
              </p>
            </Reveal>

            <Reveal className="bg-[#FBF7EF] p-8 lg:p-12 border border-[#0B0B0D]/10">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 border-b border-[#0B0B0D]/10 pb-4">
                TICKET INCLUSIONS
              </h3>
              <ul className="space-y-4 text-sm opacity-90">
                {[
                  "Full access to the private banquet",
                  "Three extended masterclass conversations",
                  "One keynote experience",
                  "Live audience questions",
                  "Curated industry seating",
                  "Guided table conversations",
                  "Banquet dining",
                  "The Takeover Table workbook",
                  "A curated guest package",
                  "Professional event photography",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6E1727] mt-1.5 flex-shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Audience */}
      <section id="audience" className="py-24 lg:py-32 bg-[#0B0B0D] text-[#F1E8D8]">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BDB2A4] block mb-4">
              WHO SHOULD ATTEND
            </span>
            <h2 className="font-['Bodoni_Moda',_Georgia,_serif] text-4xl lg:text-5xl leading-[1.2] mb-6">
              THIS TABLE IS FOR BUILDERS
            </h2>
            <p className="text-[#BDB2A4] text-lg leading-relaxed">
              This room serves people seeking more than proximity to famous names. Come prepared to
              listen, question, connect and act.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12 max-w-5xl mx-auto text-sm opacity-80">
            {[
              "Content creators",
              "Filmmakers, producers, actors and performers",
              "Fashion designers and stylists",
              "Photographers and videographers",
              "Musicians and music professionals",
              "Television and radio presenters",
              "Visual artists and designers",
              "Writers and storytellers",
              "Creative directors and brand strategists",
              "Publicists and talent managers",
              "Event and experience professionals",
              "Creative entrepreneurs",
              "Emerging professionals seeking industry entry",
              "Established creatives preparing for greater scale",
            ].map((prof, i) => (
              <div key={i} className="flex items-center gap-3 border-b border-[#BDB2A4]/20 pb-3">
                <span className="text-[#6E1727]">+</span>
                <span>{prof}</span>
              </div>
            ))}
          </div>

          <Reveal className="mt-20 text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-[#BDB2A4] leading-relaxed">
              The Takeover Table is a values-led and faith-friendly gathering open to serious
              professionals from every background.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Tickets */}
      <section id="tickets" className="py-24 lg:py-32 bg-[#FBF7EF] text-[#0B0B0D]">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="text-center mb-16">
            <h2 className="font-['Bodoni_Moda',_Georgia,_serif] text-4xl lg:text-5xl leading-[1.2] mb-4">
              PRIVATE ACCESS
            </h2>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#6E1727]">
              Only 150 seats will be released.
            </p>
          </Reveal>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "FIRST RELEASE",
                price: "₦80,000",
                alloc: "First 30 seats",
                desc: "Priority price for early commitment",
                active: true,
              },
              {
                title: "PRIVATE ACCESS",
                price: "₦100,000",
                alloc: "Next 90 seats",
                desc: "Standard private-access ticket",
                active: false,
              },
              {
                title: "FINAL RELEASE",
                price: "₦120,000",
                alloc: "Last 30 seats",
                desc: "Final allocation before sell-out",
                active: false,
              },
            ].map((tier, i) => (
              <Reveal
                key={i}
                className={`p-8 border ${tier.active ? "border-[#6E1727] shadow-sm" : "border-[#0B0B0D]/10 opacity-70"} bg-[#F1E8D8] flex flex-col`}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em]">{tier.title}</h3>
                  {tier.active && (
                    <span className="bg-[#6E1727] text-[#F1E8D8] text-[9px] px-2 py-1 tracking-wider uppercase">
                      Active
                    </span>
                  )}
                </div>
                <div className="font-['Bodoni_Moda',_Georgia,_serif] text-4xl mb-2">
                  {tier.price}
                </div>
                <div className="text-xs font-bold uppercase text-[#6E1727] mb-6 tracking-wide">
                  {tier.alloc}
                </div>
                <p className="text-sm opacity-80 mb-8 flex-grow">{tier.desc}</p>

                <button
                  disabled={!tier.active}
                  onClick={() => setIsModalOpen(true)}
                  className={`w-full py-4 text-xs font-bold tracking-wider uppercase transition-colors ${tier.active ? "bg-[#6E1727] text-white hover:bg-[#851e31]" : "bg-[#0B0B0D]/5 text-[#0B0B0D]/50 cursor-not-allowed"}`}
                >
                  {tier.active ? "RESERVE YOUR SEAT" : "LOCKED"}
                </button>
              </Reveal>
            ))}
          </div>

          <p className="text-center text-xs opacity-60 mt-12">
            Each release closes once its allocation sells out.
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="py-24 bg-[#F1E8D8] text-[#0B0B0D] border-t border-[#0B0B0D]/10">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal className="text-center mb-16">
            <h2 className="font-['Bodoni_Moda',_Georgia,_serif] text-3xl lg:text-4xl leading-[1.2]">
              FREQUENTLY ASKED QUESTIONS
            </h2>
          </Reveal>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Reveal key={i} className="border border-[#0B0B0D]/10 bg-[#FBF7EF]">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                >
                  <span className="text-xs font-bold uppercase tracking-wider pr-8">{faq.q}</span>
                  {openFaq === i ? (
                    <Minus size={16} className="text-[#6E1727] flex-shrink-0" />
                  ) : (
                    <Plus size={16} className="opacity-50 flex-shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-sm opacity-80 leading-relaxed pt-2 border-t border-[#0B0B0D]/5">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-[#0B0B0D] text-[#F1E8D8] text-center border-t border-[#BDB2A4]/20">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <h2 className="font-['Bodoni_Moda',_Georgia,_serif] text-3xl lg:text-5xl leading-[1.3] mb-10">
              YOUR TALENT DESERVES STRUCTURE.
              <br />
              YOUR WORK DESERVES OWNERSHIP.
              <br />
              YOUR INFLUENCE DESERVES DIRECTION.
            </h2>
            <p className="text-[#BDB2A4] text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
              Join 150 creatives, media professionals and industry leaders for a private banquet
              focused on the business behind creative influence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12 text-[10px] sm:text-xs font-bold tracking-[0.15em] uppercase text-[#BDB2A4]">
              <span>THE TAKEOVER TABLE</span>
              <span className="hidden sm:inline opacity-30">|</span>
              <span>07 NOVEMBER 2026</span>
              <span className="hidden sm:inline opacity-30">|</span>
              <span>LAGOS, NIGERIA</span>
            </div>

            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#6E1727] text-white px-10 py-5 text-sm font-bold tracking-widest uppercase transition-colors hover:bg-[#851e31]"
              >
                RESERVE YOUR SEAT
              </button>
              <div className="text-[10px] font-bold tracking-[0.2em] text-[#BDB2A4] uppercase">
                ACTIVE PRICE: {activePrice}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B0B0D] text-[#BDB2A4] py-16 border-t border-[#BDB2A4]/10 text-center">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-['Bodoni_Moda',_Georgia,_serif] text-2xl text-[#F1E8D8] mb-2">
            THE TAKEOVER TABLE
          </h2>
          <p className="text-[10px] uppercase tracking-[0.3em] mb-8">
            Media • Arts • Entertainment
          </p>

          <div className="max-w-md mx-auto mb-12 text-sm opacity-60 leading-relaxed">
            <p className="mb-2 uppercase text-[10px] tracking-widest font-bold text-[#F1E8D8]">
              Presented by Socially Speaking
            </p>
            <p>
              Socially Speaking builds and equips young people to lead with excellence, influence
              and purpose.
            </p>
          </div>

          <div className="text-xs opacity-40">
            &copy; 2026 Socially Speaking. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Registration Modal (Pre-Payment Form) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0B0B0D]/90 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-xl bg-[#FBF7EF] text-[#0B0B0D] border border-[#0B0B0D]/10 max-h-[90vh] overflow-y-auto relative shadow-2xl"
            >
              <div className="sticky top-0 bg-[#FBF7EF] p-6 border-b border-[#0B0B0D]/10 flex justify-between items-center z-10">
                <h2 className="font-['Bodoni_Moda',_Georgia,_serif] text-2xl">Reserve Your Seat</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-[#0B0B0D]/5 transition-colors rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 sm:p-10">
                {submitSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-[#6E1727]/10 border border-[#6E1727] text-[#6E1727] flex items-center justify-center text-2xl mx-auto mb-6">
                      ✓
                    </div>
                    <h3 className="text-2xl font-['Bodoni_Moda',_Georgia,_serif] mb-4">
                      Registration Initiated
                    </h3>
                    <p className="text-sm opacity-80 mb-8 leading-relaxed">
                      You will now be redirected to the secure payment portal. After payment, you
                      will receive an email to complete your attendee profile for the curated
                      seating arrangement.
                    </p>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-8 py-4 bg-[#6E1727] text-[#F1E8D8] text-xs font-bold tracking-widest uppercase hover:bg-[#851e31] transition-colors w-full"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0B0D]/70 block mb-2">
                        Full Name
                      </label>
                      <input
                        required
                        type="text"
                        name="full_name"
                        onChange={handleChange}
                        className="w-full bg-[#F1E8D8] border border-[#0B0B0D]/10 px-4 py-3 text-sm focus:border-[#6E1727] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0B0D]/70 block mb-2">
                        Email Address
                      </label>
                      <input
                        required
                        type="email"
                        name="email"
                        onChange={handleChange}
                        className="w-full bg-[#F1E8D8] border border-[#0B0B0D]/10 px-4 py-3 text-sm focus:border-[#6E1727] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0B0D]/70 block mb-2">
                        WhatsApp Number
                      </label>
                      <input
                        required
                        type="tel"
                        name="whatsapp"
                        onChange={handleChange}
                        className="w-full bg-[#F1E8D8] border border-[#0B0B0D]/10 px-4 py-3 text-sm focus:border-[#6E1727] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0B0D]/70 block mb-2">
                        City of Residence
                      </label>
                      <input
                        required
                        type="text"
                        name="city"
                        onChange={handleChange}
                        className="w-full bg-[#F1E8D8] border border-[#0B0B0D]/10 px-4 py-3 text-sm focus:border-[#6E1727] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0B0D]/70 block mb-2">
                        Active Ticket Release
                      </label>
                      <select
                        name="payment_method"
                        onChange={handleChange}
                        defaultValue="First Release (₦80,000)"
                        className="w-full bg-[#F1E8D8] border border-[#0B0B0D]/10 px-4 py-3 text-sm focus:border-[#6E1727] outline-none"
                      >
                        <option value="First Release (₦80,000)">First Release (₦80,000)</option>
                      </select>
                    </div>

                    <div className="pt-4 border-t border-[#0B0B0D]/10">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          required
                          type="checkbox"
                          name="agreement"
                          onChange={handleChange}
                          className="mt-1 flex-shrink-0"
                        />
                        <span className="text-xs opacity-70 leading-relaxed">
                          I understand that tickets are non-refundable. I agree to the event's
                          privacy and photography policies.
                        </span>
                      </label>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-[#6E1727] text-[#F1E8D8] text-xs font-bold tracking-widest uppercase hover:bg-[#851e31] transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? "PROCESSING..." : "PROCEED TO PAYMENT"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
