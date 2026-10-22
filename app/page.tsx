import { About } from "@/components/about";
import { Archive } from "@/components/archive";
import { Hero } from "@/components/hero";
import { News } from "@/components/news";
import { Organizers } from "@/components/organizers";
import { Stats } from "@/components/stats";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <About />
      <Organizers />
      <News />
      <Archive />
      <Stats />
    </main>
  );
}
