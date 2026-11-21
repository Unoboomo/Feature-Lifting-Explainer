// Plane evaluation, accuracy, auto-fit, and best-line search.
// Plane in lifted space: z = a*x1 + b*x2 + c. A point is predicted
// class 1 when it lies ABOVE the plane (orientation = +1), or class 0
// when the sides are flipped (orientation = -1).

// Signed height of the lifted point above the plane. Zero set = 2D boundary.
export function planeScore(fn, plane, x1, x2) {
  return fn(x1, x2) - (plane.a * x1 + plane.b * x2 + plane.c);
}

// Accuracy reported as max(acc, 1 - acc), plus which side is class 1.
export function accuracy(points, fn, plane) {
  if (points.length === 0) return { raw: 0, best: 0, orientation: 1 };
  let correct = 0;
  for (const p of points) {
    const pred = planeScore(fn, plane, p.x1, p.x2) > 0 ? 1 : 0;
    if (pred === p.y) correct++;
  }
  const raw = correct / points.length;
  return {
    raw,
    best: Math.max(raw, 1 - raw),
    orientation: raw >= 0.5 ? 1 : -1,
  };
}

// Grid of plane scores for drawing the 2D contour (row-major, rows = x2).
export function gridScores(fn, plane, domain, n = 80) {
  const xs = [];
  const ys = [];
  for (let i = 0; i < n; i++) {
    xs.push(domain.x1[0] + ((domain.x1[1] - domain.x1[0]) * i) / (n - 1));
    ys.push(domain.x2[0] + ((domain.x2[1] - domain.x2[0]) * i) / (n - 1));
  }
  const z = ys.map((y) => xs.map((x) => planeScore(fn, plane, x, y)));
  return { xs, ys, z };
}

// Logistic regression on (x1, x2, z) with standardized inputs, then convert
// weights back to the plane z = a*x1 + b*x2 + c.
export function autoFit(points, fn, { steps = 100, lr = 1.0 } = {}) {
  const n = points.length;
  const X = points.map((p) => [p.x1, p.x2, fn(p.x1, p.x2)]);
  const mu = [0, 0, 0];
  const sd = [0, 0, 0];
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < n; i++) mu[j] += X[i][j];
    mu[j] /= n;
    for (let i = 0; i < n; i++) sd[j] += (X[i][j] - mu[j]) ** 2;
    sd[j] = Math.sqrt(sd[j] / n) || 1;
  }
  const Z = X.map((r) => r.map((v, j) => (v - mu[j]) / sd[j]));
  const w = [0, 0, 0];
  let w0 = 0;
  for (let s = 0; s < steps; s++) {
    const g = [0, 0, 0];
    let g0 = 0;
    for (let i = 0; i < n; i++) {
      const t = w0 + w[0] * Z[i][0] + w[1] * Z[i][1] + w[2] * Z[i][2];
      const err = 1 / (1 + Math.exp(-t)) - points[i].y;
      g0 += err;
      for (let j = 0; j < 3; j++) g[j] += err * Z[i][j];
    }
    w0 -= (lr * g0) / n;
    for (let j = 0; j < 3; j++) w[j] -= (lr * g[j]) / n;
  }
  // Back to raw units: logit = W0 + W1*x1 + W2*x2 + W3*z
  const W = w.map((v, j) => v / sd[j]);
  const W0 = w0 - w.reduce((acc, v, j) => acc + (v * mu[j]) / sd[j], 0);
  if (Math.abs(W[2]) < 1e-9) return null; // vertical plane: not representable
  return { a: -W[0] / W[2], b: -W[1] / W[2], c: -W0 / W[2] };
}

// Brute-force best straight line in 2D (Interactable 1). Line: n·x = t with
// n = (cos θ, sin θ). Sweeps every threshold for each angle in O(n log n).
export function bestLine(points, { angles = 180 } = {}) {
  const n = points.length;
  let best = { acc: -1, theta: 0, t: 0, orientation: 1 };
  for (let k = 0; k < angles; k++) {
    const theta = (Math.PI * k) / angles;
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const proj = points
      .map((p) => ({ v: p.x1 * c + p.x2 * s, y: p.y }))
      .sort((a, b) => a.v - b.v);
    const ones = proj.reduce((acc, p) => acc + p.y, 0);
    let zerosBelow = 0;
    let onesBelow = 0;
    for (let i = 0; i <= n; i++) {
      // threshold sits before index i: points i.. are predicted class 1
      const raw = (zerosBelow + (ones - onesBelow)) / n;
      const score = Math.max(raw, 1 - raw);
      if (score > best.acc) {
        const t =
          i === 0
            ? proj[0].v - 1e-6
            : i === n
              ? proj[n - 1].v + 1e-6
              : (proj[i - 1].v + proj[i].v) / 2;
        best = { acc: score, theta, t, orientation: raw >= 0.5 ? 1 : -1 };
      }
      if (i < n) {
        if (proj[i].y === 0) zerosBelow++;
        else onesBelow++;
      }
    }
  }
  return best;
}

// Accuracy of a specific 2D line (for the draggable starting line).
export function lineAccuracy(points, theta, t) {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  let correct = 0;
  for (const p of points) {
    const pred = p.x1 * c + p.x2 * s > t ? 1 : 0;
    if (pred === p.y) correct++;
  }
  const raw = correct / points.length;
  return {
    raw,
    best: Math.max(raw, 1 - raw),
    orientation: raw >= 0.5 ? 1 : -1,
  };
}
