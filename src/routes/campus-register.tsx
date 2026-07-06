import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CampusRegisterForm } from "@/components/sections/CampusRegisterForm";

export const Route = createFileRoute("/campus-register")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      university: (search.university as string) || "UNILAG",
    };
  },
  component: CampusRegisterPage,
});

function CampusRegisterPage() {
  const { university } = Route.useSearch();

  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-8 text-center sm:text-left">
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight mb-2">
            Campus{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-glow to-blue-glow">
              Registration
            </span>
          </h1>
          <p className="text-base sm:text-lg text-foreground-muted max-w-2xl">
            Join the Socially Speaking movement at your university campus.
          </p>
        </div>
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <CampusRegisterForm initialUniversity={university} />
        </div>
      </div>
      <Footer />
    </main>
  );
}
