import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Campus as CampusSection } from "@/components/sections/Campus";

export const Route = createFileRoute("/campus")({
  component: CampusPage,
});

function CampusPage() {
  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight mb-4">
                Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-purple-glow">Chapters</span>
            </h1>
            <p className="text-lg text-foreground-muted max-w-2xl">
                Bringing the Socially Speaking movement directly to university campuses.
            </p>
        </div>
        <CampusSection />
      </div>
      <Footer />
    </main>
  );
}
