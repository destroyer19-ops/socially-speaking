import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { WhoWeAre } from "@/components/sections/WhoWeAre";
import { Ecosystem } from "@/components/sections/Ecosystem";
import { SuccessPath } from "@/components/sections/SuccessPath";
import { Stories } from "@/components/sections/Stories";
import { Journey } from "@/components/sections/Journey";
import { JoinUs } from "@/components/sections/JoinUs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Socially Speaking — Building Africa's Next Generation of Leaders" },
      {
        name: "description",
        content:
          "Conferences, university chapters, community programs and outreach raising young Africans who think better, grow better, build better, connect better and serve better.",
      },
      { property: "og:title", content: "Socially Speaking — A Movement, Not a Page" },
      {
        property: "og:description",
        content:
          "We build, equip and develop the next generation of excellent, audacious, and resilient young African leaders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <WhoWeAre />
      <Ecosystem />
      <SuccessPath />
      <Stories />
      <Journey />
      <JoinUs />
      <Footer />
    </main>
  );
}
