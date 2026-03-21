import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { getSiteModels, getSitePackages } from '../../api';
import CountUp from '../../components/bits/CountUp';
import FadeContent from '../../components/bits/FadeContent';
import GradientText from '../../components/bits/GradientText';
import SpotlightCard from '../../components/bits/SpotlightCard';
import ShinyText from '../../components/bits/ShinyText';

export default function CorporateHome() {
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
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(148,163,184,0.15),transparent)]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20">
          <FadeContent blur duration={600} delay={100}>
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <ShinyText
                  text={t('home.lightningFast')}
                  speed={5}
                  color="#475569"
                  shineColor="rgba(71,85,105,0.4)"
                  className="text-xs font-semibold uppercase tracking-wider"
                />
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                <GradientText
                  colors={['#0f172a', '#334155', '#64748b', '#334155', '#0f172a']}
                  animationSpeed={8}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight"
                >
                  {site?.name || t('home.defaultHeroTitle')}
                </GradientText>
              </h1>

              <p className="text-lg text-slate-500 max-w-xl mb-10 leading-relaxed">
                {t('home.heroSubtitle')}
              </p>

              <div className="flex items-center gap-4">
                {user ? (
                  <Link to="/dashboard" className="inline-flex items-center px-6 py-3 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors">
                    {t('home.goToDashboard')}
                    <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="inline-flex items-center px-6 py-3 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors">
                      {t('home.getStarted')}
                      <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Link>
                    <Link to="/pricing" className="inline-flex items-center px-6 py-3 rounded-lg border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:border-slate-300 hover:bg-slate-50 transition-colors">
                      {t('home.viewPricing')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </FadeContent>

          {/* Stats bar */}
          <FadeContent blur duration={600} delay={300}>
            <div className="mt-20 grid grid-cols-3 divide-x divide-slate-200 border border-slate-200 rounded-xl bg-white shadow-sm">
              <div className="px-8 py-6 text-center">
                <div className="text-3xl font-bold text-slate-900">
                  <CountUp from={0} to={enabledModels.length || 50} duration={2} />+
                </div>
                <p className="text-sm text-slate-500 mt-1 font-medium">{t('home.aiModels')}</p>
              </div>
              <div className="px-8 py-6 text-center">
                <div className="text-3xl font-bold text-slate-900">
                  <CountUp from={0} to={99.9} duration={2.5} />%
                </div>
                <p className="text-sm text-slate-500 mt-1 font-medium">{t('home.uptime')}</p>
              </div>
              <div className="px-8 py-6 text-center">
                <div className="text-3xl font-bold text-slate-900">
                  &lt;<CountUp from={200} to={50} duration={2} direction="down" />ms
                </div>
                <p className="text-sm text-slate-500 mt-1 font-medium">{t('home.latency')}</p>
              </div>
            </div>
          </FadeContent>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <FadeContent blur duration={600} delay={100}>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">{t('home.whyChooseUs')}</h2>
              <p className="text-slate-500 text-lg">{t('home.whyChooseUsDesc')}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <SpotlightCard className="!bg-white !rounded-xl !p-0 !border-slate-200 !shadow-sm" spotlightColor="rgba(245,158,11,0.06)">
                <div className="p-8">
                  <div className="w-11 h-11 rounded-lg bg-amber-100 flex items-center justify-center mb-5">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('home.lightningFast')}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{t('home.lightningFastDesc')}</p>
                </div>
              </SpotlightCard>

              <SpotlightCard className="!bg-white !rounded-xl !p-0 !border-slate-200 !shadow-sm" spotlightColor="rgba(14,165,233,0.06)">
                <div className="p-8">
                  <div className="w-11 h-11 rounded-lg bg-sky-100 flex items-center justify-center mb-5">
                    <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('home.securePrivate')}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{t('home.securePrivateDesc')}</p>
                </div>
              </SpotlightCard>

              <SpotlightCard className="!bg-white !rounded-xl !p-0 !border-slate-200 !shadow-sm" spotlightColor="rgba(16,185,129,0.06)">
                <div className="p-8">
                  <div className="w-11 h-11 rounded-lg bg-emerald-100 flex items-center justify-center mb-5">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('home.payAsYouGo')}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{t('home.payAsYouGoDesc')}</p>
                </div>
              </SpotlightCard>
            </div>
          </FadeContent>
        </div>
      </section>

      {/* Models */}
      {enabledModels.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <FadeContent blur duration={600} delay={100}>
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">{t('home.availableModels')}</h2>
              <p className="text-slate-500 text-lg">{t('home.availableModelsDesc', { count: enabledModels.length })}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {enabledModels.slice(0, 12).map((m, i) => (
                <div key={m.id || i} className="px-4 py-3.5 rounded-lg border border-slate-200 bg-white flex items-center gap-3 hover:border-slate-300 hover:shadow-sm transition-all group">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-sm font-mono text-slate-600 group-hover:text-slate-900 transition-colors truncate">
                    {m.display_name || m.model_name}
                  </span>
                </div>
              ))}
            </div>

            {enabledModels.length > 12 && (
              <div className="text-center mt-8">
                <Link to="/pricing" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors font-semibold">
                  {t('home.viewAllModels', { count: enabledModels.length })}
                  <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
              </div>
            )}
          </FadeContent>
        </section>
      )}

      {/* Packages */}
      {packages.length > 0 && (
        <section className="border-y border-slate-200 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
            <FadeContent blur duration={600} delay={100}>
              <div className="text-center mb-14">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">{t('home.plansPackages')}</h2>
                <p className="text-slate-500 text-lg">{t('home.choosePlan')}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {packages.filter(p => p.enabled).slice(0, 3).map((pkg, i) => (
                  <SpotlightCard
                    key={pkg.id}
                    className={`!bg-white !rounded-xl !p-0 !flex !flex-col ${
                      i === 1 ? '!border-slate-900 !shadow-md relative' : '!border-slate-200'
                    }`}
                    spotlightColor={i === 1 ? 'rgba(15,23,42,0.06)' : 'rgba(0,0,0,0.02)'}
                  >
                    <div className="relative">
                      {i === 1 && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Popular</span>
                        </div>
                      )}
                      <div className="p-8 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{pkg.name}</h3>
                        {pkg.description && <p className="text-sm text-slate-500 mb-6">{pkg.description}</p>}
                        <div className="mt-auto">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-4xl font-bold text-slate-900">${pkg.price}</span>
                            {pkg.original_price > pkg.price && (
                              <span className="text-sm text-slate-400 line-through">${pkg.original_price}</span>
                            )}
                          </div>
                          {pkg.duration > 0 && <p className="text-sm text-slate-400 mt-1">{t('home.days', { count: pkg.duration })}</p>}
                        </div>
                      </div>
                      <div className="px-8 pb-8">
                        <Link to={user ? '/packages' : '/register'} className={`block py-3 rounded-lg font-semibold text-sm text-center transition-colors ${
                          i === 1
                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}>
                          {user ? t('home.subscribe') : t('home.getStarted')}
                        </Link>
                      </div>
                    </div>
                  </SpotlightCard>
                ))}
              </div>
            </FadeContent>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <FadeContent blur duration={600} delay={100}>
          <div className="bg-slate-900 rounded-2xl p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(148,163,184,0.15),transparent)]" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">{t('home.readyToStart')}</h2>
              <p className="text-slate-400 mb-10 max-w-lg mx-auto text-lg">{t('home.readyToStartDesc')}</p>
              <div className="flex items-center justify-center gap-4">
                {user ? (
                  <Link to="/dashboard" className="inline-flex items-center px-8 py-3 rounded-lg bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-colors">
                    {t('home.goToDashboard')}
                    <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="inline-flex items-center px-8 py-3 rounded-lg bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-colors">
                      {t('home.createFreeAccount')}
                      <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Link>
                    <Link to="/login" className="px-8 py-3 rounded-lg border border-slate-700 text-slate-300 font-medium text-sm hover:bg-slate-800 transition-colors">
                      {t('home.signIn')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </FadeContent>
      </section>
    </div>
  );
}
