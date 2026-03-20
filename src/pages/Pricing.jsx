import React, { useState, useEffect } from 'react';
import { getSiteModels } from '../api';

export default function Pricing() {
  const [models, setModels] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // /api/dist/site/pricing returns same data as /api/dist/site/models — only need one call
    getSiteModels()
      .then((r) => {
        if (r.data.success) setModels(r.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const enabledModels = models.filter((m) => m.enabled !== false);

  const filtered = enabledModels.filter((m) =>
    !search ||
    (m.display_name || m.model_name || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-heading font-bold text-white mb-3">Model Pricing</h1>
        <p className="text-neutral-400 max-w-xl mx-auto">
          Transparent, pay-as-you-go pricing for all available models. Prices shown per 1K tokens.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input !pl-10"
            placeholder="Search models..."
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          {search ? 'No models match your search' : 'No models available'}
        </div>
      ) : (
        <div className="glass-sm rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-5 py-3.5 font-medium text-neutral-400">Model</th>
                <th className="text-right px-5 py-3.5 font-medium text-neutral-400">Input / 1K tokens</th>
                <th className="text-right px-5 py-3.5 font-medium text-neutral-400">Output / 1K tokens</th>
                <th className="text-center px-5 py-3.5 font-medium text-neutral-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={m.model_name || i} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-white">{m.display_name || m.model_name}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-neutral-300">
                    {m.input_price != null ? `$${Number(m.input_price).toFixed(6)}` : '-'}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-neutral-300">
                    {m.output_price != null ? `$${Number(m.output_price).toFixed(6)}` : '-'}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border ${
                      m.status === 'healthy'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'healthy' ? 'bg-green-500' : 'bg-neutral-500'}`} />
                      {m.status === 'healthy' ? 'Online' : 'Unknown'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
