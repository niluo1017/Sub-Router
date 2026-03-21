import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { getSiteModels, getSitePackages } from '../../api';
import Particles from '../../components/bits/Particles';
import DecryptedText from '../../components/bits/DecryptedText';
import CountUp from '../../components/bits/CountUp';

export default function DarkHome() {
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
      {/* Particles Background */}
      <div className="absolute inset-0 h-[800px] overflow-hidden pointer-events-none">
        <Particles
          particleColors={['#10b981', '#06b6d4', '#8b5cf6']}
          particleCount={60}
          particleSpread={15}
          speed={0.2}
          particleBaseSize={80}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-28 pb-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Terminal badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400/80 uppercase tracking-wider">System Online</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            <DecryptedText
              text={site?.name || t('home.defaultHeroTitle')}
              speed={60}
              maxIterations={10}
              revealDirection="start"
              className="text-white"
              encryptedClassName="text-emerald-500/30"
            />
          </h1>

          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            <span className="text-emerald-400/60 font-mono">{'> '}</span>
            {t('home.heroSubtitle')}
          </p>

          <div className="flex items-center justify-center gap-4">
            {user ? (
              <Link to="/dashboard" className="px-8 py-3.5 rounded-lg bg-emerald-500 text-black font-bold text-base hover:bg-emerald-400 transition-all font-mono shadow-lg shadow-emerald-500/20">
                {t('home.goToDashboard')}
              </Link>
            ) : (
              <>
                <Link to="/register" className="px-8 py-3.5 rounded-lg bg-emerald-500 text-black font-bold text-base hover:bg-emerald-400 transition-all font-mono shadow-lg shadow-emerald-500/20">
                  {t('home.getStarted')}
                </Link>
                <Link to="/pricing" className="px-8 py-3.5 rounded-lg border border-emerald-500/20 text-emerald-400 font-medium text-base hover:bg-emerald-500/10 transition-all font-mono">
                  {t('home.viewPricing')}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-20">
          {[
            { label: t('home.aiModels'), value: enabledModels.length || 50, suffix: '+', color: 'text-emerald-400', border: 'border-emerald-500/15' },
            { label: t('home.uptime'), value: 99.9, suffix: '%', color: 'text-cyan-400', border: 'border-cyan-500/15' },
            { label: t('home.latency'), value: 50, suffix: 'ms', prefix: '<', color: 'text-violet-400', border: 'border-violet-500/15' },
          ].map((s, i) => (
            <div key={i} className={`text-center p-5 rounded-lg bg-[#030712]/60 border ${s.border} font-mono backdrop-blur-sm`}>
              <div className={`text-3xl font-bold ${s.color}`}>
                {s.prefix}<CountUp from={0} to={s.value} duration={2} />{s.suffix}
              </div>
              <p className="text-xs text-neutral-500 mt-1.5 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">{t('home.whyChooseUs')}</h2>
          <p className="text-neutral-500">{t('home.whyChooseUsDesc')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: (
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            ), title: t('home.lightningFast'), desc: t('home.lightningFastDesc'), accent: 'emerald' },
            { icon: (
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ), title: t('home.securePrivate'), desc: t('home.securePrivateDesc'), accent: 'cyan' },
            { icon: (
              <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ), title: t('home.payAsYouGo'), desc: t('home.payAsYouGoDesc'), accent: 'violet' },
          ].map((f, i) => (
            <div key={i} className={`p-6 rounded-xl bg-[#030712]/60 border border-${f.accent}-500/10 hover:border-${f.accent}-500/25 transition-all group backdrop-blur-sm`}>
              <div className={`w-10 h-10 rounded-lg bg-${f.accent}-500/10 flex items-center justify-center mb-4`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{f.desc}</p>
              <div className={`h-px w-0 group-hover:w-full bg-gradient-to-r from-${f.accent}-500/50 to-transparent transition-all duration-500 mt-4`} />
            </div>
          ))}
        </div>
      </section>

      {/* Models Preview */}
      {enabledModels.length > 0 && (
        <section className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">{t('home.availableModels')}</h2>
            <p className="text-neutral-500">{t('home.availableModelsDesc', { count: enabledModels.length })}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {enabledModels.slice(0, 12).map((m, i) => (
              <div key={m.id || i} className="px-4 py-3 rounded-lg bg-[#030712]/60 border border-emerald-500/[0.08] flex items-center gap-3 hover:border-emerald-500/20 transition-colors group font-mono backdrop-blur-sm">
                <span className="text-emerald-500/60 text-xs">$</span>
                <span className="text-sm text-neutral-400 group-hover:text-emerald-400 transition-colors truncate">
                  {m.display_name || m.model_name}
                </span>
              </div>
            ))}
          </div>

          {enabledModels.length > 12 && (
            <div className="text-center mt-6">
              <Link to="/pricing" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-mono">
                {t('home.viewAllModels', { count: enabledModels.length })} &rarr;
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Packages */}
      {packages.length > 0 && (
        <section className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">{t('home.plansPackages')}</h2>
            <p className="text-neutral-500">{t('home.choosePlan')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {packages.filter(p => p.enabled).slice(0, 3).map((pkg) => (
              <div key={pkg.id} className="rounded-xl p-6 flex flex-col bg-[#030712]/60 border border-emerald-500/[0.08] hover:border-emerald-500/20 transition-all backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-1">{pkg.name}</h3>
                {pkg.description && <p className="text-sm text-neutral-400 mb-4">{pkg.description}</p>}
                <div className="mt-auto pt-4">
                  <span className="text-3xl font-bold text-emerald-400 font-mono">${pkg.price}</span>
                  {pkg.original_price > pkg.price && (
                    <span className="text-sm text-neutral-600 line-through ml-2">${pkg.original_price}</span>
                  )}
                  {pkg.duration > 0 && <p className="text-xs text-neutral-600 mt-1">{t('home.days', { count: pkg.duration })}</p>}
                </div>
                <Link to={user ? '/packages' : '/register'} className="mt-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-sm text-center hover:bg-emerald-500/15 transition-colors font-mono">
                  {user ? t('home.subscribe') : t('home.getStarted')}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="rounded-xl p-12 text-center bg-[#030712]/60 border border-emerald-500/[0.08] relative overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.03] via-transparent to-cyan-500/[0.03]" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4">{t('home.readyToStart')}</h2>
            <p className="text-neutral-400 mb-8 max-w-md mx-auto">{t('home.readyToStartDesc')}</p>
            <div className="flex items-center justify-center gap-4">
              {user ? (
                <Link to="/dashboard" className="px-8 py-3 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all font-mono">
                  {t('home.goToDashboard')}
                </Link>
              ) : (
                <>
                  <Link to="/register" className="px-8 py-3 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all font-mono">
                    {t('home.createFreeAccount')}
                  </Link>
                  <Link to="/login" className="px-8 py-3 rounded-lg border border-emerald-500/20 text-emerald-400 font-medium hover:bg-emerald-500/10 transition-all font-mono">
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
