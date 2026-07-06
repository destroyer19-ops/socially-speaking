import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FirstClassFormulaRegisterForm } from "@/components/sections/FirstClassFormulaRegisterForm";

export const Route = createFileRoute("/first-class-formula")({
  head: () => ({
    meta: [
      { title: "The First Class Formula | Socially Speaking" },
      {
        name: "description",
        content:
          "Register for The First Class Formula, a free academic success webinar for incoming and current university students.",
      },
    ],
  }),
  component: FirstClassFormulaPage,
});

function FirstClassFormulaPage() {
  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex-1 pt-24">
        <FirstClassFormulaRegisterForm />
      </div>
      <Footer />
    </main>
  );
}
