'use client';

import { presets } from '@/lib/model';

interface PresetsProps {
  onApply: (name: string) => void;
}

export default function Presets({ onApply }: PresetsProps) {
  return (
    <div className="card mb-4">
      <p className="mb-2 text-sm font-semibold text-slate-700">India lane presets</p>
      <div className="flex flex-wrap gap-2">
        {Object.keys(presets).map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onApply(preset)}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100"
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}
