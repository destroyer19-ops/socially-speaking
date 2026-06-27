import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Conference as ConferenceSection } from "@/components/sections/Conference";

export const Route = createFileRoute("/conference")({
  component: ConferencePage,
});

function ConferencePage() {
  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight mb-4">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-purple-glow">Conference</span>
            </h1>
            <p className="text-lg text-foreground-muted max-w-2xl">
                The flagship event where Africa's brightest minds gather to connect, learn, and build the future. 
            </p>
        </div>
        <ConferenceSection />
        {/* Placeholder for expanded sub-sections like Conference History, Speakers, Waitlist */}
      </div>
      <Footer />
    </main>
  );
}
