import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getUserUsage, redeemCode, getAffCode, transferAffQuota, getAffEarnings, Q, quotaToDollar } from '../api';
import { useCurrency } from '../context/SiteContext';
import CountUp from '../components/bits/CountUp';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const { symbol, rate } = useCurrency();
  const [usage, setUsage] = useState(null);
  const [redeemInput, setRedeemInput] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  // Invitation / Aff
  const [affLink, setAffLink] = useState('');
  const [affEarnings, setAffEarnings] = useState([]);
  const [showAffEarnings, setShowAffEarnings] = useState(false);
  const [affEarningsLoading, setAffEarningsLoading] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferring, setTransferring] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [usageRes, affRes] = await Promise.all([
        getUserUsage(),
        getAffCode().catch(() => null),
      ]);
      if (usageRes.data.success) setUsage(usageRes.data.data);
      if (affRes?.data?.success && affRes.data.data) {
        setAffLink(`${window.location.origin}/register?aff=${affRes.data.data}`);
      }
    } catch (e) { /* interceptor */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!redeemInput.trim()) return;
    setRedeeming(true);
    try {
      const res = await redeemCode(redeemInput.trim());
      if (res.data.success) {
        toast.success(t('dashboard.redeemSuccess'));
        setRedeemInput('');
        await Promise.all([loadData(), refreshUser()]);
      }
    } catch (err) { /* interceptor */ }
    setRedeeming(false);
  };

  const loadAffEarnings = async () => {
    setAffEarningsLoading(true);
    try {
      const res = await getAffEarnings({ page: 1, page_size: 20 });
      if (res.data.success && res.data.data) {
        setAffEarnings(res.data.data);
      }
    } catch (e) { /* interceptor */ }
    setAffEarningsLoading(false);
  };

  const handleCopyAffLink = () => {
    if (!affLink) return;
    navigator.clipboard.writeText(affLink).then(() => {
      toast.success(t('topup.copied'));
    }).catch(() => {
      toast.error('Copy failed');
    });
  };

  const handleTransfer = async () => {
    const val = parseInt(transferAmount);
    if (!val || val <= 0) {
      toast.error(t('topup.enterAmount'));
      return;
    }
    setTransferring(true);
    try {
      const res = await transferAffQuota({ quota: val });
      if (res.data.success) {
        toast.success(res.data.message || t('topup.transferSuccess'));
        setTransferAmount('');
        await Promise.all([loadData(), refreshUser()]);
      }
    } catch (e) { /* interceptor */ }
    setTransferring(false);
  };

  const quota = usage?.quota ?? user?.quota ?? 0;
  const usedQuota = usage?.used_quota ?? user?.used_quota ?? 0;
  const requestCount = usage?.request_count ?? user?.request_count ?? 0;
  const balanceDollars = quota / Q * rate;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-page mb-1">
          {t('dashboard.welcome')} {user?.display_name || user?.username || 'User'}
        </h1>
        <p className="text-sm text-page-secondary">{t('dashboard.manageDesc')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-page-secondary mb-2">{t('dashboard.balance')}</p>
          <div className="text-3xl font-bold text-page">
            {symbol}<CountUp from={0} to={Math.round(balanceDollars * 100) / 100} duration={1.5} />
          </div>
          <p className="text-xs text-page-muted mt-1">{t('dashboard.quotaUnits', { count: quota.toLocaleString() })}</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-page-secondary mb-2">{t('dashboard.used')}</p>
          <div className="text-3xl font-bold text-page">
            {symbol}<CountUp from={0} to={Math.round(usedQuota / Q * rate * 100) / 100} duration={1.5} />
          </div>
          <p className="text-xs text-page-muted mt-1">{t('dashboard.quotaUnits', { count: usedQuota.toLocaleString() })}</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-page-secondary mb-2">{t('dashboard.totalRequests')}</p>
          <div className="text-3xl font-bold text-page">
            <CountUp from={0} to={requestCount} duration={1.5} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Redeem Code */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-page mb-4">{t('dashboard.redeemCode')}</h2>
          <form onSubmit={handleRedeem} className="flex gap-3">
            <input
              type="text"
              value={redeemInput}
              onChange={(e) => setRedeemInput(e.target.value)}
              className="input flex-1"
              placeholder={t('dashboard.enterCode')}
            />
            <button type="submit" disabled={redeeming} className="btn-primary whitespace-nowrap">
              {redeeming ? t('dashboard.redeeming') : t('dashboard.redeem')}
            </button>
          </form>
        </div>

        {/* Quick Links */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-page mb-4">{t('dashboard.quickLinks')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/tokens" className="glass-sm !rounded-xl px-4 py-3 hover:bg-page-surface-hover transition-colors group">
              <p className="text-sm font-medium text-page group-hover:text-page-link transition-colors">{t('dashboard.apiKeys')}</p>
              <p className="text-xs text-page-muted">{t('dashboard.manageKeys')}</p>
            </Link>
            <Link to="/topup" className="glass-sm !rounded-xl px-4 py-3 hover:bg-page-surface-hover transition-colors group">
              <p className="text-sm font-medium text-page group-hover:text-page-link transition-colors">{t('nav.topup')}</p>
              <p className="text-xs text-page-muted">{t('dashboard.topupDesc')}</p>
            </Link>
            <Link to="/packages" className="glass-sm !rounded-xl px-4 py-3 hover:bg-page-surface-hover transition-colors group">
              <p className="text-sm font-medium text-page group-hover:text-page-link transition-colors">{t('dashboard.packages')}</p>
              <p className="text-xs text-page-muted">{t('dashboard.viewPlans')}</p>
            </Link>
            <Link to="/pricing" className="glass-sm !rounded-xl px-4 py-3 hover:bg-page-surface-hover transition-colors group">
              <p className="text-sm font-medium text-page group-hover:text-page-link transition-colors">{t('dashboard.pricing')}</p>
              <p className="text-xs text-page-muted">{t('dashboard.modelPrices')}</p>
            </Link>
            <Link to="/logs" className="glass-sm !rounded-xl px-4 py-3 hover:bg-page-surface-hover transition-colors group">
              <p className="text-sm font-medium text-page group-hover:text-page-link transition-colors">{t('dashboard.logs')}</p>
              <p className="text-xs text-page-muted">{t('dashboard.viewLogs')}</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Invitation / Affiliate */}
      {affLink && (
        <div className="glass rounded-2xl p-6 mt-6">
          <h2 className="text-lg font-semibold text-page mb-1">{t('topup.inviteTitle')}</h2>
          <p className="text-sm text-page-secondary mb-5">{t('topup.inviteSubtitle')}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-sm rounded-xl p-4 text-center">
              <p className="text-xs text-page-secondary mb-1">{t('topup.affAvailable')}</p>
              <p className="text-xl font-bold text-page">
                {symbol}{((user?.aff_quota || 0) / Q * rate).toFixed(2)}
              </p>
            </div>
            <div className="glass-sm rounded-xl p-4 text-center">
              <p className="text-xs text-page-secondary mb-1">{t('topup.affTotal')}</p>
              <p className="text-xl font-bold text-page">
                {symbol}{((user?.aff_history_quota || 0) / Q * rate).toFixed(2)}
              </p>
            </div>
            <div className="glass-sm rounded-xl p-4 text-center">
              <p className="text-xs text-page-secondary mb-1">{t('topup.affCount')}</p>
              <p className="text-xl font-bold text-page">{user?.aff_count || 0}</p>
            </div>
          </div>

          {/* Invitation Link */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-page-label mb-2">{t('topup.inviteLink')}</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={affLink}
                className="input flex-1 text-sm"
              />
              <button
                onClick={handleCopyAffLink}
                className="btn-primary whitespace-nowrap text-sm px-4"
              >
                {t('topup.copy')}
              </button>
            </div>
          </div>

          {/* Transfer to balance */}
          {(user?.aff_quota || 0) > 0 && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-page-label mb-2">{t('topup.transferToBalance')}</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder={t('topup.transferPlaceholder')}
                  className="input flex-1 text-sm"
                  min={1}
                />
                <button
                  onClick={handleTransfer}
                  disabled={transferring}
                  className="btn-primary whitespace-nowrap text-sm px-4"
                >
                  {transferring ? t('topup.processing') : t('topup.transfer')}
                </button>
              </div>
            </div>
          )}

          {/* Earnings Details */}
          <div>
            <button
              onClick={() => { setShowAffEarnings(!showAffEarnings); if (!showAffEarnings) loadAffEarnings(); }}
              className="text-sm text-page-secondary hover:text-page transition-colors"
            >
              {showAffEarnings ? t('topup.hideEarnings') : t('topup.viewEarnings')}
            </button>
            {showAffEarnings && (
              <div className="mt-3">
                {affEarningsLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                  </div>
                ) : affEarnings.length === 0 ? (
                  <p className="text-sm text-page-muted text-center py-6">{t('topup.noEarnings')}</p>
                ) : (
                  <div className="space-y-2">
                    {affEarnings.map((item, i) => (
                      <div key={i} className="flex items-center justify-between glass-sm rounded-xl px-4 py-3">
                        <div>
                          <p className="text-sm text-page">{item.model_name}</p>
                          <p className="text-xs text-page-muted">
                            {new Date(item.created_time * 1000).toLocaleString()} · {(item.commission_rate * 100).toFixed(1)}%
                          </p>
                        </div>
                        <span className="text-sm font-medium text-page-success">
                          +{symbol}{(item.commission_quota / Q * rate).toFixed(4)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
