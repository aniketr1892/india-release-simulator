export type Lane =
  | 'Hindi pop (non-film)'
  | 'Punjabi hip-hop'
  | 'Tamil/Telugu mass'
  | 'English indie (Spotify-first)'
  | 'Devotional (YouTube-first)'
  | 'Remix/Cover (UGC-first)';

export type Mode = 'Reality Check' | 'Base Case' | 'Optimist' | 'Copium';
export type Tier = 'new' | 'emerging' | 'mid' | 'established';
export type Platform = 'YouTube-first' | 'Reels-first' | 'Spotify-first';

export interface Scenario {
  mode: Mode;
  release: {
    lane: Lane;
    language: string;
    film: boolean;
    platform: Platform;
    tier: Tier;
    targetRegion: string;
  };
  deal: {
    advanceAsk: number;
    labelSharePct: number;
    marketingRecoup: boolean;
    payoutTimingMonths: number;
  };
  marketing: {
    metaReelsAds: number;
    youtubeAds: number;
    creatorSeeding: number;
    pr: number;
    playlistPitching: number;
    contentProduction: number;
  };
  content: {
    reelsPerWeek: number;
    shortsPerWeek: number;
    creatorsSeeded: number;
    avgCreatorFee: number;
    contentDays: 14 | 30;
  };
  assumptions: {
    payouts: {
      youtubeView: number;
      reelsView: number;
      spotifyStream: number;
    };
    conversions: {
      reachToEngagementPct: number;
      engagementToUnitPct: number;
      creatorToUgcUses: number;
      ugcUseToUnits: number;
      saveBoost: number;
    };
    riskHaircutPct: number;
    annualDiscountPct: number;
  };
}

export interface ModelOutput {
  blendedPayout: number;
  totalSpend: number;
  mvsThreshold: number;
  spendLabel: 'Waste zone' | 'Lottery zone' | 'Realistic chance';
  gates: {
    creative: boolean;
    distribution: boolean;
    platform: boolean;
  };
  expectedUnits: number;
  required: {
    totalUnits: number;
    daily30: number;
    daily90: number;
    weeklyCurve: number[];
  };
  revenue: {
    gross: number;
    artistNet: number;
    npv: number;
    recommendedAdvanceLow: number;
    recommendedAdvanceHigh: number;
  };
  roi: {
    lowPct: number;
    basePct: number;
    highPct: number;
    breakEvenMonth: number | null;
  };
  dealHealthScore: number;
  warnings: string[];
}

const modeMultiplier: Record<Mode, number> = {
  'Reality Check': 0.75,
  'Base Case': 1,
  Optimist: 1.3,
  Copium: 1.7
};

const laneThresholds: Record<Lane, Record<Tier, number>> = {
  'Hindi pop (non-film)': { new: 500000, emerging: 1200000, mid: 3000000, established: 7000000 },
  'Punjabi hip-hop': { new: 700000, emerging: 1700000, mid: 3500000, established: 8000000 },
  'Tamil/Telugu mass': { new: 800000, emerging: 2000000, mid: 4500000, established: 9000000 },
  'English indie (Spotify-first)': { new: 350000, emerging: 900000, mid: 2000000, established: 4500000 },
  'Devotional (YouTube-first)': { new: 250000, emerging: 600000, mid: 1400000, established: 3000000 },
  'Remix/Cover (UGC-first)': { new: 450000, emerging: 1000000, mid: 2600000, established: 5500000 }
};

export const presets: Record<string, Partial<Scenario>> = {
  'Hindi pop (non-film)': {
    release: { lane: 'Hindi pop (non-film)', language: 'Hindi', film: false, platform: 'Reels-first', tier: 'emerging', targetRegion: 'India-wide' }
  },
  'Punjabi hip-hop': {
    release: { lane: 'Punjabi hip-hop', language: 'Punjabi', film: false, platform: 'YouTube-first', tier: 'mid', targetRegion: 'Punjab + NCR' }
  },
  'Tamil/Telugu mass': {
    release: { lane: 'Tamil/Telugu mass', language: 'Tamil/Telugu', film: false, platform: 'YouTube-first', tier: 'mid', targetRegion: 'Tamil Nadu + Andhra/Telangana' }
  },
  'English indie (Spotify-first)': {
    release: { lane: 'English indie (Spotify-first)', language: 'English', film: false, platform: 'Spotify-first', tier: 'emerging', targetRegion: 'Top metros' }
  },
  'Devotional (YouTube-first)': {
    release: { lane: 'Devotional (YouTube-first)', language: 'Hindi + regional', film: false, platform: 'YouTube-first', tier: 'emerging', targetRegion: 'Hindi belt + states' }
  },
  'Remix/Cover (UGC-first)': {
    release: { lane: 'Remix/Cover (UGC-first)', language: 'Hindi', film: false, platform: 'Reels-first', tier: 'new', targetRegion: 'India-wide' }
  }
};

export const defaultScenario: Scenario = {
  mode: 'Base Case',
  release: {
    lane: 'Hindi pop (non-film)',
    language: 'Hindi',
    film: false,
    platform: 'Reels-first',
    tier: 'emerging',
    targetRegion: 'India-wide'
  },
  deal: {
    advanceAsk: 2500000,
    labelSharePct: 25,
    marketingRecoup: true,
    payoutTimingMonths: 3
  },
  marketing: {
    metaReelsAds: 350000,
    youtubeAds: 300000,
    creatorSeeding: 250000,
    pr: 150000,
    playlistPitching: 80000,
    contentProduction: 300000
  },
  content: {
    reelsPerWeek: 10,
    shortsPerWeek: 5,
    creatorsSeeded: 60,
    avgCreatorFee: 5000,
    contentDays: 30
  },
  assumptions: {
    payouts: {
      youtubeView: 0.06,
      reelsView: 0.025,
      spotifyStream: 0.22
    },
    conversions: {
      reachToEngagementPct: 4,
      engagementToUnitPct: 23,
      creatorToUgcUses: 3,
      ugcUseToUnits: 120,
      saveBoost: 1.12
    },
    riskHaircutPct: 30,
    annualDiscountPct: 15
  }
};

const deepMerge = <T extends object>(base: T, patch: Partial<T>): T => {
  const result: any = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = deepMerge((base as any)[key] ?? {}, value as any);
    } else if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
};

export const applyPreset = (scenario: Scenario, presetName: string): Scenario => {
  const preset = presets[presetName];
  return preset ? deepMerge(scenario, preset as Partial<Scenario>) : scenario;
};

const currency = (v: number) => Math.round(v);

export const calculateModel = (scenario: Scenario): ModelOutput => {
  const { marketing, content, assumptions, deal, release, mode } = scenario;
  const totalSpend = Object.values(marketing).reduce((acc, n) => acc + n, 0);
  const threshold = laneThresholds[release.lane][release.tier];
  const platformWeightedPayout =
    release.platform === 'YouTube-first'
      ? assumptions.payouts.youtubeView * 0.6 + assumptions.payouts.reelsView * 0.2 + assumptions.payouts.spotifyStream * 0.2
      : release.platform === 'Reels-first'
        ? assumptions.payouts.youtubeView * 0.25 + assumptions.payouts.reelsView * 0.5 + assumptions.payouts.spotifyStream * 0.25
        : assumptions.payouts.youtubeView * 0.2 + assumptions.payouts.reelsView * 0.2 + assumptions.payouts.spotifyStream * 0.6;

  const reachSignals = marketing.metaReelsAds * 3.5 + marketing.youtubeAds * 2.6 + marketing.pr * 1.1;
  const engagementSignals = reachSignals * (assumptions.conversions.reachToEngagementPct / 100);
  const creatorUses = content.creatorsSeeded * assumptions.conversions.creatorToUgcUses;
  const ugcDrivenUnits = creatorUses * assumptions.conversions.ugcUseToUnits;
  const contentIntensity = (content.reelsPerWeek * 1.2 + content.shortsPerWeek) * (content.contentDays / 30);

  let expectedUnits =
    (engagementSignals * (assumptions.conversions.engagementToUnitPct / 100) + ugcDrivenUnits + contentIntensity * 1600) *
    assumptions.conversions.saveBoost;

  const thresholdRatio = totalSpend / threshold;
  if (thresholdRatio < 0.6) {
    expectedUnits *= 0.25;
  } else if (thresholdRatio < 1) {
    expectedUnits *= 0.6;
  } else {
    expectedUnits *= 1 + Math.log10(thresholdRatio + 1.1);
  }

  expectedUnits *= modeMultiplier[mode];

  const creativeGate = content.reelsPerWeek + content.shortsPerWeek >= (release.tier === 'new' ? 8 : 12);
  const distributionGate = content.creatorsSeeded >= (release.tier === 'new' ? 20 : 50);
  const platformGate = totalSpend >= threshold * 0.9;
  const spendLabel = totalSpend < threshold * 0.6 ? 'Waste zone' : totalSpend < threshold ? 'Lottery zone' : 'Realistic chance';

  const artistNetShare = 1 - deal.labelSharePct / 100;
  const grossRevenue = expectedUnits * platformWeightedPayout;
  const marketingRecoupable = deal.marketingRecoup ? totalSpend : 0;
  const artistNet = Math.max(grossRevenue * artistNetShare - marketingRecoupable, 0);

  const discount = 1 / Math.pow(1 + assumptions.annualDiscountPct / 100, deal.payoutTimingMonths / 12);
  const npv = artistNet * discount * (1 - assumptions.riskHaircutPct / 100);

  const recoupTarget = deal.advanceAsk + (deal.marketingRecoup ? totalSpend : 0);
  const requiredTotalUnits = recoupTarget / Math.max(platformWeightedPayout * artistNetShare, 0.0001);

  const weeklyWeights = [0.21, 0.17, 0.13, 0.1, 0.08, 0.07, 0.06, 0.05, 0.04, 0.035, 0.03, 0.025];
  const weeklyCurve = weeklyWeights.map((w) => requiredTotalUnits * w);

  const monthlyNet = Array.from({ length: 12 }, (_, i) =>
    grossRevenue * Math.exp(-i / 4.5) * artistNetShare * (deal.marketingRecoup && i < 4 ? 0.2 : 1)
  );
  let cumulative = 0;
  let breakEvenMonth: number | null = null;
  for (let i = 0; i < monthlyNet.length; i += 1) {
    cumulative += monthlyNet[i];
    if (cumulative >= deal.advanceAsk && breakEvenMonth === null) {
      breakEvenMonth = i + 1;
    }
  }

  const roiBase = ((artistNet - deal.advanceAsk) / Math.max(deal.advanceAsk, 1)) * 100;

  const warnings: string[] = [];
  if (release.platform === 'Spotify-first' && release.tier === 'new') {
    warnings.push('Spotify-first with a new artist may miss campaign tool eligibility and editorial support windows.');
  }
  if (!creativeGate) warnings.push('Creative Gate missed: increase reels/shorts volume to sustain weekly velocity.');
  if (!distributionGate) warnings.push('Distribution Gate missed: increase creator seeding count for UGC lift.');
  if (deal.marketingRecoup && totalSpend > deal.advanceAsk) warnings.push('Marketing recoup exceeds advance ask; artist cash realization may be delayed.');

  const gateScore = [creativeGate, distributionGate, platformGate].filter(Boolean).length * 12;
  const health = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        42 +
          gateScore +
          Math.min(18, thresholdRatio * 10) +
          Math.min(18, roiBase / 8) -
          (warnings.length > 0 ? warnings.length * 5 : 0)
      )
    )
  );

  return {
    blendedPayout: platformWeightedPayout,
    totalSpend: currency(totalSpend),
    mvsThreshold: threshold,
    spendLabel,
    gates: { creative: creativeGate, distribution: distributionGate, platform: platformGate },
    expectedUnits: currency(expectedUnits),
    required: {
      totalUnits: currency(requiredTotalUnits),
      daily30: currency(requiredTotalUnits / 30),
      daily90: currency(requiredTotalUnits / 90),
      weeklyCurve: weeklyCurve.map(currency)
    },
    revenue: {
      gross: currency(grossRevenue),
      artistNet: currency(artistNet),
      npv: currency(npv),
      recommendedAdvanceLow: currency(npv * 0.75),
      recommendedAdvanceHigh: currency(npv * 1.1)
    },
    roi: {
      lowPct: Math.round(roiBase * 0.7),
      basePct: Math.round(roiBase),
      highPct: Math.round(roiBase * 1.35),
      breakEvenMonth
    },
    dealHealthScore: health,
    warnings
  };
};
