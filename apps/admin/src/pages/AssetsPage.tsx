import React, { useEffect, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { EmptyState, ErrorBanner, PageHeader } from '../components/ui';
import { Stagger, StaggerItem } from '../components/motion';

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
        eyebrow="Media"
        title="Photo library"
        description="Product photographs deployed with the website. New photographs are added to public/assets/products in the repository (see scripts/prepare-product-photo.py) — no paid storage is used."
        actions={state === 'ready' ? <span className="adm-badge-gold">{assets.length} photographs</span> : undefined}
      />
      {state === 'error' && <ErrorBanner message="Could not load the photo library." onRetry={load} />}
      {state === 'loading' && (
        <div role="status" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          <span className="sr-only">Loading…</span>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="adm-card overflow-hidden" aria-hidden>
              <span className="adm-skeleton block aspect-[4/5] rounded-none" />
              <span className="block space-y-2 px-3 py-3">
                <span className="adm-skeleton block h-3 w-3/4" />
                <span className="adm-skeleton block h-2.5 w-1/2" />
              </span>
            </div>
          ))}
        </div>
      )}
      {state === 'ready' && assets.length === 0 && (
        <div className="adm-card">
          <EmptyState icon={ImageIcon} title="No photographs yet">
            Add product photographs to public/assets/products in the repository.
          </EmptyState>
        </div>
      )}
      {state === 'ready' && assets.length > 0 && (
        <Stagger as="ul" stagger={0.03} className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {assets.map(a => (
            <StaggerItem as="li" key={a.path} className="adm-card adm-card-hover group overflow-hidden">
              <div className="relative overflow-hidden bg-stone">
                <img src={a.path} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.04]" />
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-umber/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
              <div className="border-t border-stone-deep/60 px-3 py-2.5">
                <p className="truncate text-sm font-semibold capitalize text-ink" title={a.name}>
                  {a.name}
                </p>
                <p className="mt-0.5 truncate font-mono text-[0.6875rem] text-ink-faint" title={a.path}>
                  {a.path}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
};
