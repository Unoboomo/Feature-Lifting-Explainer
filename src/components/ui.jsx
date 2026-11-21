export function Panel({ tag, title, children, className = "" }) {
  return (
    <section className={`border-4 border-white-hot bg-char ${className}`}>
      <div className="flex items-stretch justify-between border-b-4 border-white-hot text-xs tracking-widest">
        <div className="px-4 py-3 uppercase">{title}</div>
        {tag && (
          <div className="bg-arc px-4 py-3 font-medium text-char uppercase">
            {tag}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

export function Btn({
  active,
  onClick,
  children,
  tone = "default",
  className = "",
}) {
  const base =
    "border-2 border-white-hot px-3 py-2 text-left text-xs uppercase tracking-widest cursor-pointer ";
  const look =
    tone === "danger"
      ? "bg-ember text-white-hot hover:bg-flame hover:text-char"
      : active
        ? "bg-arc text-char"
        : "bg-char text-white-hot hover:bg-ash";
  return (
    <button
      type="button"
      onClick={onClick}
      className={base + look + " " + className}
    >
      {children}
    </button>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  accent = "flame",
}) {
  const color = accent === "arc" ? "accent-arc" : "accent-flame";
  return (
    <div className="border-b-4 border-white-hot p-4 last:border-b-0">
      <div className="flex justify-between text-xs uppercase tracking-widest">
        <span>{label}</span>
        <span className="text-arc">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`mt-2 w-full ${color}`}
        aria-label={label}
      />
    </div>
  );
}
