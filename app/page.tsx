
"use client";

import React, { useEffect, useMemo, useState } from "react";

type Mode = "Base" | "Optimistic" | "Reality";

type Inputs = {
  // Release + funnel
  releaseName: string;
  territory: "India";
  days: number;

  spotifyDaily: number;
  appleDaily: number;
  youtubeDaily: number;
  otherDaily: number;

  // Monetisation
  spotifyRps: number; // ₹ per stream
  appleRps: number;
  youtubeRps: number;
  otherRps: number;

  // Rights / deal
  artistSharePct: number; // of net
  labelSharePct: number; // of net (should be 100 - artistShare)
  publisherSharePct: number; // optional slice (kept simple)
  adminFeePct: number; // fee on gross before splits

  // Costs + advance
  marketingSpend: number; // ₹
  fixedCosts: number; // ₹
  advance: number; // ₹
  recoupFromArtistPct: number; // % of artist share used to recoup

  // UGC / social lift
  igReelsLiftPct: number; // +% streams
  shortsLiftPct: number; // +% streams
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const compact = (n: number) =>
  new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n);

function pct(n: number) {
  return `${Math.round(n)}%`;
}

function safeNumber(v: string, fallback = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
}

function SliderRow(props: {
  label: string;
  help?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
  prefix?: string;
}) {
  const { label, help, value, min, max, step = 1, onChange, suffix, prefix } = props;
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-slate-900">{label}</div>
          {help ? <div className="text-xs text-slate-500">{help}</div> : null}
        </div>
        <div className="text-sm font-semibold tabular-nums text-slate-900">
          {prefix}
          {value.toLocaleString("en-IN")}
          {suffix}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(safeNumber(e.target.value, value))}
        className="w-full"
      />
    </div>
  );
}

function NumberRow(props: {
  label: string;
  help?: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  prefix?: string;
}) {
  const { label, help, value, onChange, suffix, prefix } = props;
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-slate-900">{label}</div>
          {help ? <div className="text-xs text-slate-500">{help}</div> : null}
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        {prefix ? <span className="text-sm text-slate-500">{prefix}</span> : null}
        <input
          inputMode="numeric"
          className="w-full bg-transparent text-sm text-slate-900 outline-none tabular-nums"
          value={String(value)}
          onChange={(e) => onChange(safeNumber(e.target.value, value))}
        />
        {suffix ? <span className="text-sm text-slate-500">{suffix}</span> : null}
      </div>
    </div>
  );
}

function Pill({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full px-3 py-1 text-xs font-semibold transition",
        active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Card(props: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <div className="text-sm font-semibold text-slate-900">{props.title}</div>
        {props.subtitle ? <div className="text-xs text-slate-500">{props.subtitle}</div> : null}
      </div>
      {props.children}
    </div>
  );
}

function Stat(props: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium text-slate-500">{props.label}</div>
      <div className="mt-1 text-xl font-bold text-slate-900 tabular-nums">{props.value}</div>
      {props.hint ? <div className="mt-1 text-xs text-slate-500">{props.hint}</div> : null}
    </div>
  );
}

function ShareLinkButton({ inputs }: { inputs: Inputs }) {
  const url = useMemo(() => {
    const u = new URL(typeof window !== "undefined" ? window.location.href : "https://example.com");
    const params = new URLSearchParams();
    Object.entries(inputs).forEach(([k, v]) => params.set(k, String(v)));
    u.search = params.toString();
    return u.toString();
  }, [inputs]);

  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {
          // fallback: do nothing
        }
      }}
      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
      title={url}
    >
      {copied ? "Copied ✅" : "Copy share link"}
    </button>
  );
}

export default function Page() {
  const [mode, setMode] = useState<Mode>("Base");

  const base: Inputs = useMemo(
    () => ({
      releaseName: "India Release Simulator",
      territory: "India",
      days: 365,

      spotifyDaily: 12000,
      appleDaily: 2500,
      youtubeDaily: 18000,
      otherDaily: 3500,

      // Conservative “₹ per stream” placeholders — tweak later with your own benchmarks
      spotifyRps: 0.45,
      appleRps: 0.9,
      youtubeRps: 0.12,
      otherRps: 0.3,

      artistSharePct: 70,
      labelSharePct: 30,
      publisherSharePct: 0,
      adminFeePct: 12,

      marketingSpend: 250000,
      fixedCosts: 25000,
      advance: 500000,
      recoupFromArtistPct: 50,

      igReelsLiftPct: 10,
      shortsLiftPct: 5,
    }),
    []
  );

  const [inputs, setInputs] = useState<Inputs>(base);

  // Hydrate from URL ?... for shareable scenarios
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.size) return;

    setInputs((prev) => {
      const next = { ...prev } as any;
      params.forEach((v, k) => {
        if (k in next) {
          const current = (next as any)[k];
          if (typeof current === "number") next[k] = safeNumber(v, current);
          else next[k] = v;
        }
      });
      // sanity
      next.artistSharePct = clamp(next.artistSharePct, 0, 100);
      next.labelSharePct = clamp(100 - next.artistSharePct, 0, 100);
      return next;
    });
  }, []);

  // Keep label share as complement (simple rule for now)
  useEffect(() => {
    setInputs((p) => {
      const artist = clamp(p.artistSharePct, 0, 100);
      const label = clamp(100 - artist, 0, 100);
      if (label === p.labelSharePct && artist === p.artistSharePct) return p;
      return { ...p, artistSharePct: artist, labelSharePct: label };
    });
  }, [inputs.artistSharePct]);

  const tuned = useMemo(() => {
    const m = mode;
    const multiplier =
      m === "Optimistic"
        ? 1.25
        : m === "Reality"
        ? 0.8
        : 1.0;

    const socialLift =
      1 + (inputs.igReelsLiftPct + inputs.shortsLiftPct) / 100;

    const effectiveMult = multiplier * socialLift;

    const days = Math.max(1, Math.floor(inputs.days));

    const platform = {
      spotify: {
        daily: inputs.spotifyDaily * effectiveMult,
        rps: inputs.spotifyRps,
      },
      apple: {
        daily: inputs.appleDaily * effectiveMult,
        rps: inputs.appleRps,
      },
      youtube: {
        daily: inputs.youtubeDaily * effectiveMult,
        rps: inputs.youtubeRps,
      },
      other: {
        daily: inputs.otherDaily * effectiveMult,
        rps: inputs.otherRps,
      },
    };

    const totals = Object.values(platform).reduce(
      (acc, p) => {
        const streams = p.daily * days;
        const gross = streams * p.rps;
        acc.streams += streams;
        acc.gross += gross;
        return acc;
      },
      { streams: 0, gross: 0 }
    );

    const adminFee = (inputs.adminFeePct / 100) * totals.gross;
    const netAfterAdmin = totals.gross - adminFee;

    // Keep it simple: publisher slice reduces “pool” before artist/label split (optional)
    const publisher = (inputs.publisherSharePct / 100) * netAfterAdmin;
    const pool = netAfterAdmin - publisher;

    const artist = (inputs.artistSharePct / 100) * pool;
    const label = (inputs.labelSharePct / 100) * pool;

    const totalCosts = inputs.marketingSpend + inputs.fixedCosts;

    // Advance recoup from artist share only (simple)
    const recoupCap = (inputs.recoupFromArtistPct / 100) * artist;
    const recouped = Math.min(inputs.advance, recoupCap);
    const unrecouped = Math.max(0, inputs.advance - recouped);

    const artistTakeHome = artist - recouped;
    const labelNet = label - totalCosts; // label spends marketing/costs in this model

    const totalNetToParties = artistTakeHome + labelNet + publisher;

    // ROI-ish metrics
    const labelPayback = inputs.advance + totalCosts;
    const labelROIPct = labelPayback > 0 ? ((label - labelPayback) / labelPayback) * 100 : 0;

    // Required daily streams to break even on label payback (solve linearly)
    const grossPerDay =
      inputs.spotifyDaily * inputs.spotifyRps +
      inputs.appleDaily * inputs.appleRps +
      inputs.youtubeDaily * inputs.youtubeRps +
      inputs.otherDaily * inputs.otherRps;

    const grossPerDayAdj = grossPerDay * effectiveMult;

    const netPerDayAdj =
      grossPerDayAdj * (1 - inputs.adminFeePct / 100) * (1 - inputs.publisherSharePct / 100) * (inputs.labelSharePct / 100);

    const breakevenDays = netPerDayAdj > 0 ? labelPayback / netPerDayAdj : Infinity;

    return {
      effectiveMult,
      days,
      platform,
      totals,
      adminFee,
      netAfterAdmin,
      publisher,
      pool,
      artist,
      label,
      totalCosts,
      recouped,
      unrecouped,
      artistTakeHome,
      labelNet,
      totalNetToParties,
      labelPayback,
      labelROIPct,
      breakevenDays,
    };
  }, [inputs, mode]);

  const reset = () => setInputs(base);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">INTRSCT Labs • Prototype</div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
              India Release & Royalty Advance Simulator
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Quick & dirty model to sanity-check streams → ₹ → splits → recoup. Share scenarios via URL.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Pill active={mode === "Base"} onClick={() => setMode("Base")}>Base</Pill>
              <Pill active={mode === "Optimistic"} onClick={() => setMode("Optimistic")}>Optimistic</Pill>
              <Pill active={mode === "Reality"} onClick={() => setMode("Reality")}>Reality check</Pill>
              <span className="ml-2 text-xs text-slate-500">
                Effective multiplier: <span className="font-semibold text-slate-800">{tuned.effectiveMult.toFixed(2)}×</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <ShareLinkButton inputs={inputs} />
            <button
              onClick={reset}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Left: Inputs */}
          <div className="lg:col-span-5 space-y-4">
            <Card title="Release assumptions" subtitle="Volume + window">
              <div className="grid grid-cols-1 gap-3">
                <NumberRow
                  label="Forecast window (days)"
                  help="How many days to project."
                  value={inputs.days}
                  onChange={(v) => setInputs((p) => ({ ...p, days: clamp(v, 7, 3650) }))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <NumberRow
                    label="Spotify daily streams"
                    value={inputs.spotifyDaily}
                    onChange={(v) => setInputs((p) => ({ ...p, spotifyDaily: clamp(v, 0, 5_000_000) }))}
                  />
                  <NumberRow
                    label="Apple daily streams"
                    value={inputs.appleDaily}
                    onChange={(v) => setInputs((p) => ({ ...p, appleDaily: clamp(v, 0, 5_000_000) }))}
                  />
                  <NumberRow
                    label="YouTube daily views"
                    value={inputs.youtubeDaily}
                    onChange={(v) => setInputs((p) => ({ ...p, youtubeDaily: clamp(v, 0, 10_000_000) }))}
                  />
                  <NumberRow
                    label="Other daily streams"
                    value={inputs.otherDaily}
                    onChange={(v) => setInputs((p) => ({ ...p, otherDaily: clamp(v, 0, 5_000_000) }))}
                  />
                </div>
              </div>
            </Card>

            <Card title="₹ per stream (RPS)" subtitle="Replace with your own benchmarks later">
              <div className="grid grid-cols-2 gap-3">
                <NumberRow
                  label="Spotify ₹/stream"
                  value={inputs.spotifyRps}
                  onChange={(v) => setInputs((p) => ({ ...p, spotifyRps: clamp(v, 0, 5) }))}
                />
                <NumberRow
                  label="Apple ₹/stream"
                  value={inputs.appleRps}
                  onChange={(v) => setInputs((p) => ({ ...p, appleRps: clamp(v, 0, 5) }))}
                />
                <NumberRow
                  label="YouTube ₹/view"
                  value={inputs.youtubeRps}
                  onChange={(v) => setInputs((p) => ({ ...p, youtubeRps: clamp(v, 0, 2) }))}
                />
                <NumberRow
                  label="Other ₹/stream"
                  value={inputs.otherRps}
                  onChange={(v) => setInputs((p) => ({ ...p, otherRps: clamp(v, 0, 5) }))}
                />
              </div>
            </Card>

            <Card title="Deal + costs" subtitle="Splits, admin, advance, recoup">
              <div className="space-y-4">
                <SliderRow
                  label="Artist share (%)"
                  help="Label share auto-adjusts to 100% - artist."
                  value={inputs.artistSharePct}
                  min={0}
                  max={100}
                  step={1}
                  suffix="%"
                  onChange={(v) => setInputs((p) => ({ ...p, artistSharePct: clamp(v, 0, 100) }))}
                />

                <div className="grid grid-cols-2 gap-3">
                  <NumberRow
                    label="Admin fee (%)"
                    help="Applied on gross before splits."
                    value={inputs.adminFeePct}
                    onChange={(v) => setInputs((p) => ({ ...p, adminFeePct: clamp(v, 0, 30) }))}
                    suffix="%"
                  />
                  <NumberRow
                    label="Publisher share (%)"
                    help="Optional. Set 0 if ignoring publishing."
                    value={inputs.publisherSharePct}
                    onChange={(v) => setInputs((p) => ({ ...p, publisherSharePct: clamp(v, 0, 50) }))}
                    suffix="%"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <NumberRow
                    label="Marketing spend (₹)"
                    value={inputs.marketingSpend}
                    onChange={(v) => setInputs((p) => ({ ...p, marketingSpend: clamp(v, 0, 50_000_000) }))}
                    prefix="₹"
                  />
                  <NumberRow
                    label="Fixed costs (₹)"
                    value={inputs.fixedCosts}
                    onChange={(v) => setInputs((p) => ({ ...p, fixedCosts: clamp(v, 0, 10_000_000) }))}
                    prefix="₹"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <NumberRow
                    label="Advance (₹)"
                    value={inputs.advance}
                    onChange={(v) => setInputs((p) => ({ ...p, advance: clamp(v, 0, 100_000_000) }))}
                    prefix="₹"
                  />
                  <NumberRow
                    label="Recoup from artist (%)"
                    help="% of artist share used for recoup."
                    value={inputs.recoupFromArtistPct}
                    onChange={(v) => setInputs((p) => ({ ...p, recoupFromArtistPct: clamp(v, 0, 100) }))}
                    suffix="%"
                  />
                </div>
              </div>
            </Card>

            <Card title="UGC / social lift" subtitle="Simple uplift to streams (you can replace later with real signals)">
              <div className="grid grid-cols-2 gap-3">
                <NumberRow
                  label="IG Reels lift (%)"
                  value={inputs.igReelsLiftPct}
                  onChange={(v) => setInputs((p) => ({ ...p, igReelsLiftPct: clamp(v, 0, 300) }))}
                  suffix="%"
                />
                <NumberRow
                  label="Shorts lift (%)"
                  value={inputs.shortsLiftPct}
                  onChange={(v) => setInputs((p) => ({ ...p, shortsLiftPct: clamp(v, 0, 300) }))}
                  suffix="%"
                />
              </div>
            </Card>
          </div>

          {/* Right: Outputs */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Stat label="Total streams (forecast)" value={compact(tuned.totals.streams)} />
              <Stat label="Gross revenue" value={INR.format(tuned.totals.gross)} hint="Before admin/publisher/splits" />
              <Stat label="Net after admin fee" value={INR.format(tuned.netAfterAdmin)} hint={`Admin fee: ${INR.format(tuned.adminFee)}`} />
              <Stat label="Pool for artist/label" value={INR.format(tuned.pool)} hint={tuned.publisher > 0 ? `Publisher: ${INR.format(tuned.publisher)}` : "Publisher: ₹0"} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Stat
                label="Artist take-home"
                value={INR.format(Math.max(0, tuned.artistTakeHome))}
                hint={`Artist share: ${INR.format(tuned.artist)} • Recouped: ${INR.format(tuned.recouped)}`}
              />
              <Stat
                label="Label net (after costs)"
                value={INR.format(tuned.labelNet)}
                hint={`Label share: ${INR.format(tuned.label)} • Costs: ${INR.format(tuned.totalCosts)}`}
              />
              <Stat
                label="Unrecouped advance"
                value={INR.format(tuned.unrecouped)}
                hint="If > 0, advance didn’t fully recoup from artist share in this window."
              />
              <Stat
                label="Label ROI (simple)"
                value={pct(tuned.labelROIPct)}
                hint={`Payback basis: advance + costs = ${INR.format(tuned.labelPayback)}`}
              />
            </div>

            <Card title="Break-even sanity check" subtitle="How long until label recovers advance + spend (simple linear estimate)">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {Number.isFinite(tuned.breakevenDays) ? `${Math.ceil(tuned.breakevenDays).toLocaleString("en-IN")} days` : "—"}
                  </div>
                  <div className="text-xs text-slate-500">
                    Assumes daily streams stay flat at the current scenario & multiplier.
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  Label share per day (net-ish):{" "}
                  <span className="font-semibold text-slate-800">
                    {Number.isFinite(tuned.breakevenDays) ? INR.format(tuned.labelPayback / Math.max(1, tuned.breakevenDays)) : "—"}
                  </span>
                </div>
              </div>
            </Card>

            <Card title="Platform breakdown" subtitle="Gross by platform (in this scenario)">
              <div className="space-y-3">
                {(["spotify", "apple", "youtube", "other"] as const).map((k) => {
                  const p = tuned.platform[k];
                  const streams = p.daily * tuned.days;
                  const gross = streams * p.rps;
                  return (
                    <div key={k} className="flex items-center justify-between gap-3">
                      <div className="flex items-baseline gap-2">
                        <div className="text-sm font-semibold text-slate-900 capitalize">{k}</div>
                        <div className="text-xs text-slate-500">
                          {compact(streams)} plays • ₹{p.rps.toFixed(2)}/play
                        </div>
                      </div>
                      <div className="text-sm font-bold text-slate-900 tabular-nums">{INR.format(gross)}</div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="What to do next" subtitle="2 quick upgrades to make this feel like a real catalogue tool">
              <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
                <li>
                  Add <span className="font-semibold">“Decay curve”</span> (streams drop over time) instead of flat daily streams.
                </li>
                <li>
                  Add <span className="font-semibold">catalogue factors</span>: age of song, territory mix, DSP mix, playlisting, UGC signals → uplift.
                </li>
              </ol>
            </Card>
          </div>
        </div>

        <div className="mt-6 text-xs text-slate-500">
          Note: this is a toy model scaffold. Replace ₹/stream benchmarks and deal logic with your actual fund assumptions.
        </div>
      </div>
    </div>
  );
}
