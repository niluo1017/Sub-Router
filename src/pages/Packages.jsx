import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getSitePackages, subscribePackage, Q } from '../api';
import SpotlightCard from '../components/bits/SpotlightCard';
import toast from 'react-hot-toast';

export default function Packages() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);

  const [confirmPkg, setConfirmPkg] = useState(null);

  useEffect(() => {
    getSitePackages()
      .then((r) => { if (r.data.success) setPackages(r.data.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (pkg) => {
    if (!user) {
      navigate('/register');
      return;
    }
    setConfirmPkg(pkg);
  };

  const confirmSubscribe = async () => {
    if (!confirmPkg) return;
    const pkgId = confirmPkg.id;
    setSubscribing(pkgId);
    try {
      const res = await subscribePackage(pkgId);
      if (res.data.success) {
        toast.success(t('packages.subscribedSuccess'));
        setConfirmPkg(null);
        // Refresh user data to update balance
        await refreshUser();
      }
    } catch (e) { /* interceptor */ }
    setSubscribing(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  const enabled = packages.filter((p) => p.enabled);

  const spotlightColors = [
    'rgba(129,140,248,0.15)',
    'rgba(192,132,252,0.15)',
    'rgba(244,114,182,0.15)',
    'rgba(34,197,94,0.15)',
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-heading font-bold text-white mb-3">{t('packages.title')}</h1>
        <p className="text-neutral-400 max-w-xl mx-auto">
          {t('packages.subtitle')}
        </p>
      </div>

      {enabled.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <p>{t('packages.noPackages')}</p>
          <Link to="/pricing" className="text-brand-400 hover:text-brand-300 transition-colors mt-2 inline-block">
            {t('packages.checkPricing')} &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {enabled.map((pkg, i) => (
            <SpotlightCard
              key={pkg.id}
              className="!bg-neutral-900/60 !border-neutral-800/60 !p-0 !rounded-2xl flex flex-col"
              spotlightColor={spotlightColors[i % spotlightColors.length]}
            >
              <div className="p-6 flex-1 flex flex-col">
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-white">{pkg.name}</h3>
                  {pkg.description && (
                    <p className="text-sm text-neutral-400 mt-1">{pkg.description}</p>
                  )}
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">${Number(pkg.price).toFixed(2)}</span>
                    {pkg.original_price > 0 && pkg.original_price > pkg.price && (
                      <span className="text-lg text-neutral-500 line-through">${Number(pkg.original_price).toFixed(2)}</span>
                    )}
                  </div>
                  {pkg.duration > 0 && (
                    <p className="text-sm text-neutral-500 mt-1">{t('packages.daysAccess', { count: pkg.duration })}</p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6 flex-1">
                  {pkg.quota_amount > 0 && (
                    <li className="flex items-center gap-2 text-sm text-neutral-300">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t('packages.creditIncluded', { amount: (pkg.quota_amount / Q).toFixed(2) })}
                    </li>
                  )}
                  {pkg.rate_limit > 0 && (
                    <li className="flex items-center gap-2 text-sm text-neutral-300">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t('packages.requestsMin', { count: pkg.rate_limit })}
                    </li>
                  )}
                  <li className="flex items-center gap-2 text-sm text-neutral-300">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('packages.allModels')}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-300">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('packages.openaiApi')}
                  </li>
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleSubscribe(pkg)}
                  disabled={subscribing === pkg.id}
                  className="btn-primary w-full text-center"
                >
                  {subscribing === pkg.id ? t('packages.processing') : user ? t('packages.subscribeNow') : t('packages.signUpToSubscribe')}
                </button>
              </div>
            </SpotlightCard>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmPkg && (() => {
        const userBalance = (user?.quota || 0) / Q;
        const pkgPrice = Number(confirmPkg.price);
        const insufficient = userBalance < pkgPrice;
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => !subscribing && setConfirmPkg(null)}>
          <div className="glass rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-3">{t('packages.confirmTitle')}</h2>
            <p className="text-sm text-neutral-400 mb-2">
              {t('packages.confirmDesc', { name: confirmPkg.name, price: pkgPrice.toFixed(2) })}
            </p>
            <p className="text-sm text-neutral-400 mb-4">
              {t('packages.yourBalance')} <span className={`font-medium ${insufficient ? 'text-red-400' : 'text-green-400'}`}>${userBalance.toFixed(2)}</span>
            </p>
            {insufficient && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
                <p className="text-sm text-red-300">{t('packages.insufficientBalance')}</p>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmPkg(null)} disabled={subscribing} className="btn-secondary">{t('tokens.cancel')}</button>
              <button onClick={confirmSubscribe} disabled={insufficient || subscribing} className="btn-primary">
                {subscribing ? t('packages.processing') : t('packages.confirm')}
              </button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
