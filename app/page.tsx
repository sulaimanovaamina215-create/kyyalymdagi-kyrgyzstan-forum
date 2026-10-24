import { About } from "@/components/about";
import { Archive } from "@/components/archive";
import { Hero } from "@/components/hero";
import { News } from "@/components/news";
import { Organizers } from "@/components/organizers";
import { Stats } from "@/components/stats";
import { getStats } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initial = await getStats();
  return (
    <main>
      <Hero />
      <Stats initial={initial} />
      <About />
      <Organizers />
      <News />
      <Archive />
    </main>
  );
}
