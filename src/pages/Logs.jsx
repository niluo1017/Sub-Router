import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getUserLogs, Q } from '../api';
import { useCurrency } from '../context/SiteContext';

function formatTime(unix) {
  if (!unix) return '-';
  const d = new Date(unix * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function Logs() {
  const { t } = useTranslation();
  const { symbol, rate } = useCurrency();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modelFilter, setModelFilter] = useState('');
  const [tokenFilter, setTokenFilter] = useState('');
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { p: page, page_size: pageSize, type: 2 }; // type=2 consume only
      if (modelFilter) params.model_name = modelFilter;
      if (tokenFilter) params.token_name = tokenFilter;
      const res = await getUserLogs(params);
      if (res.data.success) {
        setLogs(res.data.data?.items || []);
        setTotal(res.data.data?.total || 0);
      }
    } catch (e) { /* interceptor */ }
    setLoading(false);
  }, [page, modelFilter, tokenFilter]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-page mb-1">{t('logs.title')}</h1>
        <p className="text-sm text-page-secondary">{t('logs.subtitle')}</p>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[180px]">
            <input
              type="text"
              value={modelFilter}
              onChange={(e) => { setModelFilter(e.target.value); setPage(1); }}
              className="input w-full"
              placeholder={t('logs.filterModel')}
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <input
              type="text"
              value={tokenFilter}
              onChange={(e) => { setTokenFilter(e.target.value); setPage(1); }}
              className="input w-full"
              placeholder={t('logs.filterToken')}
            />
          </div>
          <button onClick={() => { setModelFilter(''); setTokenFilter(''); setPage(1); }} className="btn-secondary text-sm">
            {t('logs.clearFilter')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-page-secondary">
            <p>{t('logs.noLogs')}</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-page-divider">
                    <th className="text-left px-4 py-3 font-medium text-page-secondary">{t('logs.time')}</th>
                    <th className="text-left px-4 py-3 font-medium text-page-secondary">{t('logs.model')}</th>
                    <th className="text-left px-4 py-3 font-medium text-page-secondary">{t('logs.token')}</th>
                    <th className="text-right px-4 py-3 font-medium text-page-secondary">{t('logs.promptTokens')}</th>
                    <th className="text-right px-4 py-3 font-medium text-page-secondary">{t('logs.completionTokens')}</th>
                    <th className="text-right px-4 py-3 font-medium text-page-secondary">{t('logs.cost')}</th>
                    <th className="text-right px-4 py-3 font-medium text-page-secondary">{t('logs.duration')}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={i} className="border-b border-page-divider last:border-0 hover:bg-page-surface transition-colors">
                      <td className="px-4 py-3 text-page-secondary text-xs whitespace-nowrap">{formatTime(log.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-page">{log.model_name || '-'}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-page-secondary">{log.token_name || '-'}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-page-label">{log.prompt_tokens?.toLocaleString() || '0'}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-page-label">{log.completion_tokens?.toLocaleString() || '0'}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-page-warning">
                        {log.quota > 0 ? `${symbol}${(log.quota / Q * rate).toFixed(6)}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-page-secondary">
                        {log.use_time > 0 ? `${(log.use_time / 1000).toFixed(1)}s` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-page-divider">
              {logs.map((log, i) => (
                <div key={i} className="px-4 py-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-page font-medium">{log.model_name || '-'}</span>
                    <span className="font-mono text-xs text-page-warning">
                      {log.quota > 0 ? `${symbol}${(log.quota / Q * rate).toFixed(6)}` : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-page-secondary">
                    <span>{formatTime(log.created_at)}</span>
                    <span>{log.prompt_tokens || 0} / {log.completion_tokens || 0} tokens</span>
                  </div>
                  {log.token_name && (
                    <div className="text-[11px] text-page-muted">{log.token_name}</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-page-secondary">
            {t('logs.showing', { from: (page - 1) * pageSize + 1, to: Math.min(page * pageSize, total), total })}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-30"
            >
              {t('logs.prev')}
            </button>
            <span className="text-sm text-page-secondary px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-30"
            >
              {t('logs.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
