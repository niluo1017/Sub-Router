import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getTokens, createToken, updateToken, deleteToken, getSiteKeyGroups, getTokenSupportedModels } from '../api';
import ConfigExporter from '../components/ConfigExporter';
import toast from 'react-hot-toast';

export default function Tokens() {
  const { t } = useTranslation();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [newKey, setNewKey] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedTokens, setExpandedTokens] = useState({});
  const [tokenModels, setTokenModels] = useState({});

  // Key groups
  const [keyGroups, setKeyGroups] = useState([]);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(0);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tokensRes, groupsRes] = await Promise.all([
        getTokens(),
        getSiteKeyGroups().catch(() => ({ data: { success: false } })),
      ]);
      if (tokensRes.data.success) setTokens(tokensRes.data.data || []);
      if (groupsRes.data.success) setKeyGroups(groupsRes.data.data || []);
    } catch (e) { /* interceptor */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Group by vendor_category
  const groupedByVendor = useMemo(() => {
    const map = {};
    keyGroups.forEach((g) => {
      const cat = g.vendor_category || t('tokens.otherGroups');
      if (!map[cat]) map[cat] = [];
      map[cat].push(g);
    });
    return map;
  }, [keyGroups, t]);

  const openCreateFromGroup = (group) => {
    if (group.is_unavailable) return;
    setSelectedGroupId(group.id);
    setCreateName(group.name);
    setShowCreate(true);
  };

  const openCreateDefault = () => {
    setSelectedGroupId(0);
    setCreateName('');
    setShowCreate(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createName.trim()) {
      toast.error(t('tokens.enterName'));
      return;
    }
    setCreating(true);
    try {
      const payload = { name: createName.trim() };
      if (selectedGroupId > 0) payload.key_group_id = selectedGroupId;
      const res = await createToken(payload);
      if (res.data.success) {
        setCreateName('');
        setShowCreate(false);
        setSelectedGroupId(0);
        const createdKey = res.data.data?.key;
        if (createdKey) setNewKey(createdKey);
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

  const parseTags = (tagsStr) => {
    try { return JSON.parse(tagsStr || '[]'); } catch { return []; }
  };

  const handleToggleSupportedModels = async (tokenId) => {
    const isExpanded = !!expandedTokens[tokenId];
    setExpandedTokens((prev) => ({ ...prev, [tokenId]: !isExpanded }));
    if (isExpanded || tokenModels[tokenId]) return;

    setTokenModels((prev) => ({
      ...prev,
      [tokenId]: { loading: true, models: [], count: 0, provider_names: [], restricted_by_providers: false, restricted_by_models: false },
    }));

    try {
      const res = await getTokenSupportedModels(tokenId);
      if (res.data.success) {
        const data = res.data.data || {};
        setTokenModels((prev) => ({
          ...prev,
          [tokenId]: {
            loading: false,
            models: data.models || [],
            count: data.count || 0,
            provider_names: data.provider_names || [],
            restricted_by_providers: Boolean(data.restricted_by_providers),
            restricted_by_models: Boolean(data.restricted_by_models),
          },
        }));
      } else {
        setTokenModels((prev) => ({
          ...prev,
          [tokenId]: { loading: false, error: true, models: [], count: 0, provider_names: [], restricted_by_providers: false, restricted_by_models: false },
        }));
      }
    } catch (e) {
      setTokenModels((prev) => ({
        ...prev,
        [tokenId]: { loading: false, error: true, models: [], count: 0, provider_names: [], restricted_by_providers: false, restricted_by_models: false },
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  const hasGroups = keyGroups.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* ========== Section 1: Create Key with Groups ========== */}
      <div className="mb-10">
        <h1 className="text-2xl font-heading font-bold text-page">
          {hasGroups ? t('tokens.selectGroup') : t('tokens.title')}
        </h1>
        {hasGroups && (
          <p className="text-sm text-page-secondary mt-1">{t('tokens.selectGroupSubtitle')}</p>
        )}

        {/* Default (All Providers) Card */}
        <div className="mt-6">
          <button
            onClick={openCreateDefault}
            className="w-full glass rounded-xl p-4 flex items-center gap-4 hover:border-brand-500/50 border border-page-divider transition-all group text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-page">{hasGroups ? t('tokens.defaultGroup') : t('tokens.newKey')}</p>
              {hasGroups && (
                <p className="text-xs text-page-secondary mt-0.5">{t('tokens.defaultGroupDesc')}</p>
              )}
            </div>
            <span className="text-xs font-medium text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              {t('tokens.create')} →
            </span>
          </button>
        </div>

        {/* Vendor Category Sections */}
        {hasGroups && Object.entries(groupedByVendor).map(([vendor, groups]) => (
          <div key={vendor} className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-base font-semibold text-page">{vendor}</h2>
              <span className="text-[11px] text-page-muted bg-page-surface px-2 py-0.5 rounded-full">
                {groups.length} {t('tokens.groupCount')}
              </span>
            </div>
            <div className="space-y-2">
              {groups.map((group) => (
                <KeyGroupCard
                  key={group.id}
                  group={group}
                  parseTags={parseTags}
                  onSelect={openCreateFromGroup}
                  t={t}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ========== Create Modal ========== */}
      {showCreate && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setShowCreate(false); setSelectedGroupId(0); }}>
          <div className="glass rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-page mb-4">{t('tokens.createApiKey')}</h2>
            {selectedGroupId > 0 && (() => {
              const g = keyGroups.find((x) => x.id === selectedGroupId);
              return g ? (
                <div className="mb-4 p-3 rounded-lg bg-page-surface border border-page-divider">
                  <p className="text-xs text-page-muted">{t('tokens.selectedGroup')}</p>
                  <p className="text-sm font-medium text-page">{g.name}</p>
                </div>
              ) : null;
            })()}
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
                <button type="button" onClick={() => { setShowCreate(false); setSelectedGroupId(0); }} className="btn-secondary">
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

      {/* ========== New Key Reveal Modal ========== */}
      {newKey && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
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

      {/* ========== Delete Confirmation Modal ========== */}
      {deleteConfirm && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
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

      {/* ========== Section 2: My API Keys ========== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold text-page">{t('tokens.myKeys')}</h2>
        </div>

        {tokens.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-page-surface flex items-center justify-center">
              <svg className="w-6 h-6 text-page-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <p className="text-sm text-page-secondary">{t('tokens.noKeys')}</p>
            <p className="text-xs text-page-muted mt-1">{t('tokens.noKeysHint')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => (
              <div key={token.id} className="glass-sm rounded-xl p-5">
                <div className="flex items-center gap-4">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${token.status === 1 ? 'bg-green-500' : 'bg-page-muted'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-page">{token.name}</p>
                  </div>
                  <span className="text-xs text-page-muted hidden md:block">
                    {token.created_time ? new Date(token.created_time * 1000).toLocaleDateString() : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleSupportedModels(token.id)}
                      className="px-3 py-1 text-xs rounded-lg border border-page-divider text-page-secondary hover:bg-page-surface-hover transition-colors"
                    >
                      {expandedTokens[token.id] ? t('tokens.hideSupportedModels') : t('tokens.viewSupportedModels')}
                    </button>
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
                {expandedTokens[token.id] && (
                  <div className="mt-3 rounded-xl border border-page-divider bg-page-surface/50 px-4 py-3">
                    {tokenModels[token.id]?.loading ? (
                      <div className="flex items-center gap-2 text-sm text-page-secondary">
                        <div className="w-4 h-4 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                        <span>{t('tokens.loadingSupportedModels')}</span>
                      </div>
                    ) : tokenModels[token.id]?.error ? (
                      <p className="text-sm text-page-danger">{t('tokens.loadSupportedModelsFailed')}</p>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-page">
                            {t('tokens.supportedModels')} ({tokenModels[token.id]?.count || 0})
                          </p>
                          {tokenModels[token.id]?.restricted_by_models && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] bg-brand-500/10 text-brand-500">
                              {t('tokens.restrictedByModels')}
                            </span>
                          )}
                          {tokenModels[token.id]?.restricted_by_providers && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] bg-brand-500/10 text-brand-500">
                              {t('tokens.restrictedByProviders')}
                            </span>
                          )}
                        </div>
                        {tokenModels[token.id]?.provider_names?.length > 0 && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-page-muted">{t('tokens.supportedProviders')}</span>
                            {tokenModels[token.id].provider_names.map((name) => (
                              <span key={name} className="px-2 py-0.5 rounded-full text-[11px] bg-page-inset text-page-secondary">
                                {name}
                              </span>
                            ))}
                          </div>
                        )}
                        {tokenModels[token.id]?.models?.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {tokenModels[token.id].models.map((modelName) => (
                              <code key={modelName} className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-page-inset text-page-secondary">
                                {modelName}
                              </code>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-3 text-sm text-page-muted">{t('tokens.noSupportedModels')}</p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <ConfigExporter tokens={tokens} />
      </div>
    </div>
  );
}

/* ========== Key Group Card ========== */
function KeyGroupCard({ group, parseTags, onSelect, t }) {
  const tags = parseTags(group.tags);
  const isUnavailable = group.is_unavailable;

  return (
    <div
      className={`glass-sm rounded-xl p-4 border border-page-divider transition-all ${
        isUnavailable
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:border-brand-500/40 cursor-pointer group'
      }`}
      onClick={() => !isUnavailable && onSelect(group)}
    >
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          {/* Name + badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-page">{group.name}</span>
            {group.is_recommended && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-500">
                {t('tokens.recommended')}
              </span>
            )}
            {isUnavailable && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-500">
                {t('tokens.unavailable')}
              </span>
            )}
          </div>

          {/* Price + discount + tags */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {group.rmb_per_usd > 0 && (
              <span className="text-xs font-medium text-page">
                {group.rmb_per_usd} {t('tokens.rmbPerUsd')}
              </span>
            )}
            {group.discount_label && (
              <span className="text-[11px] font-semibold text-page-success">
                {group.discount_label}
              </span>
            )}
            {tags.map((tag, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-page-surface text-page-secondary">
                {tag}
              </span>
            ))}
          </div>

          {/* Description */}
          {group.description && (
            <p className="text-xs text-page-muted mt-1">{group.description}</p>
          )}
        </div>

        {/* Create arrow */}
        {!isUnavailable && (
          <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs font-medium text-brand-500">{t('tokens.create')}</span>
            <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
