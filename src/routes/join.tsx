import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JoinForm } from "@/components/sections/JoinForm";

export const Route = createFileRoute("/join")({
  component: JoinPage,
});

function JoinPage() {
  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight mb-4">
                Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-purple-glow">Us</span>
            </h1>
            <p className="text-lg text-foreground-muted max-w-2xl">
                Become part of a movement dedicated to building Africa's next generation.
            </p>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <JoinForm />
        </div>
      </div>
      <Footer />
    </main>
  );
}
