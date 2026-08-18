export function SimpleBarChart({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="flex items-end gap-2" style={{ height: 120 }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-brand"
            style={{ height: `${Math.max(4, (d.count / max) * 96)}px` }}
            title={`${d.count} orders`}
          />
          <span className="text-[10px] text-ink-soft">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
