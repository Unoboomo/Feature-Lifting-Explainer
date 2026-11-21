import { useEffect, useMemo, useRef, useState } from "react";
import Plane2D from "./Plane2D";
import { Panel, Btn, Slider } from "./ui";
import { generateDataset } from "../lib/datasets";
import { bestLine, lineAccuracy } from "../lib/classify";

const zero = () => 0;
const pct = (v) => `${(v * 100).toFixed(1)}%`;
const RAD = Math.PI / 180;

export default function Stalemate() {
  const ds = useMemo(() => generateDataset("rings"), []);
  const [deg, setDeg] = useState(35);
  const [t, setT] = useState(1.0);
  const [best, setBest] = useState(null);
  const [busy, setBusy] = useState(false);
  const raf = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // The line n·x = t, written as the plane z = a·x₁ + b·x₂ + c with z ≡ 0.
  const plane = useMemo(
    () => ({ a: -Math.cos(deg * RAD), b: -Math.sin(deg * RAD), c: t }),
    [deg, t],
  );
  const acc = useMemo(() => lineAccuracy(ds.all, deg * RAD, t), [ds, deg, t]);

  function findBest() {
    cancelAnimationFrame(raf.current);
    const b = bestLine(ds.all);
    setBest(b.acc);
    const d0 = deg;
    const t0 = t;
    const d1 = (b.theta / RAD) % 180;
    const t1 = b.t;
    const start = performance.now();
    setBusy(true);
    const step = (now) => {
      const k = Math.min((now - start) / 700, 1);
      const e = 1 - (1 - k) ** 3;
      setDeg(d0 + (d1 - d0) * e);
      setT(t0 + (t1 - t0) * e);
      if (k < 1) raf.current = requestAnimationFrame(step);
      else setBusy(false);
    };
    raf.current = requestAnimationFrame(step);
  }

  function onSlide(setter) {
    return (v) => {
      cancelAnimationFrame(raf.current);
      setBusy(false);
      setter(v);
    };
  }

  return (
    <Panel title="Section 02 / The stalemate" tag="Interactable 1">
      <div className="grid grid-cols-1 border-b-4 border-white-hot">
        <div className="border-b-4 border-white-hot px-4 py-2 text-xs tracking-widest uppercase">
          2D input space · one straight line, two half-spaces
        </div>
        <Plane2D
          domain={ds.domain}
          points={ds.all}
          testPoints={null}
          fn={zero}
          plane={plane}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="border-b-4 border-white-hot lg:border-r-4 lg:border-b-0">
          <Slider
            label="Line angle (deg)"
            value={deg}
            min={0}
            max={180}
            step={1}
            onChange={onSlide(setDeg)}
          />
          <Slider
            label="Line offset"
            accent="arc"
            value={t}
            min={-2.5}
            max={2.5}
            step={0.02}
            onChange={onSlide(setT)}
          />
          <div className="p-4">
            <Btn tone="danger" onClick={findBest} className="w-full">
              {busy ? "Searching…" : "Find optimal line →"}
            </Btn>
          </div>
        </div>
        <div className="border-b-4 border-white-hot p-4 lg:border-r-4 lg:border-b-0">
          <div className="text-xs tracking-widest text-flame uppercase">
            Accuracy
          </div>
          <div className="text-5xl font-medium text-arc">{pct(acc.best)}</div>
          <div className="mt-2 text-xs tracking-wide">
            {acc.orientation === 1
              ? "One side of the line = class 1 (red)."
              : "Sides swapped: the other side = class 1 (red)."}
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs tracking-widest text-flame uppercase">
            Best possible line
          </div>
          <div className="text-3xl font-medium text-white-hot">
            {best === null ? "—" : pct(best)}
          </div>
          <div className="mt-2 text-xs leading-relaxed tracking-wide">
            {best === null
              ? "Drag the line by hand, then let the search find the best one."
              : "Searched every angle and every offset. Any straight cut slices through the red ring and still misses the corners of it. The best line is nowhere near 100%."}
          </div>
        </div>
      </div>
    </Panel>
  );
}
