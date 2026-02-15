'use client';

import { ModelOutput } from '@/lib/model';
import { GateBars, LineChart } from './MiniCharts';

const fmtINR = (v: number) => `₹${new Intl.NumberFormat('en-IN').format(Math.round(v))}`;

export default function ResultsCards({ output }: { output: ModelOutput }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <p className="text-xs uppercase text-slate-500">Recommended advance ask</p>
          <p className="mt-1 text-xl font-semibold">
            {fmtINR(output.revenue.recommendedAdvanceLow)} - {fmtINR(output.revenue.recommendedAdvanceHigh)}
          </p>
          <p className="mt-1 text-xs text-slate-500">NPV-based with risk haircut and payout delay discounting.</p>
        </div>
        <div className="card">
          <p className="text-xs uppercase text-slate-500">Deal Health Score</p>
          <p className="mt-1 text-3xl font-semibold">{output.dealHealthScore}/100</p>
          <p className="mt-1 text-sm font-medium text-indigo-700">{output.spendLabel}</p>
        </div>
      </div>

      <div className="card">
        <p className="font-semibold">Required performance to justify ask</p>
        <div className="mt-2 grid gap-3 md:grid-cols-3">
          <Stat label="Required total streams/views" value={output.required.totalUnits.toLocaleString('en-IN')} />
          <Stat label="Required daily avg (30d)" value={output.required.daily30.toLocaleString('en-IN')} />
          <Stat label="Required daily avg (90d)" value={output.required.daily90.toLocaleString('en-IN')} />
        </div>
        <p className="mt-3 text-xs text-slate-500">12-week target curve</p>
        <LineChart data={output.required.weeklyCurve} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <p className="font-semibold">Minimum Viable Spend Gates</p>
          <p className="mt-1 text-sm text-slate-600">
            Spend {fmtINR(output.totalSpend)} vs threshold {fmtINR(output.mvsThreshold)}.
          </p>
          <GateBars
            values={[
              { label: 'Creative Gate', value: output.gates.creative ? 100 : 45 },
              { label: 'Distribution Gate', value: output.gates.distribution ? 100 : 50 },
              { label: 'Platform Gate', value: output.gates.platform ? 100 : Math.round((output.totalSpend / output.mvsThreshold) * 100) }
            ]}
          />
        </div>
        <div className="card">
          <p className="font-semibold">ROI range + break-even</p>
          <p className="mt-1 text-sm">Low/Base/High ROI: {output.roi.lowPct}% / {output.roi.basePct}% / {output.roi.highPct}%</p>
          <p className="mt-1 text-sm">Break-even month: {output.roi.breakEvenMonth ?? 'Not within 12 months'}</p>
          {output.warnings.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-amber-700">
              {output.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
