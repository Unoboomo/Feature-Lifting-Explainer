export function Section({ n, title, children }) {
  return (
    <section className="border-4 border-white-hot bg-char">
      <div className="flex items-stretch justify-between border-b-4 border-white-hot text-xs tracking-widest uppercase">
        <div className="px-4 py-3">Section {n}</div>
        <div className="bg-flame px-4 py-3 font-medium text-char">{n} / 05</div>
      </div>
      <div className="max-w-3xl space-y-4 px-4 py-6 text-sm leading-relaxed md:px-6">
        <h2 className="text-3xl leading-tight font-medium tracking-tight uppercase md:text-4xl">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

export function P({ children }) {
  return <p>{children}</p>;
}

export function Eq({ children }) {
  return (
    <div className="overflow-x-auto border-4 border-white-hot bg-ash px-4 py-3 text-base text-arc md:text-lg">
      {children}
    </div>
  );
}

export function Callout({ label, children }) {
  return (
    <div className="border-l-8 border-flame bg-ash px-4 py-3">
      {label && (
        <div className="mb-1 text-xs tracking-widest text-flame uppercase">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

export function Item({ k, children }) {
  return (
    <li className="flex gap-3">
      <span className="shrink-0 text-flame">{k}</span>
      <span>{children}</span>
    </li>
  );
}

export function Hl({ children }) {
  return <span className="text-arc">{children}</span>;
}
