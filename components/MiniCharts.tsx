'use client';

interface LineChartProps {
  data: number[];
}

export function LineChart({ data }: LineChartProps) {
  const max = Math.max(...data, 1);
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1 || 1)) * 100;
      const y = 100 - (d / max) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" className="h-32 w-full rounded-md bg-slate-50 p-2">
      <polyline fill="none" stroke="#4f46e5" strokeWidth="2" points={points} />
    </svg>
  );
}

export function GateBars({ values }: { values: { label: string; value: number }[] }) {
  return (
    <div className="space-y-2">
      {values.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex justify-between text-xs">
            <span>{item.label}</span>
            <span>{item.value}%</span>
          </div>
          <div className="h-2 rounded bg-slate-200">
            <div className="h-2 rounded bg-indigo-500" style={{ width: `${item.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
