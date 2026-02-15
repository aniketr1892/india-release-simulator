import { defaultScenario, Scenario } from './model';

const encodeBase64Url = (value: string) => {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export const encodeScenario = (scenario: Scenario): string => encodeBase64Url(JSON.stringify(scenario));

export const decodeScenario = (encoded: string | null): Scenario | null => {
  if (!encoded) return null;
  try {
    const parsed = JSON.parse(decodeBase64Url(encoded)) as Partial<Scenario>;
    return {
      ...defaultScenario,
      ...parsed,
      release: { ...defaultScenario.release, ...parsed.release },
      deal: { ...defaultScenario.deal, ...parsed.deal },
      marketing: { ...defaultScenario.marketing, ...parsed.marketing },
      content: { ...defaultScenario.content, ...parsed.content },
      assumptions: {
        ...defaultScenario.assumptions,
        ...parsed.assumptions,
        payouts: { ...defaultScenario.assumptions.payouts, ...parsed.assumptions?.payouts },
        conversions: { ...defaultScenario.assumptions.conversions, ...parsed.assumptions?.conversions }
      }
    };
  } catch {
    return null;
  }
};

export const buildShareUrl = (scenario: Scenario): string => {
  const url = new URL(window.location.href);
  url.searchParams.set('s', encodeScenario(scenario));
  return url.toString();
};
