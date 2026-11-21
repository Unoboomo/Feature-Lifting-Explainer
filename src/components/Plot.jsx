import { memo } from "react";
import Plotly from "plotly.js-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";

// memo: skip re-rendering a plot when its props (data/layout) are unchanged.
const Plot = memo(createPlotlyComponent(Plotly));
export default Plot;
