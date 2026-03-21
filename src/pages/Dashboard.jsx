import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getUserUsage, redeemCode, Q, quotaToDollar } from '../api';
import SpotlightCard from '../components/bits/SpotlightCard';
import CountUp from '../components/bits/CountUp';
import ShinyText from '../components/bits/ShinyText';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [usage, setUsage] = useState(null);
  const [redeemInput, setRedeemInput] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  const loadUsage = async () => {
    try {
      const r = await getUserUsage();
      if (r.data.success) setUsage(r.data.data);
    } catch (e) { /* interceptor */ }
  };

  useEffect(() => { loadUsage(); }, []);

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!redeemInput.trim()) return;
    setRedeeming(true);
    try {
      const res = await redeemCode(redeemInput.trim());
      if (res.data.success) {
        toast.success(t('dashboard.redeemSuccess'));
        setRedeemInput('');
        // Refresh both usage AND user data to update balance
        await Promise.all([loadUsage(), refreshUser()]);
      }
    } catch (err) { /* interceptor */ }
    setRedeeming(false);
  };

  // Use usage data (fresh from API) for balance/used — NOT stale user object
  const quota = usage?.quota ?? user?.quota ?? 0;
  const usedQuota = usage?.used_quota ?? user?.used_quota ?? 0;
  const requestCount = usage?.request_count ?? user?.request_count ?? 0;
  const balanceDollars = quota / Q;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-page mb-1">
          {t('dashboard.welcome')} <ShinyText text={user?.display_name || user?.username || 'User'} className="!inline" speed={3} color="#a5b4fc" shineColor="#e0e7ff" />
        </h1>
        <p className="text-sm text-page-secondary">{t('dashboard.manageDesc')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SpotlightCard className="!bg-neutral-900/60 !border-neutral-800/60 !p-6" spotlightColor="rgba(34,197,94,0.15)">
          <p className="text-sm text-page-secondary mb-2">{t('dashboard.balance')}</p>
          <div className="text-3xl font-bold text-page">
            $<CountUp from={0} to={balanceDollars} duration={1.5} />
          </div>
          <p className="text-xs text-page-muted mt-1">{t('dashboard.quotaUnits', { count: quota.toLocaleString() })}</p>
        </SpotlightCard>

        <SpotlightCard className="!bg-neutral-900/60 !border-neutral-800/60 !p-6" spotlightColor="rgba(129,140,248,0.15)">
          <p className="text-sm text-page-secondary mb-2">{t('dashboard.used')}</p>
          <div className="text-3xl font-bold text-page">
            $<CountUp from={0} to={usedQuota / Q} duration={1.5} />
          </div>
          <p className="text-xs text-page-muted mt-1">{t('dashboard.quotaUnits', { count: usedQuota.toLocaleString() })}</p>
        </SpotlightCard>

        <SpotlightCard className="!bg-neutral-900/60 !border-neutral-800/60 !p-6" spotlightColor="rgba(244,114,182,0.15)">
          <p className="text-sm text-page-secondary mb-2">{t('dashboard.totalRequests')}</p>
          <div className="text-3xl font-bold text-page">
            <CountUp from={0} to={requestCount} duration={1.5} />
          </div>
        </SpotlightCard>
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
            <Link to="/tokens" className="glass-sm !rounded-xl px-4 py-3 hover:bg-white/[0.06] transition-colors group">
              <p className="text-sm font-medium text-page group-hover:text-page-link transition-colors">{t('dashboard.apiKeys')}</p>
              <p className="text-xs text-page-muted">{t('dashboard.manageKeys')}</p>
            </Link>
            <Link to="/packages" className="glass-sm !rounded-xl px-4 py-3 hover:bg-white/[0.06] transition-colors group">
              <p className="text-sm font-medium text-page group-hover:text-page-link transition-colors">{t('dashboard.packages')}</p>
              <p className="text-xs text-page-muted">{t('dashboard.viewPlans')}</p>
            </Link>
            <Link to="/pricing" className="glass-sm !rounded-xl px-4 py-3 hover:bg-white/[0.06] transition-colors group">
              <p className="text-sm font-medium text-page group-hover:text-page-link transition-colors">{t('dashboard.pricing')}</p>
              <p className="text-xs text-page-muted">{t('dashboard.modelPrices')}</p>
            </Link>
            <div className="glass-sm !rounded-xl px-4 py-3 opacity-50">
              <p className="text-sm font-medium text-page">{t('dashboard.apiDocs')}</p>
              <p className="text-xs text-page-muted">{t('dashboard.comingSoon')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
