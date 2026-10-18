import React, { useEffect, useState } from 'react';
import { ErrorBanner, PageHeader } from '../components/ui';

interface Asset {
  path: string;
  name: string;
  category: string;
}

export const AssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  async function load() {
    setState('loading');
    try {
      const res = await fetch('/api/admin/assets');
      if (!res.ok) throw new Error();
      setAssets((await res.json()).assets || []);
      setState('ready');
    } catch {
      setState('error');
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Photo library"
        description="Product photographs deployed with the website. New photographs are added to public/assets/products in the repository (see scripts/prepare-product-photo.py) — no paid storage is used."
      />
      {state === 'error' && <ErrorBanner message="Could not load the photo library." onRetry={load} />}
      {state === 'loading' && <p className="text-sm text-ink-soft">Loading…</p>}
      {state === 'ready' && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {assets.map(a => (
            <li key={a.path} className="adm-card overflow-hidden">
              <img src={a.path} alt="" loading="lazy" className="aspect-[4/5] w-full bg-stone object-cover" />
              <div className="px-3 py-2">
                <p className="truncate text-sm font-medium capitalize" title={a.name}>
                  {a.name}
                </p>
                <p className="truncate font-mono text-[0.75rem] text-ink-soft" title={a.path}>
                  {a.path}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
