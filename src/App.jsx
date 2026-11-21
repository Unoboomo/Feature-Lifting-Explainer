import LoadingScreen from "./components/LoadingScreen";
import Stalemate from "./components/Stalemate";
import GuidedLift from "./components/GuidedLift";
import Playground from "./components/Playground";

export default function App() {
  return (
    <>
      <LoadingScreen />
      <main className="min-h-screen bg-char p-4 md:p-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-10">
          <Stalemate />
          <GuidedLift />
          <Playground />
        </div>
      </main>
    </>
  );
}
