import Plot from "./components/Plot";

export default function App() {
  return (
    <main className="min-h-screen bg-char p-6">
      <div className="border-4 border-white-hot">
        <div className="border-b-4 border-white-hot bg-arc px-4 py-3 text-char">
          SETUP OK
        </div>
        <Plot
          data={[
            {
              type: "scatter3d",
              mode: "markers",
              x: [0, 1, 2],
              y: [0, 1, 0],
              z: [0, 1, 4],
              marker: { size: 5, color: "#D7260B", symbol: "square" },
            },
          ]}
          layout={{
            paper_bgcolor: "#1B1613",
            margin: { l: 0, r: 0, t: 0, b: 0 },
            scene: { bgcolor: "#1B1613" },
          }}
          style={{ width: "100%", height: 400 }}
          useResizeHandler
        />
      </div>
    </main>
  );
}
