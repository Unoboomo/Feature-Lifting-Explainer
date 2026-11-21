import { useMemo } from "react";
import { mulberry32 } from "../lib/datasets";
import { COLORS } from "./plotTheme";

const W = 560;
const H = 420;
const S = 330; // plot side in px
const L = (W - S) / 2;
const T = 44;
const R = 3; // domain is [-R, R] on both axes
const K = S / (2 * R);
const sx = (x) => L + S / 2 + x * K;
const sy = (y) => T + S / 2 - y * K;
const MONO =
  'ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace';

// Hard-edged arrow: rectangular shaft + sharp triangular head, all mitered.
function arrowPoints(x, y, dx, dy, shaft, head, thick = 8, wide = 28) {
  const nx = -dy;
  const ny = dx;
  const p = (a, b) =>
    `${(x + dx * a + nx * b).toFixed(1)},${(y + dy * a + ny * b).toFixed(1)}`;
  const t = thick / 2;
  const h = wide / 2;
  return [
    p(0, -t),
    p(shaft, -t),
    p(shaft, -h),
    p(shaft + head, 0),
    p(shaft, h),
    p(shaft, t),
    p(0, t),
  ].join(" ");
}

// Static figure: a linearly separable dataset, the decision line, and the normal w.
// All labels live in the margins so nothing overlaps the plot.
export default function LinearFigure() {
  const pts = useMemo(() => {
    const u = mulberry32(11);
    const n = () =>
      Math.sqrt(-2 * Math.log(Math.max(u(), 1e-12))) *
      Math.cos(2 * Math.PI * u());
    const out = [];
    for (const [cls, cx, cy] of [
      [0, -1.3, -0.55],
      [1, 1.3, 0.55],
    ]) {
      while (out.filter((p) => p.y === cls).length < 26) {
        const x1 = cx + 0.55 * n();
        const x2 = cy + 0.55 * n();
        const along = (x1 + x2) / Math.SQRT2;
        const across = (x1 - x2) / Math.SQRT2;
        if (Math.abs(along) < 0.45) continue; // keep a clear margin around the line
        if (along > -0.2 && along < 1.9 && Math.abs(across) < 0.5) continue; // keep the arrow clear
        out.push({ x1, x2, y: cls });
      }
    }
    return out;
  }, []);

  const ticks = [-3, -2, -1, 0, 1, 2, 3];

  // w starts at the center of the line and points toward class 1.
  const tx = sx(0);
  const ty = sy(0);
  const d = [Math.SQRT1_2, -Math.SQRT1_2]; // screen direction of w (up-right)
  const l = [Math.SQRT1_2, Math.SQRT1_2]; // screen direction along the line
  const tipX = tx + d[0] * 58;
  const tipY = ty + d[1] * 58;
  const box = 13;
  const rightAngle = [
    [tx + d[0] * box, ty + d[1] * box],
    [tx + d[0] * box + l[0] * box, ty + d[1] * box + l[1] * box],
    [tx + l[0] * box, ty + l[1] * box],
  ]
    .map((q) => q.map((v) => v.toFixed(1)).join(","))
    .join(" ");

  return (
    <figure className="border-4 border-white-hot bg-ash">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label="A linearly separable dataset with its decision line and the weight vector w perpendicular to it"
      >
        <title>Linear classifier</title>
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={sx(t)}
              y1={sy(-R)}
              x2={sx(t)}
              y2={sy(R)}
              stroke="rgba(255,246,214,0.22)"
              strokeWidth={t === 0 ? 2 : 1}
            />
            <line
              x1={sx(-R)}
              y1={sy(t)}
              x2={sx(R)}
              y2={sy(t)}
              stroke="rgba(255,246,214,0.22)"
              strokeWidth={t === 0 ? 2 : 1}
            />
          </g>
        ))}
        <rect
          x={sx(-R)}
          y={sy(R)}
          width={S}
          height={S}
          fill="none"
          stroke="rgba(255,246,214,0.6)"
          strokeWidth="2"
        />

        {pts.map((p, i) => (
          <rect
            key={i}
            x={sx(p.x1) - 4}
            y={sy(p.x2) - 4}
            width="8"
            height="8"
            fill={p.y === 1 ? COLORS.ember : COLORS.hot}
          />
        ))}

        <line
          x1={sx(-R)}
          y1={sy(R)}
          x2={sx(R)}
          y2={sy(-R)}
          stroke={COLORS.arc}
          strokeWidth="4"
          strokeLinecap="butt"
        />

        <polygon
          points={arrowPoints(tx, ty, d[0], d[1], 38, 20, 4, 18)}
          fill={COLORS.flame}
          strokeLinejoin="miter"
        />
        <polyline
          points={rightAngle}
          fill="none"
          stroke={COLORS.hot}
          strokeWidth="2"
          strokeLinejoin="miter"
        />
        <rect
          x={tipX + d[0] * 22 - 12}
          y={tipY + d[1] * 22 - 12}
          width="24"
          height="24"
          fill={COLORS.flame}
        />
        <text
          x={tipX + d[0] * 22}
          y={tipY + d[1] * 22 + 5}
          textAnchor="middle"
          fontFamily={MONO}
          fontSize="15"
          fontWeight="700"
          fill={COLORS.char}
        >
          w
        </text>

        <g fontFamily={MONO} fontSize="12" fill={COLORS.hot}>
          <text x={L} y={T - 16} fill={COLORS.arc}>
            w₁x₁ + w₂x₂ + b = 0
          </text>
          <text x={sx(0)} y={T - 16} textAnchor="middle">
            x₂
          </text>
          <text x={sx(R) + 10} y={sy(0) + 4}>
            x₁
          </text>
          <rect x="60" y={H - 26} width="10" height="10" fill={COLORS.hot} />
          <text x="78" y={H - 17}>
            CLASS 0 · wᵀx + b &lt; 0
          </text>
          <rect x="316" y={H - 26} width="10" height="10" fill={COLORS.ember} />
          <text x="334" y={H - 17}>
            CLASS 1 · wᵀx + b &gt; 0
          </text>
        </g>
      </svg>
      <figcaption className="border-t-4 border-white-hot px-4 py-2 text-xs tracking-widest uppercase">
        Figure 1 · the line is the decision boundary, w is perpendicular to it
        and points at class 1
      </figcaption>
    </figure>
  );
}
