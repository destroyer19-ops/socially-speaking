import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";
import { Quote } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const testimonials = [
  {
    name: "Omolara Odunayo",
    location: "Lagos, Nigeria",
    quote:
      "When I came into the Socially Speaking Tribe, I was in a completely different mental space, unmotivated and struggling. But through the tasks, masterclasses, and meaningful conversations, I've seen a massive shift in my mindset. Engaging with the daily questions forced me to think differently, and I now operate with a stronger sense of purpose and clarity.",
  },
  {
    name: "Alayande Zainab",
    location: "Ibadan, Nigeria",
    quote:
      "Joining the Socially Speaking Tribe has profoundly impacted my mindset, moving me from procrastination to action. The environment here challenges you to do more, and the sense of community gives you the support you need to push through. Participating in the daily questions, debates, and listening to others' perspectives has stretched my thinking and helped me become a more decisive, action-oriented leader.",
  },
  {
    name: "Praise-El Shada",
    location: "Abuja, Nigeria",
    quote:
      "The Socially Speaking Tribe has redefined my understanding of excellence. Before, I thought I was doing well, but being in this community showed me there is always a higher standard to aim for. The conversations, masterclasses, and interactions with other incredible young leaders have helped me elevate my thinking and approach to life. It's a space that truly stretches you to be better.",
  },
  {
    name: "Oluwakemisola Ajayi",
    location: "Ogun State, Nigeria",
    quote:
      "I used to struggle with consistency and expressing my ideas confidently, but the Socially Speaking Tribe changed that. Through the daily questions, Debate Night, and the constant push for excellence, I found my voice. The feedback from both peers and leaders has been invaluable in shaping how I communicate and execute my goals. I am much more intentional and confident now.",
  },
  {
    name: "Daniel Ojo",
    location: "Lagos, Nigeria",
    quote:
      "The Socially Speaking Tribe has been a turning point for me. It is rare to find a community of young people so dedicated to growth, intellectual depth, and excellence. The masterclasses provided actionable insights, and the daily conversations challenged my long-held beliefs. I've grown in my ability to articulate my thoughts and take decisive action toward my goals.",
  },
  {
    name: "Favour Nwachukwu",
    location: "Port Harcourt, Nigeria",
    quote:
      "Being part of the Socially Speaking Tribe has been an incredible experience. The community is filled with brilliant minds, and just being in that environment forces you to level up. The Debate Nights were particularly impactful for me, as they taught me how to construct strong arguments and communicate effectively. I am leaving this cohort much sharper and more focused.",
  },
  {
    name: "Ebenezer Oyelola",
    location: "Lagos, Nigeria",
    quote:
      "The Socially Speaking Tribe is more than just a community; it is an incubator for greatness. The leadership and structure of the cohort are exceptional. Through the tasks and continuous engagement, I learned the importance of discipline, deep thinking, and surrounding myself with people who challenge me to be better. It has been a truly transformative journey.",
  },
  {
    name: "Grace Omakwu",
    location: "Abuja, Nigeria",
    quote:
      "The Socially Speaking Tribe has helped me break out of my shell. I used to be hesitant to share my opinions, but the culture of the Tribe encourages everyone to speak up and contribute. The daily questions made me think deeply about issues I would have otherwise ignored, and the masterclasses gave me practical tools for personal and professional growth. I am deeply grateful for this community.",
  },
  {
    name: "Victor Ikechukwu",
    location: "Enugu, Nigeria",
    quote:
      "The impact of the Socially Speaking Tribe on my life cannot be overstated. It has shifted my perspective on what is possible when you commit to excellence and surround yourself with the right people. The conversations are always rich and thought-provoking, and the sense of accountability is exactly what I needed to stay focused on my goals. This is a community every young leader needs.",
  },
  {
    name: "Ruth Oladipo",
    location: "Ibadan, Nigeria",
    quote:
      "Joining the Socially Speaking Tribe has been one of the best decisions I've made. The community is incredibly supportive, yet challenging. It pushes you out of your comfort zone and demands that you operate at a higher level. I have grown significantly in my ability to think critically, communicate clearly, and take consistent action toward my aspirations.",
  },
  {
    name: "Adaeze Ajanwachukwu",
    location: "Owerri, Nigeria",
    quote:
      "The Socially Speaking Tribe has genuinely stretched my mind and helped me grow. Through meaningful conversations, Q&As, and especially Debate Night, I've learned to think more critically, communicate more clearly, and engage with different perspectives. Beyond the learning, I've built meaningful connections and friendships. I came curious, and I'm becoming more confident, communicative, and connected.",
  },
  {
    name: "Tiana Oluwapelumi",
    location: "Lagos, Nigeria",
    quote:
      "The Socially Speaking Tribe has greatly influenced my pursuit of excellence, execution, and communication. Its culture of high standards has taught me to move beyond simply thinking about change to actively pursuing it. The daily questions have also strengthened my ability to think deeply and express my ideas clearly. I've become more bold, intentional, and excellence-driven.",
  },
  {
    name: "Cadmus Sewande",
    location: "Lagos, Nigeria",
    quote:
      "The Socially Speaking Tribe has impacted me in so many ways. It has broadened my mind through its deep conversations, intellectual discussions, and the diverse perspectives shared by its members. I've also experienced significant growth in content creation and personal branding. The masterclasses gave me practical clarity that I applied, resulting in a major improvement in how I create content and present myself online.",
  },
];

export function Stories() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0c0118 0%, #0d0526 45%, #080416 100%)" }}
    >
      {/* Ambient glow orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/3 h-[520px] w-[520px] rounded-full bg-purple/10 blur-[150px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1/4 h-[420px] w-[420px] rounded-full bg-blue-glow/8 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 -left-20 h-[300px] w-[300px] rounded-full bg-[#c77dff]/5 blur-[110px]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <Reveal>
            <SectionLabel>Testimonials</SectionLabel>
            <h2 className="mt-5 max-w-xl font-display text-4xl font-black sm:text-5xl lg:text-6xl">
              Voices from the <span className="text-gradient">Tribe</span>.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground-muted sm:text-lg">
              Written reflections from members who have grown through the conversations,
              accountability, challenges and community.
            </p>
          </Reveal>

          <Reveal className="lg:justify-self-end">
            <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:grid-cols-3">
              {[
                { value: "13", label: "written stories" },
                { value: "100%", label: "member voices" },
                { value: "Nigeria", label: "across locations" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="border-l border-white/10 pl-4 first:border-0 first:pl-0"
                >
                  <div className="font-display text-3xl font-black text-white">{stat.value}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-foreground-subtle">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-14">
          <Reveal delay={0.2}>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full relative"
            >
              <CarouselContent className="-ml-5 py-4">
                {testimonials.map((t, index) => (
                  <CarouselItem key={index} className="pl-5 md:basis-1/2 lg:basis-1/3">
                    <div className="group relative flex h-full flex-col rounded-[1.75rem] border border-white/5 bg-white/5 p-6 sm:p-8 transition-transform duration-300 hover:-translate-y-1 hover:border-white/10 backdrop-blur-sm">
                      <Quote className="mb-6 shrink-0 text-purple/60" size={24} aria-hidden />
                      <p className="flex-1 text-sm sm:text-base leading-relaxed text-foreground-muted">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                      <div className="mt-8 border-t border-white/8 pt-5">
                        <div className="font-display text-base font-bold text-white">{t.name}</div>
                        <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-foreground-subtle">
                          {t.location}
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-end gap-3 mt-4 pr-4">
                <CarouselPrevious className="static transform-none bg-white/5 hover:bg-white/10 text-white border-white/10" />
                <CarouselNext className="static transform-none bg-white/5 hover:bg-white/10 text-white border-white/10" />
              </div>
            </Carousel>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
