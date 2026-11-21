import { lazy, Suspense } from "react";

// Plotly is large, so it loads in its own chunk and the page shell appears first.
const Plot = lazy(() => import("./Plot"));

export default function LazyPlot(props) {
  return (
    <Suspense
      fallback={
        <div
          className="grid place-items-center text-xs tracking-widest uppercase"
          style={{ height: 480 }}
        >
          Loading 3D engine…
        </div>
      }
    >
      <Plot {...props} />
    </Suspense>
  );
}
