import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getTokens, createToken, updateToken, deleteToken } from '../api';
import ConfigExporter from '../components/ConfigExporter';
import toast from 'react-hot-toast';

export default function Tokens() {
  const { t } = useTranslation();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  // Newly created key — shown only once
  const [newKey, setNewKey] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTokens();
      if (res.data.success) setTokens(res.data.data || []);
    } catch (e) { /* interceptor */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createName.trim()) {
      toast.error(t('tokens.enterName'));
      return;
    }
    setCreating(true);
    try {
      const res = await createToken({ name: createName.trim() });
      if (res.data.success) {
        setCreateName('');
        setShowCreate(false);
        // Show the key — it's only visible at creation time!
        const createdKey = res.data.data?.key;
        if (createdKey) {
          setNewKey(createdKey);
        }
        await load();
      }
    } catch (e) { /* interceptor */ }
    setCreating(false);
  };

  const handleToggle = async (token) => {
    try {
      const res = await updateToken(token.id, {
        status: token.status === 1 ? 2 : 1,
      });
      if (res.data.success) {
        toast.success(token.status === 1 ? t('tokens.tokenDisabled') : t('tokens.tokenEnabled'));
        await load();
      }
    } catch (e) { /* interceptor */ }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await deleteToken(deleteConfirm.id);
      if (res.data.success) {
        toast.success(t('tokens.tokenDeleted'));
        setDeleteConfirm(null);
        await load();
      }
    } catch (e) { /* interceptor */ }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedId(text);
    toast.success(t('tokens.copiedToClipboard'));
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-page">{t('tokens.title')}</h1>
          <p className="text-sm text-page-secondary mt-1">{t('tokens.subtitle')}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          {t('tokens.newKey')}
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="glass rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-page mb-4">{t('tokens.createApiKey')}</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-page-label mb-1.5">{t('tokens.name')}</label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="input"
                  placeholder={t('tokens.namePlaceholder')}
                  autoFocus
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">
                  {t('tokens.cancel')}
                </button>
                <button type="submit" disabled={creating} className="btn-primary">
                  {creating ? t('tokens.creating') : t('tokens.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Key Reveal Modal — shown only once after creation */}
      {newKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold text-page mb-2">{t('tokens.newApiKey')}</h2>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-4">
              <p className="text-sm text-page-warning">
                {t('tokens.keyWarning')}
              </p>
            </div>
            <div className="bg-page-inset rounded-xl p-4 flex items-center gap-3">
              <code className="text-sm font-mono text-page-success flex-1 break-all select-all">
                {newKey}
              </code>
              <button
                onClick={() => handleCopy(newKey)}
                className="btn-primary !px-4 !py-1.5 flex-shrink-0"
              >
                {copiedId === newKey ? t('tokens.copied') : t('tokens.copy')}
              </button>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setNewKey(null)} className="btn-secondary">
                {t('tokens.savedKey')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
          <div className="glass rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-page mb-3">{t('tokens.deleteToken')}</h2>
            <p className="text-sm text-page-secondary mb-4">
              {t('tokens.deleteConfirm', { name: deleteConfirm.name })}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">{t('tokens.cancel')}</button>
              <button onClick={handleDelete} className="px-6 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors">
                {t('tokens.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Token List */}
      {tokens.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-page-surface flex items-center justify-center">
            <svg className="w-8 h-8 text-page-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <p className="text-page-secondary mb-4">{t('tokens.noKeys')}</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            {t('tokens.createFirst')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tokens.map((token) => (
            <div key={token.id} className="glass-sm rounded-xl p-5">
              <div className="flex items-center gap-4">
                {/* Status dot */}
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${token.status === 1 ? 'bg-green-500' : 'bg-page-muted'}`} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-page">{token.name}</p>
                </div>

                {/* Created time */}
                <span className="text-xs text-page-muted hidden md:block">
                  {token.created_time ? new Date(token.created_time * 1000).toLocaleDateString() : ''}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(token)}
                    className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                      token.status === 1
                        ? 'border-green-500/30 text-page-success hover:bg-green-500/10'
                        : 'border-page-divider text-page-secondary hover:bg-page-surface-hover'
                    }`}
                  >
                    {token.status === 1 ? t('tokens.enabled') : t('tokens.disabled')}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(token)}
                    className="px-3 py-1 text-xs rounded-lg border border-red-500/20 text-page-danger hover:bg-red-500/10 transition-colors"
                  >
                    {t('tokens.delete')}
                  </button>
                </div>
              </div>

              {/* Key row — always visible with copy button */}
              {token.key && (
                <div className="mt-3 flex items-center gap-2 bg-page-inset rounded-lg px-3 py-2">
                  <code className="text-xs font-mono text-page-muted flex-1 break-all select-all">
                    sk-{token.key}
                  </code>
                  <button
                    onClick={() => handleCopy('sk-' + token.key)}
                    className="flex-shrink-0 px-2.5 py-1 text-xs rounded-md bg-page-surface text-page-secondary hover:bg-page-surface-hover hover:text-page transition-colors"
                  >
                    {copiedId === 'sk-' + token.key ? t('tokens.copied') : t('tokens.copy')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Config File Generator */}
      <div className="mt-8">
        <ConfigExporter />
      </div>
    </div>
  );
}
