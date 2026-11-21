// Feature maps z = phi(x1, x2). Every fn has signature (x1, x2) => number,
// so a custom mathjs expression can plug in later with the same interface.

export const FEATURES = [
  { id: "r2", label: "x₁² + x₂²", fn: (x1, x2) => x1 * x1 + x2 * x2 },
  { id: "x1sq", label: "x₁²", fn: (x1) => x1 * x1 },
  { id: "x2sq", label: "x₂²", fn: (x1, x2) => x2 * x2 },
  { id: "x1x2", label: "x₁·x₂", fn: (x1, x2) => x1 * x2 },
  { id: "absx1", label: "|x₁|", fn: (x1) => Math.abs(x1) },
  { id: "absx2", label: "|x₂|", fn: (x1, x2) => Math.abs(x2) },
  {
    id: "r",
    label: "√(x₁² + x₂²)",
    fn: (x1, x2) => Math.sqrt(x1 * x1 + x2 * x2),
  },
];

export function getFeature(id) {
  return FEATURES.find((f) => f.id === id);
}

// Wrap any fn so NaN / Infinity become 0 instead of breaking plots.
export function safeFn(fn) {
  return (x1, x2) => {
    const v = fn(x1, x2);
    return Number.isFinite(v) ? v : 0;
  };
}

export function liftPoints(points, fn) {
  return points.map((p) => fn(p.x1, p.x2));
}

// Min/max of z over the points, used to auto-scale the plane sliders.
export function zRange(points, fn) {
  let lo = Infinity;
  let hi = -Infinity;
  for (const p of points) {
    const z = fn(p.x1, p.x2);
    if (z < lo) lo = z;
    if (z > hi) hi = z;
  }
  return { lo, hi };
}
