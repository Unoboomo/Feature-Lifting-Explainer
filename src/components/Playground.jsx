import { useDeferredValue, useMemo, useState } from "react";
import LazyPlot from "./LazyPlot";
import Plane2D from "./Plane2D";
import { COLORS, baseLayout, axis3d, plotConfig, plotStyle } from "./plotTheme";
import { pointTrace, flatSurface, wrongTrace3d } from "./plotHelpers";
import { Panel, Btn, Slider } from "./ui";
import { DATASETS, generateDataset } from "../lib/datasets";
import { FEATURES, getFeature, safeFn, zRange } from "../lib/features";
import { accuracy, autoFit, gridScores, wrongPoints } from "../lib/classify";

const TIPS = {
  rings:
    "Flat plane (a = b = 0) at the right height gives a circle centered at the origin.",
  shifted:
    "A flat plane gives a circle stuck at the origin. Tilt it: expanding (x₁−p)² + (x₂−q)² adds linear terms, which a tilted plane supplies.",
  stripes:
    "Radius ignores the stripe direction. Try a feature that only looks at x₁.",
  spiral:
    "Try every feature. None of them work, because the classes depend on angle and radius together. Lifting only helps when you can find the right feature.",
  xor: "No line separates opposite quadrants, and squares are blind to sign combinations. Try a feature that mixes x₁ and x₂.",
};

const SURF_N = 30;
const pct = (v) => `${(v * 100).toFixed(1)}%`;

function median(arr) {
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function startPlane(ds, fn) {
  return { a: 0, b: 0, c: median(ds.all.map((p) => fn(p.x1, p.x2))) };
}

export default function Playground() {
  const [datasetId, setDatasetId] = useState("rings");
  const [featureId, setFeatureId] = useState("r2");
  const [showTest, setShowTest] = useState(false);
  const [note, setNote] = useState("");
  const [plane, setPlane] = useState(() =>
    startPlane(generateDataset("rings"), safeFn(getFeature("r2").fn)),
  );

  const ds = useMemo(() => generateDataset(datasetId), [datasetId]);
  const feat = getFeature(featureId);
  const fn = useMemo(() => safeFn(feat.fn), [feat]);

  const zr = useMemo(() => zRange(ds.all, fn), [ds, fn]);
  const pad = (zr.hi - zr.lo) * 0.1 || 1;
  const zLo = zr.lo - pad;
  const zHi = zr.hi + pad;

  function choose(nextDataset, nextFeature) {
    const d = nextDataset === datasetId ? ds : generateDataset(nextDataset);
    const f = safeFn(getFeature(nextFeature).fn);
    setDatasetId(nextDataset);
    setFeatureId(nextFeature);
    setPlane(startPlane(d, f));
    setNote("");
  }

  const trainAcc = useMemo(
    () => accuracy(ds.train, fn, plane),
    [ds, fn, plane],
  );
  const testAcc = useMemo(() => accuracy(ds.test, fn, plane), [ds, fn, plane]);

  function runAutoFit() {
    const p = autoFit(ds.train, fn);
    if (p) {
      setPlane(p);
      setNote("");
    } else {
      setNote(
        "Auto-fit found a vertical plane, which the sliders cannot show. Plane unchanged.",
      );
    }
  }

  // The 2D canvas follows the sliders instantly; the 3D scene follows a deferred copy.
  const live = useDeferredValue(plane);

  const dataSurface = useMemo(() => {
    const g = gridScores(fn, { a: 0, b: 0, c: 0 }, ds.domain, SURF_N); // score = phi(x1, x2)
    return flatSurface(g.xs, g.ys, g.z, COLORS.flame, 0.22);
  }, [fn, ds]);

  // A plane is linear, so its four corners are exact.
  const planeTrace = useMemo(() => {
    const [x0, x1] = ds.domain.x1;
    const [y0, y1] = ds.domain.x2;
    const h = (x, y) => live.a * x + live.b * y + live.c;
    return flatSurface(
      [x0, x1],
      [y0, y1],
      [
        [h(x0, y0), h(x1, y0)],
        [h(x0, y1), h(x1, y1)],
      ],
      COLORS.arc,
      0.5,
    );
  }, [ds, live]);

  const points3d = useMemo(
    () => [
      pointTrace(ds.train, 0, false, true, fn),
      pointTrace(ds.train, 1, false, true, fn),
      ...(showTest
        ? [
            pointTrace(ds.test, 0, true, true, fn),
            pointTrace(ds.test, 1, true, true, fn),
          ]
        : []),
    ],
    [ds, fn, showTest],
  );

  const wrong3d = useMemo(() => {
    const o = accuracy(ds.train, fn, live).orientation;
    const bad = wrongPoints(ds.train, fn, live, o).concat(
      showTest ? wrongPoints(ds.test, fn, live, o) : [],
    );
    return wrongTrace3d(bad, fn);
  }, [ds, fn, live, showTest]);

  const right = useMemo(
    () => [dataSurface, planeTrace, ...points3d, wrong3d],
    [dataSurface, planeTrace, points3d, wrong3d],
  );
  const nWrong = useMemo(
    () => wrongPoints(ds.train, fn, plane, trainAcc.orientation).length,
    [ds, fn, plane, trainAcc],
  );

  const rightLayout = useMemo(
    () => ({
      ...baseLayout,
      margin: { l: 0, r: 0, t: 0, b: 0 },
      scene: {
        xaxis: axis3d("x₁", ds.domain.x1),
        yaxis: axis3d("x₂", ds.domain.x2),
        zaxis: axis3d("z", [zLo, zHi]),
        aspectmode: "manual",
        aspectratio: { x: 1, y: 1, z: 0.8 },
        camera: { eye: { x: 1.7, y: -1.7, z: 0.9 } },
      },
    }),
    [ds, zLo, zHi],
  );

  const lim = (v) => Math.max(3, Math.ceil(Math.abs(v)));
  const cStep = Math.max((zHi - zLo) / 300, 0.005);

  return (
    <Panel title="Section 04 / Playground" tag="Interactable 3">
      <div className="grid grid-cols-1 border-b-4 border-white-hot lg:grid-cols-2">
        <div className="border-b-4 border-white-hot lg:border-r-4 lg:border-b-0">
          <div className="border-b-4 border-white-hot px-4 py-2 text-xs tracking-widest uppercase">
            2D input space · boundary is the level set
          </div>
          <Plane2D
            domain={ds.domain}
            points={ds.train}
            testPoints={showTest ? ds.test : null}
            fn={fn}
            plane={plane}
          />
        </div>
        <div>
          <div className="border-b-4 border-white-hot px-4 py-2 text-xs tracking-widest uppercase">
            3D lifted space · flat plane z = a·x₁ + b·x₂ + c
          </div>
          <LazyPlot
            data={right}
            layout={rightLayout}
            config={plotConfig}
            useResizeHandler
            style={plotStyle}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="border-b-4 border-white-hot lg:border-r-4 lg:border-b-0">
          <div className="border-b-4 border-white-hot p-4">
            <div className="mb-2 text-xs tracking-widest text-flame uppercase">
              Dataset
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DATASETS.map((d) => (
                <Btn
                  key={d.id}
                  active={d.id === datasetId}
                  onClick={() => choose(d.id, featureId)}
                >
                  {d.name}
                </Btn>
              ))}
            </div>
          </div>
          <div className="p-4">
            <div className="mb-2 text-xs tracking-widest text-flame uppercase">
              Feature z = φ(x₁, x₂)
            </div>
            <div className="grid grid-cols-2 gap-2">
              {FEATURES.map((f) => (
                <Btn
                  key={f.id}
                  active={f.id === featureId}
                  onClick={() => choose(datasetId, f.id)}
                >
                  {f.label}
                </Btn>
              ))}
            </div>
          </div>
        </div>

        <div className="border-b-4 border-white-hot lg:border-r-4 lg:border-b-0">
          <Slider
            label="Tilt a (x₁)"
            value={plane.a}
            min={-lim(plane.a)}
            max={lim(plane.a)}
            step={0.05}
            onChange={(a) => setPlane((p) => ({ ...p, a }))}
          />
          <Slider
            label="Tilt b (x₂)"
            value={plane.b}
            min={-lim(plane.b)}
            max={lim(plane.b)}
            step={0.05}
            onChange={(b) => setPlane((p) => ({ ...p, b }))}
          />
          <Slider
            label="Height c"
            accent="arc"
            value={plane.c}
            min={Math.min(zLo, plane.c)}
            max={Math.max(zHi, plane.c)}
            step={cStep}
            onChange={(c) => setPlane((p) => ({ ...p, c }))}
          />
          <div className="grid grid-cols-2 gap-2 p-4">
            <Btn tone="danger" onClick={runAutoFit}>
              Auto-fit plane →
            </Btn>
            <Btn onClick={() => setPlane(startPlane(ds, fn))}>Reset plane</Btn>
          </div>
        </div>

        <div>
          <div className="border-b-4 border-white-hot p-4">
            <div className="text-xs tracking-widest text-flame uppercase">
              Train accuracy
            </div>
            <div className="text-5xl font-medium text-arc">
              {pct(trainAcc.best)}
            </div>
            <div className="mt-1 text-xs tracking-wide text-arc">
              {nWrong} wrong · boxed in yellow
            </div>
            <div className="mt-2 text-xs tracking-wide">
              {trainAcc.orientation === 1
                ? "Above the plane = class 1 (red)."
                : "Sides swapped: below the plane = class 1 (red)."}
            </div>
          </div>
          <div className="border-b-4 border-white-hot p-4">
            <Btn
              active={showTest}
              onClick={() => setShowTest((s) => !s)}
              className="w-full"
            >
              {showTest ? "Hide held-out points" : "Reveal held-out points"}
            </Btn>
            {showTest && (
              <div className="mt-3">
                <div className="text-xs tracking-widest text-flame uppercase">
                  Test accuracy
                </div>
                <div className="text-3xl font-medium text-white-hot">
                  {pct(testAcc.best)}
                </div>
                <div className="mt-1 text-xs">
                  Hollow squares are held-out points.
                </div>
              </div>
            )}
          </div>
          <div className="p-4 text-xs leading-relaxed tracking-wide">
            {note || TIPS[datasetId]}
          </div>
        </div>
      </div>
    </Panel>
  );
}
