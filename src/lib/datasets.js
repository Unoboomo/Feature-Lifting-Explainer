// Seeded RNG + dataset generators. Each dataset is split into train/test.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeRng(seed) {
  const u = mulberry32(seed);
  const n = () => {
    const a = Math.max(u(), 1e-12);
    return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * u());
  };
  return { u, n };
}

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng.u() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Stratified split so both classes appear in train and test.
export function splitTrainTest(points, rng, testFrac = 0.3) {
  const train = [];
  const test = [];
  for (const cls of [0, 1]) {
    const group = shuffle(
      points.filter((p) => p.y === cls),
      rng,
    );
    const nTest = Math.round(group.length * testFrac);
    test.push(...group.slice(0, nTest));
    train.push(...group.slice(nTest));
  }
  return { train: shuffle(train, rng), test: shuffle(test, rng) };
}

// Area-uniform sample in an annulus [r0, r1] around (cx, cy).
function annulus(rng, cx, cy, r0, r1) {
  const r = Math.sqrt(r0 * r0 + rng.u() * (r1 * r1 - r0 * r0));
  const t = 2 * Math.PI * rng.u();
  return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
}

const jitter = (rng, v, noise) => v + noise * rng.n();

function rings(rng, n, noise, cx, cy) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const y = i % 2;
    const [x1, x2] =
      y === 0 ? annulus(rng, cx, cy, 0, 0.7) : annulus(rng, cx, cy, 1.2, 1.8);
    pts.push({ x1: jitter(rng, x1, noise), x2: jitter(rng, x2, noise), y });
  }
  return pts;
}

function stripes(rng, n, noise) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const y = i % 2; // class 0 = middle band, class 1 = outer bands
    const sign = rng.u() < 0.5 ? -1 : 1;
    const x1 = y === 0 ? (rng.u() * 2 - 1) * 0.7 : sign * (1.2 + rng.u() * 0.9);
    const x2 = (rng.u() * 2 - 1) * 2.2;
    pts.push({ x1: jitter(rng, x1, noise), x2: jitter(rng, x2, noise), y });
  }
  return pts;
}

function xor(rng, n, noise) {
  const pts = [];
  const margin = 0.2;
  while (pts.length < n) {
    const x1 = (rng.u() * 2 - 1) * 2.2;
    const x2 = (rng.u() * 2 - 1) * 2.2;
    if (Math.abs(x1) < margin || Math.abs(x2) < margin) continue;
    pts.push({
      x1: jitter(rng, x1, noise),
      x2: jitter(rng, x2, noise),
      y: x1 * x2 > 0 ? 1 : 0,
    });
  }
  return pts;
}

export const DATASETS = [
  {
    id: "rings",
    name: "Concentric rings",
    solvedBy: "r2",
    domain: { x1: [-2.5, 2.5], x2: [-2.5, 2.5] },
    build: (rng, n, noise) => rings(rng, n, noise, 0, 0),
  },
  {
    id: "shifted",
    name: "Shifted rings",
    solvedBy: "r2", // needs a tilted plane: a ≈ 2p, b ≈ 2q
    center: [0.7, -0.5],
    domain: { x1: [-3, 3], x2: [-3, 3] },
    build: (rng, n, noise) => rings(rng, n, noise, 0.7, -0.5),
  },
  {
    id: "stripes",
    name: "Parallel stripes",
    solvedBy: "x1sq",
    domain: { x1: [-3, 3], x2: [-3, 3] },
    build: (rng, n, noise) => stripes(rng, n, noise),
  },
  {
    id: "xor",
    name: "XOR / checkerboard",
    solvedBy: "x1x2",
    domain: { x1: [-2.5, 2.5], x2: [-2.5, 2.5] },
    build: (rng, n, noise) => xor(rng, n, noise),
  },
];

export function getDataset(id) {
  return DATASETS.find((d) => d.id === id);
}

// Returns { id, name, domain, all, train, test }.
export function generateDataset(
  id,
  { seed = 1, n = 200, noise = 0.05, testFrac = 0.3 } = {},
) {
  const spec = getDataset(id);
  const rng = makeRng(seed + id.length * 1013);
  const all = spec.build(rng, n, noise);
  const { train, test } = splitTrainTest(all, rng, testFrac);
  return {
    id,
    name: spec.name,
    solvedBy: spec.solvedBy,
    domain: spec.domain,
    all,
    train,
    test,
  };
}
