import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import LazyPlot from "./LazyPlot";
import Plane2D from "./Plane2D";
import { COLORS, baseLayout, axis3d, plotConfig, plotStyle } from "./plotTheme";
import { pointTrace, flatSurface, wrongTrace3d } from "./plotHelpers";
import { Panel, Btn, Slider } from "./ui";
import { generateDataset } from "../lib/datasets";
import { accuracy, gridScores, wrongPoints } from "../lib/classify";

const Z_HI = 4.2;
const SURF_N = 30;
const pct = (v) => `${(v * 100).toFixed(1)}%`;

export default function GuidedLift() {
  const [lambda, setLambda] = useState(0);
  const [c, setC] = useState(1.2);
  const [playing, setPlaying] = useState(false);
  const raf = useRef(0);

  const ds = useMemo(() => generateDataset("rings"), []);
  // 2D canvas + readouts use the live values; the 3D scene follows deferred copies.
  const lam = useDeferredValue(lambda);
  const height = useDeferredValue(c);
  const fnNow = useMemo(
    () => (x1, x2) => lambda * (x1 * x1 + x2 * x2),
    [lambda],
  );
  const planeNow = useMemo(() => ({ a: 0, b: 0, c }), [c]);
  const fn3d = useMemo(() => (x1, x2) => lam * (x1 * x1 + x2 * x2), [lam]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  function stop() {
    cancelAnimationFrame(raf.current);
    setPlaying(false);
  }

  function play() {
    cancelAnimationFrame(raf.current);
    setPlaying(true);
    const start = performance.now();
    const step = (t) => {
      const k = Math.min((t - start) / 2500, 1);
      setLambda(k);
      if (k < 1) raf.current = requestAnimationFrame(step);
      else setPlaying(false);
    };
    raf.current = requestAnimationFrame(step);
  }

  const acc = useMemo(
    () => accuracy(ds.all, fnNow, planeNow),
    [ds, fnNow, planeNow],
  );

  const points3d = useMemo(
    () => [
      pointTrace(ds.all, 0, false, true, fn3d),
      pointTrace(ds.all, 1, false, true, fn3d),
    ],
    [ds, fn3d],
  );
  const dataSurface = useMemo(() => {
    const sg = gridScores(fn3d, { a: 0, b: 0, c: 0 }, ds.domain, SURF_N);
    return flatSurface(sg.xs, sg.ys, sg.z, COLORS.flame, 0.22);
  }, [fn3d, ds]);
  const planeTrace = useMemo(() => {
    const [x0, x1] = ds.domain.x1;
    const [y0, y1] = ds.domain.x2;
    return flatSurface(
      [x0, x1],
      [y0, y1],
      [
        [height, height],
        [height, height],
      ],
      COLORS.arc,
      0.5,
    );
  }, [ds, height]);

  const wrong3d = useMemo(() => {
    const pl = { a: 0, b: 0, c: height };
    const o = accuracy(ds.all, fn3d, pl).orientation;
    return wrongTrace3d(wrongPoints(ds.all, fn3d, pl, o), fn3d);
  }, [ds, fn3d, height]);

  const right = useMemo(
    () => [dataSurface, planeTrace, ...points3d, wrong3d],
    [dataSurface, planeTrace, points3d, wrong3d],
  );
  const nWrong = useMemo(
    () => wrongPoints(ds.all, fnNow, planeNow, acc.orientation).length,
    [ds, fnNow, planeNow, acc],
  );

  const radius = lambda > 0.001 && c > 0 ? Math.sqrt(c / lambda) : null;

  const rightLayout = useMemo(
    () => ({
      ...baseLayout,
      margin: { l: 0, r: 0, t: 0, b: 0 },
      scene: {
        xaxis: axis3d("x₁", ds.domain.x1),
        yaxis: axis3d("x₂", ds.domain.x2),
        zaxis: axis3d("z", [0, Z_HI]),
        aspectmode: "manual",
        aspectratio: { x: 1, y: 1, z: 0.8 },
        camera: { eye: { x: 1.7, y: -1.7, z: 0.9 } },
      },
    }),
    [ds],
  );

  let caption;
  if (lambda < 0.05)
    caption = "Flat at z = 0 the classes are still tangled. Lift the data.";
  else if (acc.best < 0.95)
    caption =
      "The bowl is rising. Move the plane until it sits between the base and the rim.";
  else caption = "Separated. A perfectly flat plane carves a circle in 2D.";

  return (
    <Panel title="Section 03 / Feature lifting" tag="Interactable 2">
      <div className="grid grid-cols-1 border-b-4 border-white-hot lg:grid-cols-2">
        <div className="border-b-4 border-white-hot lg:border-r-4 lg:border-b-0">
          <div className="border-b-4 border-white-hot px-4 py-2 text-xs tracking-widest uppercase">
            2D input space · circle where plane meets surface
          </div>
          <Plane2D
            domain={ds.domain}
            points={ds.all}
            testPoints={null}
            fn={fnNow}
            plane={planeNow}
          />
        </div>
        <div>
          <div className="border-b-4 border-white-hot px-4 py-2 text-xs tracking-widest uppercase">
            3D lifted space · z = λ·(x₁² + x₂²)
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
          <Slider
            label="Lift intensity λ"
            value={lambda}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => {
              stop();
              setLambda(v);
            }}
          />
          <Slider
            label="Plane height c"
            accent="arc"
            value={c}
            min={0}
            max={Z_HI}
            step={0.02}
            onChange={setC}
          />
          <div className="p-4">
            <Btn tone="danger" onClick={play} className="w-full">
              {playing ? "Lifting…" : "Play lift →"}
            </Btn>
          </div>
        </div>
        <div className="border-b-4 border-white-hot p-4 lg:border-r-4 lg:border-b-0">
          <div className="text-xs tracking-widest text-flame uppercase">
            Accuracy
          </div>
          <div className="text-5xl font-medium text-arc">{pct(acc.best)}</div>
          <div className="mt-1 text-xs tracking-wide text-arc">
            {nWrong} wrong · boxed in yellow
          </div>
          <div className="mt-2 text-xs tracking-wide">
            {acc.orientation === 1
              ? "Above the plane = class 1 (red)."
              : "Sides swapped: below the plane = class 1 (red)."}
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs tracking-widest text-flame uppercase">
            Circle radius
          </div>
          <div className="text-3xl font-medium text-white-hot">
            {radius === null ? "—" : `r = ${radius.toFixed(2)}`}
          </div>
          <div className="mt-1 text-xs tracking-wide">
            The plane cuts the bowl where λ·r² = c.
          </div>
          <div className="mt-3 text-xs leading-relaxed tracking-wide">
            {caption}
          </div>
        </div>
      </div>
    </Panel>
  );
}
