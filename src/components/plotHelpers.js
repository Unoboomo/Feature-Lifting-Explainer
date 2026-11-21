import { COLORS } from "./plotTheme";

// One class of points as a 2D or 3D marker trace. `test` draws hollow squares.
export function pointTrace(pts, cls, test, dim3, fn) {
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

// A single-color translucent surface (data surface or slicing plane).
export const flatSurface = (xs, ys, z, color, opacity) => ({
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

// Big hollow arc-yellow squares drawn around misclassified points in 3D.
export function wrongTrace3d(wrong, fn) {
  return {
    type: "scatter3d",
    mode: "markers",
    hoverinfo: "skip",
    showlegend: false,
    x: wrong.map((p) => p.x1),
    y: wrong.map((p) => p.x2),
    z: wrong.map((p) => fn(p.x1, p.x2)),
    marker: {
      symbol: "square-open",
      size: 8,
      color: COLORS.arc,
      line: { width: 3, color: COLORS.arc },
    },
  };
}
