'use client';

import { useEffect, useMemo, useState } from 'react';
import Presets from '@/components/Presets';
import ResultsCards from '@/components/ResultsCards';
import ShareLinkButton from '@/components/ShareLinkButton';
import Tabs from '@/components/Tabs';
import { applyPreset, calculateModel, defaultScenario, Mode, Scenario } from '@/lib/model';
import { decodeScenario, encodeScenario } from '@/lib/share';

const tabs = ['Release', 'Deal', 'Marketing', 'Content + Creators'];
const modes: Mode[] = ['Reality Check', 'Base Case', 'Optimist', 'Copium'];

const num = (value: string) => Number(value || 0);

export default function Page() {
  const [scenario, setScenario] = useState<Scenario>(defaultScenario);
  const [activeTab, setActiveTab] = useState(tabs[0]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = decodeScenario(params.get('s'));
    if (fromUrl) setScenario(fromUrl);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('s', encodeScenario(scenario));
    const next = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', next);
  }, [scenario]);

  const output = useMemo(() => calculateModel(scenario), [scenario]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">India Release & Royalty Advance Simulator</h1>
          <p className="text-sm text-slate-600">Model advance asks, required performance, and minimum spend for India lanes.</p>
        </div>
        <div className="flex items-center gap-2">
          <ShareLinkButton scenario={scenario} />
          <button
            type="button"
            onClick={() => setScenario(defaultScenario)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            Reset to defaults
          </button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_1.4fr]">
        <section>
          <Presets onApply={(name) => setScenario((prev) => applyPreset(prev, name))} />

          <div className="card mb-4">
            <p className="mb-2 text-sm font-semibold">Mode</p>
            <div className="flex flex-wrap gap-2">
              {modes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setScenario((prev) => ({ ...prev, mode }))}
                  className={`rounded-full px-3 py-1 text-xs ${scenario.mode === mode ? 'bg-ink text-white' : 'bg-slate-200'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
            {activeTab === 'Release' && <ReleaseTab scenario={scenario} setScenario={setScenario} />}
            {activeTab === 'Deal' && <DealTab scenario={scenario} setScenario={setScenario} />}
            {activeTab === 'Marketing' && <MarketingTab scenario={scenario} setScenario={setScenario} />}
            {activeTab === 'Content + Creators' && <ContentTab scenario={scenario} setScenario={setScenario} />}
          </div>
        </section>

        <section>
          <ResultsCards output={output} />
        </section>
      </div>
    </main>
  );
}

function ReleaseTab({ scenario, setScenario }: { scenario: Scenario; setScenario: React.Dispatch<React.SetStateAction<Scenario>> }) {
  return (
    <div className="grid gap-3">
      <Field label="Genre lane">
        <select value={scenario.release.lane} onChange={(e) => setScenario((p) => ({ ...p, release: { ...p.release, lane: e.target.value as Scenario['release']['lane'] } }))}>
          {[
            'Hindi pop (non-film)',
            'Punjabi hip-hop',
            'Tamil/Telugu mass',
            'English indie (Spotify-first)',
            'Devotional (YouTube-first)',
            'Remix/Cover (UGC-first)'
          ].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </Field>
      <Field label="Language">
        <input value={scenario.release.language} onChange={(e) => setScenario((p) => ({ ...p, release: { ...p.release, language: e.target.value } }))} />
      </Field>
      <Field label="Film vs non-film">
        <select
          value={scenario.release.film ? 'film' : 'non-film'}
          onChange={(e) => setScenario((p) => ({ ...p, release: { ...p.release, film: e.target.value === 'film' } }))}
        >
          <option value="non-film">Non-film</option>
          <option value="film">Film</option>
        </select>
      </Field>
      <Field label="Primary platform">
        <select
          value={scenario.release.platform}
          onChange={(e) => setScenario((p) => ({ ...p, release: { ...p.release, platform: e.target.value as Scenario['release']['platform'] } }))}
        >
          <option>YouTube-first</option>
          <option>Reels-first</option>
          <option>Spotify-first</option>
        </select>
      </Field>
      <Field label="Artist tier">
        <select value={scenario.release.tier} onChange={(e) => setScenario((p) => ({ ...p, release: { ...p.release, tier: e.target.value as Scenario['release']['tier'] } }))}>
          <option>new</option>
          <option>emerging</option>
          <option>mid</option>
          <option>established</option>
        </select>
      </Field>
      <Field label="Target region">
        <input value={scenario.release.targetRegion} onChange={(e) => setScenario((p) => ({ ...p, release: { ...p.release, targetRegion: e.target.value } }))} />
      </Field>
    </div>
  );
}

function DealTab({ scenario, setScenario }: { scenario: Scenario; setScenario: React.Dispatch<React.SetStateAction<Scenario>> }) {
  return (
    <div className="grid gap-3">
      <Field label="Advance ask (₹)">
        <input type="number" value={scenario.deal.advanceAsk} onChange={(e) => setScenario((p) => ({ ...p, deal: { ...p.deal, advanceAsk: num(e.target.value) } }))} />
      </Field>
      <Field label="Distributor/label share (%)">
        <input type="number" value={scenario.deal.labelSharePct} onChange={(e) => setScenario((p) => ({ ...p, deal: { ...p.deal, labelSharePct: num(e.target.value) } }))} />
      </Field>
      <Field label="Marketing recoup">
        <select
          value={scenario.deal.marketingRecoup ? 'yes' : 'no'}
          onChange={(e) => setScenario((p) => ({ ...p, deal: { ...p.deal, marketingRecoup: e.target.value === 'yes' } }))}
        >
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </Field>
      <Field label="Payout timing (months)">
        <input
          type="number"
          value={scenario.deal.payoutTimingMonths}
          onChange={(e) => setScenario((p) => ({ ...p, deal: { ...p.deal, payoutTimingMonths: num(e.target.value) } }))}
        />
      </Field>
    </div>
  );
}

function MarketingTab({ scenario, setScenario }: { scenario: Scenario; setScenario: React.Dispatch<React.SetStateAction<Scenario>> }) {
  const m = scenario.marketing;
  const update = (key: keyof Scenario['marketing'], value: number) => setScenario((p) => ({ ...p, marketing: { ...p.marketing, [key]: value } }));

  return (
    <div className="grid gap-3">
      <NumberInput label="Meta Reels ads" value={m.metaReelsAds} onChange={(v) => update('metaReelsAds', v)} />
      <NumberInput label="YouTube ads" value={m.youtubeAds} onChange={(v) => update('youtubeAds', v)} />
      <NumberInput label="Influencer/creator seeding" value={m.creatorSeeding} onChange={(v) => update('creatorSeeding', v)} />
      <NumberInput label="PR" value={m.pr} onChange={(v) => update('pr', v)} />
      <NumberInput label="Playlist pitching" value={m.playlistPitching} onChange={(v) => update('playlistPitching', v)} />
      <NumberInput label="Content production" value={m.contentProduction} onChange={(v) => update('contentProduction', v)} />
    </div>
  );
}

function ContentTab({ scenario, setScenario }: { scenario: Scenario; setScenario: React.Dispatch<React.SetStateAction<Scenario>> }) {
  const c = scenario.content;
  return (
    <div className="grid gap-3">
      <NumberInput
        label="Planned reels/week"
        currency={false}
        value={c.reelsPerWeek}
        onChange={(v) => setScenario((p) => ({ ...p, content: { ...p.content, reelsPerWeek: v } }))}
      />
      <NumberInput
        label="Shorts/week"
        currency={false}
        value={c.shortsPerWeek}
        onChange={(v) => setScenario((p) => ({ ...p, content: { ...p.content, shortsPerWeek: v } }))}
      />
      <NumberInput
        label="Creators seeded"
        currency={false}
        value={c.creatorsSeeded}
        onChange={(v) => setScenario((p) => ({ ...p, content: { ...p.content, creatorsSeeded: v } }))}
      />
      <NumberInput
        label="Avg creator fee (₹)"
        value={c.avgCreatorFee}
        onChange={(v) => setScenario((p) => ({ ...p, content: { ...p.content, avgCreatorFee: v } }))}
      />
      <Field label="Content days">
        <select
          value={c.contentDays}
          onChange={(e) => setScenario((p) => ({ ...p, content: { ...p.content, contentDays: Number(e.target.value) as 14 | 30 } }))}
        >
          <option value={14}>14</option>
          <option value={30}>30</option>
        </select>
      </Field>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  currency = true
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  currency?: boolean;
}) {
  return (
    <Field label={currency ? `${label} (₹)` : label}>
      <input type="number" value={value} onChange={(e) => onChange(num(e.target.value))} />
    </Field>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
