export const COLORS = {
  char: "#0E0B0A",
  ash: "#1B1613",
  ember: "#D7260B",
  flame: "#FF6A00",
  arc: "#FFC400",
  hot: "#FFF6D6",
};

const GRID = "rgba(255,246,214,0.22)";
const AXIS_LINE = "rgba(255,246,214,0.6)";
const MONO =
  'ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace';

export const baseLayout = {
  paper_bgcolor: COLORS.ash,
  plot_bgcolor: COLORS.ash,
  font: { family: MONO, color: COLORS.hot, size: 11 },
  margin: { l: 44, r: 14, t: 14, b: 40 },
  showlegend: false,
  uirevision: "keep",
};

export const axis2d = (title, range, extra = {}) => ({
  title: { text: title },
  range,
  gridcolor: GRID,
  zerolinecolor: AXIS_LINE,
  zerolinewidth: 2,
  linecolor: AXIS_LINE,
  linewidth: 2,
  mirror: true,
  tickfont: { color: COLORS.hot },
  fixedrange: true,
  ...extra,
});

export const axis3d = (title, range) => ({
  title: { text: title },
  range,
  backgroundcolor: COLORS.ash,
  gridcolor: GRID,
  zerolinecolor: AXIS_LINE,
  linecolor: AXIS_LINE,
  showbackground: true,
  tickfont: { color: COLORS.hot, size: 10 },
});

export const plotConfig = { displayModeBar: false, responsive: true };
