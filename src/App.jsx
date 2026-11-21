import LoadingScreen from "./components/LoadingScreen";
import Stalemate from "./components/Stalemate";
import GuidedLift from "./components/GuidedLift";
import Playground from "./components/Playground";
import {
  Hero,
  Section1,
  Section2Text,
  Section2After,
  Section3Text,
  Section3After,
  Section4Text,
  Section5,
} from "./components/Sections";

export default function App() {
  return (
    <>
      <LoadingScreen />
      <main className="min-h-screen bg-char p-4 md:p-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-10">
          <Hero />
          <Section1 />
          <Section2Text />
          <Stalemate />
          <Section2After />
          <Section3Text />
          <GuidedLift />
          <Section3After />
          <Section4Text />
          <Playground />
          <Section5 />
        </div>
      </main>
    </>
  );
}
