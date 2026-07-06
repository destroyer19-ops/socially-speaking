import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MediaGallery } from "@/components/MediaGallery";

export const Route = createFileRoute("/media")({
  component: MediaPage,
});

function MediaPage() {
  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-12">
          <div className="chip mx-auto w-fit mb-6">The Ecosystem</div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight mb-4">
            Follow the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue to-purple-glow">
              Socially Speaking Ecosystem
            </span>
          </h1>
          <p className="text-lg text-foreground-muted max-w-2xl">
            Stay connected with each arm of Socially Speaking. Find us on Instagram, TikTok,
            YouTube, and LinkedIn.
          </p>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <MediaGallery />
        </div>
      </div>
      <Footer />
    </main>
  );
}
