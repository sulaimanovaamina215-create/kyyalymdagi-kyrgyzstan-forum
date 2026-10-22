export function Bars({ title, items, base }: { title: string; items: { label: string; count: number }[]; base?: number }) {
  const max = Math.max(...items.map((item) => item.count), 1);
  const total = base ?? items.reduce((sum, item) => sum + item.count, 0);

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="font-display text-xl">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.label}>
            <div className="flex justify-between gap-3 text-sm">
              <span>{item.label}</span>
              <span className="tabular-nums text-white/60">
                {item.count}
                {total ? ` · ${Math.round((item.count / total) * 100)}%` : ""}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-ember via-magenta to-aqua" style={{ width: `${(item.count / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function Donut({ title, items }: { title: string; items: { label: string; count: number; color: string }[] }) {
  const total = items.reduce((sum, item) => sum + item.count, 0) || 1;
  let cursor = 0;
  const stops = items.map((item) => {
    const start = (cursor / total) * 100;
    cursor += item.count;
    return `${item.color} ${start}% ${(cursor / total) * 100}%`;
  });

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="font-display text-xl">{title}</h3>
      <div className="mt-4 flex flex-wrap items-center gap-5">
        <div className="h-28 w-28 rounded-full" style={{ background: `conic-gradient(${stops.join(", ")})` }} />
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.label} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
              <span>
                {item.label}: {item.count}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
