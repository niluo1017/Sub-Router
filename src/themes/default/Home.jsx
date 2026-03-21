import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { getSiteModels, getSitePackages } from '../../api';
import Aurora from '../../components/bits/Aurora';
import SplitText from '../../components/bits/SplitText';
import RotatingText from '../../components/bits/RotatingText';
import SpotlightCard from '../../components/bits/SpotlightCard';
import CountUp from '../../components/bits/CountUp';

export default function DefaultHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { site } = useSite();
  const [models, setModels] = useState([]);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    getSiteModels().then(r => { if (r.data.success) setModels(r.data.data || []); }).catch(() => {});
    getSitePackages().then(r => { if (r.data.success) setPackages(r.data.data || []); }).catch(() => {});
  }, []);

  const enabledModels = models.filter(m => m.enabled !== false);

  return (
    <div className="relative">
      {/* Aurora Background */}
      <div className="absolute inset-0 h-[700px] overflow-hidden pointer-events-none opacity-60">
        <Aurora colorStops={["#4338ca", "#7c3aed", "#06b6d4"]} blend={0.5} amplitude={1.0} speed={0.5} />
      </div>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-28 pb-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight">
              <SplitText text={site?.name || t('home.defaultHeroTitle')} delay={80} className="inline" />
            </h1>
          </div>

          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-4 leading-relaxed">
            {t('home.heroSubtitle')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <RotatingText
              texts={[t('home.lightningFast'), t('home.securePrivate'), t('home.payAsYouGo')]}
              mainClassName="px-4 py-2 bg-white/[0.06] backdrop-blur-sm rounded-full text-white text-sm font-medium overflow-hidden border border-white/[0.08]"
              staggerFrom="last"
              rotationInterval={3000}
            />
          </div>

          <div className="flex items-center justify-center gap-4">
            {user ? (
              <Link to="/dashboard" className="px-8 py-3.5 rounded-2xl bg-white text-black font-semibold text-base hover:bg-neutral-100 transition-all shadow-xl shadow-white/10">
                {t('home.goToDashboard')}
              </Link>
            ) : (
              <>
                <Link to="/register" className="px-8 py-3.5 rounded-2xl bg-white text-black font-semibold text-base hover:bg-neutral-100 transition-all shadow-xl shadow-white/10">
                  {t('home.getStarted')}
                </Link>
                <Link to="/pricing" className="px-8 py-3.5 rounded-2xl border border-white/20 text-white font-medium text-base hover:bg-white/10 transition-all">
                  {t('home.viewPricing')}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-24">
          {[
            { value: enabledModels.length || 50, suffix: '+', label: t('home.aiModels') },
            { value: 99.9, suffix: '%', label: t('home.uptime') },
            { value: 50, suffix: 'ms', label: t('home.latency'), prefix: '<' },
          ].map((stat, i) => (
            <div key={i} className="text-center p-5 rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.08]">
              <div className="text-3xl font-bold text-white">
                {stat.prefix}<CountUp from={0} to={stat.value} duration={2} />{stat.suffix}
              </div>
              <p className="text-sm text-neutral-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">{t('home.whyChooseUs')}</h2>
          <p className="text-neutral-400">{t('home.whyChooseUsDesc')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <SpotlightCard className="!bg-gradient-to-br !from-violet-500/10 !to-blue-500/10 !border-violet-500/20" spotlightColor="rgba(139,92,246,0.1)">
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('home.lightningFast')}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{t('home.lightningFastDesc')}</p>
            </div>
          </SpotlightCard>

          <SpotlightCard className="!bg-gradient-to-br !from-blue-500/10 !to-cyan-500/10 !border-blue-500/20" spotlightColor="rgba(59,130,246,0.1)">
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('home.securePrivate')}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{t('home.securePrivateDesc')}</p>
            </div>
          </SpotlightCard>

          <SpotlightCard className="!bg-gradient-to-br !from-cyan-500/10 !to-teal-500/10 !border-cyan-500/20" spotlightColor="rgba(6,182,212,0.1)">
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('home.payAsYouGo')}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{t('home.payAsYouGoDesc')}</p>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* Models Preview */}
      {enabledModels.length > 0 && (
        <section className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">{t('home.availableModels')}</h2>
            <p className="text-neutral-400">{t('home.availableModelsDesc', { count: enabledModels.length })}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {enabledModels.slice(0, 12).map((m, i) => (
              <div key={m.id || i} className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3 hover:bg-white/[0.06] transition-colors group">
                <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                <span className="text-sm font-mono text-neutral-300 group-hover:text-white transition-colors truncate">
                  {m.display_name || m.model_name}
                </span>
              </div>
            ))}
          </div>

          {enabledModels.length > 12 && (
            <div className="text-center mt-6">
              <Link to="/pricing" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                {t('home.viewAllModels', { count: enabledModels.length })} &rarr;
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Packages Preview */}
      {packages.length > 0 && (
        <section className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">{t('home.plansPackages')}</h2>
            <p className="text-neutral-400">{t('home.choosePlan')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {packages.filter(p => p.enabled).slice(0, 3).map((pkg, i) => (
              <div key={pkg.id} className={`rounded-2xl p-6 flex flex-col border transition-all hover:scale-[1.02] ${
                i === 1 ? 'bg-white/[0.06] border-white/[0.12] shadow-xl shadow-blue-500/5' : 'bg-white/[0.03] border-white/[0.06]'
              }`}>
                {i === 1 && <span className="text-xs text-blue-400 font-medium mb-2 uppercase tracking-wider">{t('home.popular') || 'Popular'}</span>}
                <h3 className="text-lg font-semibold text-white mb-1">{pkg.name}</h3>
                {pkg.description && <p className="text-sm text-neutral-400 mb-4">{pkg.description}</p>}
                <div className="mt-auto pt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">${pkg.price}</span>
                    {pkg.original_price > pkg.price && (
                      <span className="text-sm text-neutral-500 line-through">${pkg.original_price}</span>
                    )}
                  </div>
                  {pkg.duration > 0 && <p className="text-xs text-neutral-500 mt-1">{t('home.days', { count: pkg.duration })}</p>}
                </div>
                <Link to={user ? '/packages' : '/register'} className={`mt-4 py-2.5 rounded-xl font-medium text-sm text-center transition-colors ${
                  i === 1
                    ? 'bg-white text-black hover:bg-neutral-100'
                    : 'bg-white/[0.06] text-white border border-white/[0.08] hover:bg-white/[0.1]'
                }`}>
                  {user ? t('home.subscribe') : t('home.getStarted')}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="rounded-3xl p-12 text-center relative overflow-hidden bg-gradient-to-br from-violet-600/10 via-blue-600/10 to-cyan-600/10 border border-white/[0.08]">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4">{t('home.readyToStart')}</h2>
            <p className="text-neutral-400 mb-8 max-w-md mx-auto">{t('home.readyToStartDesc')}</p>
            <div className="flex items-center justify-center gap-4">
              {user ? (
                <Link to="/dashboard" className="px-8 py-3 rounded-2xl bg-white text-black font-semibold hover:bg-neutral-100 transition-all">
                  {t('home.goToDashboard')}
                </Link>
              ) : (
                <>
                  <Link to="/register" className="px-8 py-3 rounded-2xl bg-white text-black font-semibold hover:bg-neutral-100 transition-all">
                    {t('home.createFreeAccount')}
                  </Link>
                  <Link to="/login" className="px-8 py-3 rounded-2xl border border-white/20 text-white font-medium hover:bg-white/10 transition-all">
                    {t('home.signIn')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
