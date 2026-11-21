import { memo, useEffect, useRef, useState } from "react";
import { COLORS } from "./plotTheme";
import { planeScore } from "../lib/classify";

const H = 480;
const MARGIN = 40;
const N = 100;
const MONO =
  'ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace';

// Plain-canvas 2D panel: grid, points, and the boundary (zero level set of the
// plane score) via marching squares. Redraws in a couple of milliseconds.
function Plane2D({ domain, points, testPoints, fn, plane }) {
  const wrap = useRef(null);
  const canvas = useRef(null);
  const [w, setW] = useState(600);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return undefined;
    const ro = new ResizeObserver((entries) =>
      setW(Math.max(200, Math.floor(entries[0].contentRect.width))),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv && cv.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    cv.width = w * dpr;
    cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const S = Math.min(w, H) - 2 * MARGIN;
    const ox = (w - S) / 2;
    const oy = (H - S) / 2;
    const [x0, x1] = domain.x1;
    const [y0, y1] = domain.x2;
    const sx = (x) => ox + ((x - x0) / (x1 - x0)) * S;
    const sy = (y) => oy + S - ((y - y0) / (y1 - y0)) * S;

    ctx.fillStyle = COLORS.ash;
    ctx.fillRect(0, 0, w, H);

    ctx.font = `11px ${MONO}`;
    ctx.fillStyle = COLORS.hot;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let t = Math.ceil(x0); t <= Math.floor(x1); t++) {
      ctx.strokeStyle =
        t === 0 ? "rgba(255,246,214,0.6)" : "rgba(255,246,214,0.22)";
      ctx.lineWidth = t === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(sx(t), oy);
      ctx.lineTo(sx(t), oy + S);
      ctx.stroke();
      ctx.fillText(String(t), sx(t), oy + S + 6);
    }
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let t = Math.ceil(y0); t <= Math.floor(y1); t++) {
      ctx.strokeStyle =
        t === 0 ? "rgba(255,246,214,0.6)" : "rgba(255,246,214,0.22)";
      ctx.lineWidth = t === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(ox, sy(t));
      ctx.lineTo(ox + S, sy(t));
      ctx.stroke();
      ctx.fillText(String(t), ox - 8, sy(t));
    }
    ctx.strokeStyle = "rgba(255,246,214,0.6)";
    ctx.lineWidth = 2;
    ctx.strokeRect(ox, oy, S, S);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("x₁", ox + S / 2, oy + S + 22);
    ctx.textBaseline = "bottom";
    ctx.fillText("x₂", ox - 22, oy - 6);

    // Boundary: marching squares on the plane score.
    const vals = new Float64Array((N + 1) * (N + 1));
    for (let j = 0; j <= N; j++) {
      const y = y0 + ((y1 - y0) * j) / N;
      for (let i = 0; i <= N; i++) {
        vals[j * (N + 1) + i] = planeScore(
          fn,
          plane,
          x0 + ((x1 - x0) * i) / N,
          y,
        );
      }
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(ox, oy, S, S);
    ctx.clip();
    ctx.beginPath();
    for (let j = 0; j < N; j++) {
      const ya = y0 + ((y1 - y0) * j) / N;
      const yb = y0 + ((y1 - y0) * (j + 1)) / N;
      for (let i = 0; i < N; i++) {
        const xa = x0 + ((x1 - x0) * i) / N;
        const xb = x0 + ((x1 - x0) * (i + 1)) / N;
        const v00 = vals[j * (N + 1) + i];
        const v10 = vals[j * (N + 1) + i + 1];
        const v01 = vals[(j + 1) * (N + 1) + i];
        const v11 = vals[(j + 1) * (N + 1) + i + 1];
        const pts = [];
        const edge = (a, b, ax, ay, bx, by) => {
          if (a > 0 !== b > 0) {
            const t = a / (a - b);
            pts.push([sx(ax + (bx - ax) * t), sy(ay + (by - ay) * t)]);
          }
        };
        edge(v00, v10, xa, ya, xb, ya);
        edge(v10, v11, xb, ya, xb, yb);
        edge(v01, v11, xa, yb, xb, yb);
        edge(v00, v01, xa, ya, xa, yb);
        if (pts.length >= 2) {
          ctx.moveTo(pts[0][0], pts[0][1]);
          ctx.lineTo(pts[1][0], pts[1][1]);
        }
        if (pts.length === 4) {
          ctx.moveTo(pts[2][0], pts[2][1]);
          ctx.lineTo(pts[3][0], pts[3][1]);
        }
      }
    }
    ctx.strokeStyle = COLORS.arc;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();

    for (const p of points) {
      ctx.fillStyle = p.y === 1 ? COLORS.ember : COLORS.hot;
      ctx.fillRect(sx(p.x1) - 3.5, sy(p.x2) - 3.5, 7, 7);
    }
    if (testPoints) {
      ctx.lineWidth = 2;
      for (const p of testPoints) {
        ctx.strokeStyle = p.y === 1 ? COLORS.ember : COLORS.hot;
        ctx.strokeRect(sx(p.x1) - 3.5, sy(p.x2) - 3.5, 7, 7);
      }
    }
  }, [w, domain, points, testPoints, fn, plane]);

  return (
    <div ref={wrap} style={{ width: "100%", height: H }}>
      <canvas
        ref={canvas}
        role="img"
        aria-label="2D input space with points and decision boundary"
        style={{ width: "100%", height: H, display: "block" }}
      />
    </div>
  );
}

export default memo(Plane2D);
