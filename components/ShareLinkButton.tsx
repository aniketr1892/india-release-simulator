'use client';

import { Scenario } from '@/lib/model';
import { buildShareUrl } from '@/lib/share';
import { useState } from 'react';

export default function ShareLinkButton({ scenario }: { scenario: Scenario }) {
  const [status, setStatus] = useState('');

  const handleCopy = async () => {
    try {
      const url = buildShareUrl(scenario);
      await navigator.clipboard.writeText(url);
      setStatus('Copied!');
      setTimeout(() => setStatus(''), 1500);
    } catch (error) {
      setStatus('Copy failed');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={handleCopy} className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-700">
        Copy share link
      </button>
      {status && <span className="text-xs text-slate-600">{status}</span>}
    </div>
  );
}
