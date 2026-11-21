import { useMemo, useState } from "react";
import Plot from "./Plot";
import { COLORS, baseLayout, axis2d, axis3d, plotConfig } from "./plotTheme";
import { Panel, Btn, Slider } from "./ui";
import { DATASETS, generateDataset } from "../lib/datasets";
import { FEATURES, getFeature, safeFn, zRange } from "../lib/features";
import { accuracy, autoFit, gridScores } from "../lib/classify";

const TIPS = {
  rings:
    "Flat plane (a = b = 0) at the right height gives a circle centered at the origin.",
  shifted:
    "A flat plane gives a circle stuck at the origin. Tilt it: expanding (x₁−p)² + (x₂−q)² adds linear terms, which a tilted plane supplies.",
  stripes:
    "Radius ignores the stripe direction. Try a feature that only looks at x₁.",
  xor: "No line separates opposite quadrants, and squares are blind to sign combinations. Try a feature that mixes x₁ and x₂.",
};

const pct = (v) => `${(v * 100).toFixed(1)}%`;

function median(arr) {
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function startPlane(ds, fn) {
  return { a: 0, b: 0, c: median(ds.all.map((p) => fn(p.x1, p.x2))) };
}

function pointTrace(pts, cls, test, dim3, fn) {
  const sel = pts.filter((p) => p.y === cls);
  const color = cls === 1 ? COLORS.ember : COLORS.hot;
  const marker = {
    symbol: test ? "square-open" : "square",
    size: dim3 ? 3.5 : 7,
    color,
    line: test ? { width: 2, color } : { width: 0 },
  };
  const base = {
    mode: "markers",
    hoverinfo: "skip",
    showlegend: false,
    marker,
  };
  const x = sel.map((p) => p.x1);
  const y = sel.map((p) => p.x2);
  return dim3
    ? { ...base, type: "scatter3d", x, y, z: sel.map((p) => fn(p.x1, p.x2)) }
    : { ...base, type: "scatter", x, y };
}

const flatSurface = (xs, ys, z, color, opacity) => ({
  type: "surface",
  x: xs,
  y: ys,
  z,
  opacity,
  showscale: false,
  hoverinfo: "skip",
  colorscale: [
    [0, color],
    [1, color],
  ],
});

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

  const grid = useMemo(
    () => gridScores(fn, plane, ds.domain, 90),
    [fn, plane, ds],
  );
  const surf = useMemo(() => {
    const g = gridScores(fn, { a: 0, b: 0, c: 0 }, ds.domain, 36);
    return { xs: g.xs, ys: g.ys, z: g.z }; // with a=b=c=0 the score is z = phi(x1, x2)
  }, [fn, ds]);
  const planeZ = useMemo(
    () =>
      surf.ys.map((y) =>
        surf.xs.map((x) => plane.a * x + plane.b * y + plane.c),
      ),
    [surf, plane],
  );

  const left = [
    {
      type: "heatmap",
      x: grid.xs,
      y: grid.ys,
      z: grid.z.map((row) =>
        row.map((v) => (v * trainAcc.orientation > 0 ? 1 : 0)),
      ),
      zmin: 0,
      zmax: 1,
      showscale: false,
      hoverinfo: "skip",
      colorscale: [
        [0, "rgba(255,246,214,0.07)"],
        [1, "rgba(215,38,11,0.24)"],
      ],
    },
    {
      type: "contour",
      x: grid.xs,
      y: grid.ys,
      z: grid.z,
      showscale: false,
      hoverinfo: "skip",
      contours: { start: 0, end: 0, size: 1, coloring: "none" },
      line: { color: COLORS.arc, width: 4 },
    },
    pointTrace(ds.train, 0, false, false),
    pointTrace(ds.train, 1, false, false),
    ...(showTest
      ? [
          pointTrace(ds.test, 0, true, false),
          pointTrace(ds.test, 1, true, false),
        ]
      : []),
  ];

  const right = [
    flatSurface(surf.xs, surf.ys, surf.z, COLORS.flame, 0.22),
    flatSurface(surf.xs, surf.ys, planeZ, COLORS.arc, 0.5),
    pointTrace(ds.train, 0, false, true, fn),
    pointTrace(ds.train, 1, false, true, fn),
    ...(showTest
      ? [
          pointTrace(ds.test, 0, true, true, fn),
          pointTrace(ds.test, 1, true, true, fn),
        ]
      : []),
  ];

  const leftLayout = {
    ...baseLayout,
    xaxis: axis2d("x₁", ds.domain.x1),
    yaxis: axis2d("x₂", ds.domain.x2, { scaleanchor: "x", scaleratio: 1 }),
  };
  const rightLayout = {
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
  };

  const lim = (v) => Math.max(3, Math.ceil(Math.abs(v)));
  const cStep = Math.max((zHi - zLo) / 300, 0.005);

  return (
    <Panel title="Section 04 / Playground" tag="Interactable 3">
      <div className="grid grid-cols-1 border-b-4 border-white-hot lg:grid-cols-2">
        <div className="border-b-4 border-white-hot lg:border-r-4 lg:border-b-0">
          <div className="border-b-4 border-white-hot px-4 py-2 text-xs tracking-widest uppercase">
            2D input space · boundary is the level set
          </div>
          <Plot
            data={left}
            layout={leftLayout}
            config={plotConfig}
            useResizeHandler
            style={{ width: "100%", height: 480 }}
          />
        </div>
        <div>
          <div className="border-b-4 border-white-hot px-4 py-2 text-xs tracking-widest uppercase">
            3D lifted space · flat plane z = a·x₁ + b·x₂ + c
          </div>
          <Plot
            data={right}
            layout={rightLayout}
            config={plotConfig}
            useResizeHandler
            style={{ width: "100%", height: 480 }}
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
