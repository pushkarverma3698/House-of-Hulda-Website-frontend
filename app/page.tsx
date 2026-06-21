import { ScrollProvider } from "@/lib/scroll-progress";
import { GradedBackground } from "@/components/scroll/GradedBackground";
import { ProgressBar } from "@/components/scroll/ProgressBar";
import { Header } from "@/components/layout/Header";
import { Threshold } from "@/components/sections/Threshold";
import { Ascent } from "@/components/sections/Ascent";
import { Arrival } from "@/components/sections/Arrival";
import { Sanctuaries } from "@/components/sections/Sanctuaries";
import { TheTable } from "@/components/sections/TheTable";
import { Wonder } from "@/components/sections/Wonder";
import { Invitation } from "@/components/sections/Invitation";
import { Coda } from "@/components/sections/Coda";

/**
 * The scroll story. One master scroll-progress drives the global grade; each
 * Act is a semantic <section> keyed to the story-bible chapter ID — the shared
 * contract between design and code.
 */
export default function Home() {
  return (
    <ScrollProvider>
      <ProgressBar />
      <GradedBackground />
      <Header />
      <main className="relative z-[1]">
        <Threshold />
        <Ascent />
        <Arrival />
        <Sanctuaries />
        <TheTable />
        <Wonder />
        <Invitation />
        <Coda />
      </main>
      <div className="cine-overlay" aria-hidden />
    </ScrollProvider>
  );
}
