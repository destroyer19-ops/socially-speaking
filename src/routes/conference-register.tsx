import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ConferenceRegisterForm } from "@/components/sections/ConferenceRegisterForm";

export const Route = createFileRoute("/conference-register")({
  component: ConferenceRegisterPage,
});

function ConferenceRegisterPage() {
  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex-1 pt-24">
        <ConferenceRegisterForm />
      </div>
      <Footer />
    </main>
  );
}
