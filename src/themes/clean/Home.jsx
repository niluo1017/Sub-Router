import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { getSiteModels, getSitePackages } from '../../api';
import CountUp from '../../components/bits/CountUp';
import FadeContent from '../../components/bits/FadeContent';

export default function CleanHome() {
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
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <FadeContent blur duration={600} delay={100}>
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {t('home.lightningFast')}
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
              {site?.name || t('home.defaultHeroTitle')}
            </h1>

            <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
              {t('home.heroSubtitle')}
            </p>

            <div className="flex items-center justify-center gap-3">
              {user ? (
                <Link to="/dashboard" className="px-7 py-3 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm">
                  {t('home.goToDashboard')} →
                </Link>
              ) : (
                <>
                  <Link to="/register" className="px-7 py-3 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm">
                    {t('home.getStarted')} →
                  </Link>
                  <Link to="/pricing" className="px-7 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:border-gray-300 hover:bg-gray-50 transition-colors">
                    {t('home.viewPricing')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </FadeContent>

        {/* Stats */}
        <FadeContent blur duration={600} delay={300}>
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16 pt-10 border-t border-gray-100">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                <CountUp from={0} to={enabledModels.length || 50} duration={2} />+
              </div>
              <p className="text-sm text-gray-400 mt-1">{t('home.aiModels')}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                <CountUp from={0} to={99.9} duration={2.5} />%
              </div>
              <p className="text-sm text-gray-400 mt-1">{t('home.uptime')}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                &lt;<CountUp from={200} to={50} duration={2} direction="down" />ms
              </div>
              <p className="text-sm text-gray-400 mt-1">{t('home.latency')}</p>
            </div>
          </div>
        </FadeContent>
      </section>

      {/* Features */}
      <section className="bg-gray-50/70 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <FadeContent blur duration={600} delay={100}>
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('home.whyChooseUs')}</h2>
              <p className="text-gray-500">{t('home.whyChooseUsDesc')}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-lg hover:shadow-gray-100/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{t('home.lightningFast')}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{t('home.lightningFastDesc')}</p>
              </div>

              <div className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-lg hover:shadow-gray-100/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{t('home.securePrivate')}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{t('home.securePrivateDesc')}</p>
              </div>

              <div className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-lg hover:shadow-gray-100/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{t('home.payAsYouGo')}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{t('home.payAsYouGoDesc')}</p>
              </div>
            </div>
          </FadeContent>
        </div>
      </section>

      {/* Models */}
      {enabledModels.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20">
          <FadeContent blur duration={600} delay={100}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('home.availableModels')}</h2>
              <p className="text-gray-500">{t('home.availableModelsDesc', { count: enabledModels.length })}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {enabledModels.slice(0, 12).map((m, i) => (
                <div key={m.id || i} className="px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center gap-3 hover:bg-blue-50/50 hover:border-blue-100 transition-colors group">
                  <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  <span className="text-sm font-mono text-gray-600 group-hover:text-blue-700 transition-colors truncate">
                    {m.display_name || m.model_name}
                  </span>
                </div>
              ))}
            </div>

            {enabledModels.length > 12 && (
              <div className="text-center mt-6">
                <Link to="/pricing" className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium">
                  {t('home.viewAllModels', { count: enabledModels.length })} →
                </Link>
              </div>
            )}
          </FadeContent>
        </section>
      )}

      {/* Packages */}
      {packages.length > 0 && (
        <section className="bg-gray-50/70 border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <FadeContent blur duration={600} delay={100}>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('home.plansPackages')}</h2>
                <p className="text-gray-500">{t('home.choosePlan')}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {packages.filter(p => p.enabled).slice(0, 3).map((pkg, i) => (
                  <div key={pkg.id} className={`bg-white rounded-2xl p-6 flex flex-col border transition-all hover:shadow-lg hover:shadow-gray-100/50 ${
                    i === 1 ? 'border-blue-200 shadow-md shadow-blue-50' : 'border-gray-100'
                  }`}>
                    {i === 1 && <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-2">Popular</span>}
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{pkg.name}</h3>
                    {pkg.description && <p className="text-sm text-gray-500 mb-4">{pkg.description}</p>}
                    <div className="mt-auto pt-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">${pkg.price}</span>
                        {pkg.original_price > pkg.price && (
                          <span className="text-sm text-gray-400 line-through">${pkg.original_price}</span>
                        )}
                      </div>
                      {pkg.duration > 0 && <p className="text-xs text-gray-400 mt-1">{t('home.days', { count: pkg.duration })}</p>}
                    </div>
                    <Link to={user ? '/packages' : '/register'} className={`mt-4 py-2.5 rounded-xl font-medium text-sm text-center transition-colors ${
                      i === 1
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}>
                      {user ? t('home.subscribe') : t('home.getStarted')}
                    </Link>
                  </div>
                ))}
              </div>
            </FadeContent>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <FadeContent blur duration={600} delay={100}>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">{t('home.readyToStart')}</h2>
            <p className="text-blue-100 mb-8 max-w-md mx-auto">{t('home.readyToStartDesc')}</p>
            <div className="flex items-center justify-center gap-4">
              {user ? (
                <Link to="/dashboard" className="px-8 py-3 rounded-xl bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-colors">
                  {t('home.goToDashboard')}
                </Link>
              ) : (
                <>
                  <Link to="/register" className="px-8 py-3 rounded-xl bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-colors">
                    {t('home.createFreeAccount')}
                  </Link>
                  <Link to="/login" className="px-8 py-3 rounded-xl border border-white/30 text-white font-medium text-sm hover:bg-white/10 transition-colors">
                    {t('home.signIn')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </FadeContent>
      </section>
    </div>
  );
}
