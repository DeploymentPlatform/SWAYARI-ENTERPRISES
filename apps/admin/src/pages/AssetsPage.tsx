import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Copy, Check, Info, FileCode } from 'lucide-react';

export const AssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  async function fetchAssets() {
    try {
      const res = await fetch('/api/admin/assets');
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
      }
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(path: string) {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-ivory-border shadow-subtle space-y-2">
        <h1 className="font-serif text-2xl font-bold text-charcoal">Deployed Photographic Assets</h1>
        <p className="text-xs text-charcoal-muted font-light leading-relaxed">
          Product photographs are deployed through Git to Cloudflare Pages (Free-First Zero Metered Cost architecture).
          Images can be attached to products using the Product Editor.
        </p>
      </div>

      {/* Guide Banner */}
      <div className="bg-ivory-muted/70 p-5 rounded-2xl border border-ivory-border space-y-3 text-xs text-charcoal-muted">
        <div className="flex items-center space-x-2 font-semibold text-charcoal">
          <Info className="w-4 h-4 text-gold" />
          <span>How to Add &amp; Publish New Product Photos (Zero-Cost Workflow)</span>
        </div>
        <ol className="list-decimal list-inside space-y-1.5 font-light leading-relaxed pl-2">
          <li>
            Optimize real product photos locally (JPEG, PNG, or WebP; under 500 KB each) and place them in:
            <code className="mx-1 px-1.5 py-0.5 rounded bg-white border border-ivory-border font-mono text-[11px] text-burgundy">
              apps/storefront/public/assets/products/
            </code>
          </li>
          <li>
            Run <code className="mx-1 px-1.5 py-0.5 rounded bg-white border border-ivory-border font-mono text-[11px] text-burgundy">npm run build</code> locally to update the asset manifest.
          </li>
          <li>
            Commit and push changes to the <code className="mx-1 px-1.5 py-0.5 rounded bg-white border border-ivory-border font-mono text-[11px] text-burgundy">main</code> branch to deploy to Cloudflare Pages.
          </li>
          <li>
            Open the <strong>Catalogue &amp; Products</strong> tab in this Admin Portal, click <strong>Select from Assets</strong>, and attach the newly deployed photo to your product!
          </li>
        </ol>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-ivory-border shadow-subtle overflow-hidden flex flex-col">
            <div className="aspect-[4/3] bg-ivory-muted overflow-hidden relative group">
              <img
                src={asset.path}
                alt={asset.name}
                className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-300"
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-black/60 text-white backdrop-blur-xs">
                {asset.category}
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-xs">
              <div>
                <h4 className="font-semibold text-charcoal line-clamp-1">{asset.name}</h4>
                <p className="font-mono text-[11px] text-charcoal-light truncate mt-1">{asset.path}</p>
              </div>

              <div className="pt-2 border-t border-ivory-border flex items-center justify-between">
                <span className="text-[10px] text-charcoal-muted uppercase">{asset.type}</span>
                <button
                  onClick={() => handleCopy(asset.path)}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-ivory-muted hover:bg-burgundy hover:text-white transition-colors text-[11px] font-medium"
                >
                  {copiedPath === asset.path ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Path</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
