import { useEffect, useState } from "react";

const MIN_MS = 600;
const TIMEOUT_MS = 12000;
const EXPECTED_3D = 2;

// Full-site cover. Stays up until the Plotly chunk has downloaded AND both 3D
// scenes have drawn their first frame (or a safety timeout fires).
export default function LoadingScreen() {
  const [phase, setPhase] = useState("loading"); // loading -> leaving -> gone
  const [step, setStep] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const started = performance.now();
    let cancelled = false;

    const waitFor3D = () =>
      new Promise((resolve) => {
        const tick = () => {
          const n = document.querySelectorAll(".js-plotly-plot").length;
          if (n >= EXPECTED_3D || performance.now() - started > TIMEOUT_MS)
            resolve();
          else setTimeout(tick, 100);
        };
        tick();
      });

    (async () => {
      await Promise.all([
        import("./Plot").then(() => !cancelled && setStep(1)),
        document.fonts ? document.fonts.ready : Promise.resolve(),
      ]);
      await waitFor3D();
      if (cancelled) return;
      setStep(2);
      const wait = Math.max(0, MIN_MS - (performance.now() - started));
      setTimeout(() => !cancelled && setPhase("leaving"), wait);
      setTimeout(() => {
        if (!cancelled) setPhase("gone");
      }, wait + 450);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (phase === "gone") document.body.style.overflow = "";
  }, [phase]);

  if (phase === "gone") return null;

  const labels = ["Loading 3D engine", "Drawing the scenes", "Ready"];
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-50 flex flex-col items-stretch justify-center bg-char p-6 transition-transform duration-[450ms] ease-in ${
        phase === "leaving" ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto w-full max-w-xl border-4 border-white-hot">
        <div className="flex items-stretch justify-between border-b-4 border-white-hot text-xs tracking-widest uppercase">
          <div className="px-4 py-3">Feature lifting</div>
          <div className="bg-arc px-4 py-3 font-medium text-char">Loading</div>
        </div>
        <div className="p-4">
          <div className="text-2xl font-medium tracking-tight text-arc uppercase">
            {labels[step]}…
          </div>
          <div className="relative mt-4 h-5 overflow-hidden border-4 border-white-hot bg-ash">
            <div className="loader-bar absolute inset-y-0 w-1/3 bg-flame" />
          </div>
          <div className="mt-3 text-xs tracking-widest uppercase">
            Step {step + 1} / 3
          </div>
        </div>
      </div>
    </div>
  );
}
