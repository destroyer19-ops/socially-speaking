import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Impact as ImpactSection } from "@/components/sections/Impact";

export const Route = createFileRoute("/impact")({
  component: ImpactPage,
});

function ImpactPage() {
  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight mb-4">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue to-purple-glow">Impact</span>
          </h1>
          <p className="text-lg text-foreground-muted max-w-2xl">
            Measuring our success by the lives we touch and the leaders we build.
          </p>
        </div>
        <ImpactSection />
      </div>
      <Footer />
    </main>
  );
}
