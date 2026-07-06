import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Outreach as OutreachSection } from "@/components/sections/Outreach";

export const Route = createFileRoute("/outreach")({
  component: OutreachPage,
});

function OutreachPage() {
  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight mb-4">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue to-purple-glow">Outreach</span>
          </h1>
          <p className="text-lg text-foreground-muted max-w-2xl">
            Initiatives dedicated to serving our communities through impact-driven programs.
          </p>
        </div>
        <OutreachSection />
      </div>
      <Footer />
    </main>
  );
}
