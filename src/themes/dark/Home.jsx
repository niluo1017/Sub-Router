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
          particleColors={['#00ff88', '#00ccff', '#ff0055']}
          particleCount={80}
          particleSpread={15}
          speed={0.3}
          particleBaseSize={80}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-28 pb-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Terminal-style header */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/30 bg-green-500/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono text-green-400 uppercase tracking-wider">System Online</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-white leading-tight mb-4">
            <DecryptedText
              text={site?.name || t('home.defaultHeroTitle')}
              speed={60}
              maxIterations={10}
              revealDirection="start"
              className="text-white"
              encryptedClassName="text-green-500/40"
            />
          </h1>

          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 font-mono">
            {'> '}{t('home.heroSubtitle')}
          </p>

          <div className="flex items-center justify-center gap-4">
            {user ? (
              <Link to="/dashboard" className="px-8 py-3.5 rounded-lg bg-green-500 text-black font-bold text-base hover:bg-green-400 transition-all font-mono shadow-lg shadow-green-500/20">
                {t('home.goToDashboard')}
              </Link>
            ) : (
              <>
                <Link to="/register" className="px-8 py-3.5 rounded-lg bg-green-500 text-black font-bold text-base hover:bg-green-400 transition-all font-mono shadow-lg shadow-green-500/20">
                  {t('home.getStarted')}
                </Link>
                <Link to="/pricing" className="px-8 py-3.5 rounded-lg border border-green-500/30 text-green-400 font-bold text-base hover:bg-green-500/10 transition-all font-mono">
                  {t('home.viewPricing')}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Stats — terminal style */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-20">
          {[
            { label: t('home.aiModels'), value: enabledModels.length || 50, suffix: '+', color: 'text-green-400 border-green-500/20' },
            { label: t('home.uptime'), value: 99.9, suffix: '%', color: 'text-cyan-400 border-cyan-500/20' },
            { label: t('home.latency'), value: 50, suffix: 'ms', prefix: '<', color: 'text-pink-400 border-pink-500/20' },
          ].map((s, i) => (
            <div key={i} className={`text-center p-4 rounded-lg bg-black/60 border ${s.color} font-mono`}>
              <div className={`text-3xl font-bold ${s.color.split(' ')[0]}`}>
                {s.prefix}<CountUp from={0} to={s.value} duration={2} />{s.suffix}
              </div>
              <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-heading font-bold text-white mb-3">{t('home.whyChooseUs')}</h2>
          <p className="text-neutral-500 font-mono">{t('home.whyChooseUsDesc')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '⚡', title: t('home.lightningFast'), desc: t('home.lightningFastDesc'), accent: 'green' },
            { icon: '🛡️', title: t('home.securePrivate'), desc: t('home.securePrivateDesc'), accent: 'cyan' },
            { icon: '📊', title: t('home.payAsYouGo'), desc: t('home.payAsYouGoDesc'), accent: 'pink' },
          ].map((f, i) => (
            <div key={i} className={`p-6 rounded-xl bg-black/40 border border-${f.accent}-500/20 hover:border-${f.accent}-500/40 transition-all group`}>
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className={`text-lg font-semibold text-${f.accent}-400 mb-2 font-mono`}>{f.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{f.desc}</p>
              <div className={`h-0.5 w-0 group-hover:w-full bg-${f.accent}-500/50 transition-all duration-500 mt-4`} />
            </div>
          ))}
        </div>
      </section>

      {/* Models Preview */}
      {enabledModels.length > 0 && (
        <section className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-white mb-3">{t('home.availableModels')}</h2>
            <p className="text-neutral-500 font-mono">{t('home.availableModelsDesc', { count: enabledModels.length })}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {enabledModels.slice(0, 12).map((m, i) => (
              <div key={m.id || i} className="px-4 py-3 rounded-lg bg-black/40 border border-green-500/10 flex items-center gap-3 hover:border-green-500/30 transition-colors group font-mono">
                <span className="text-green-500 text-xs">$</span>
                <span className="text-sm text-neutral-400 group-hover:text-green-400 transition-colors truncate">
                  {m.display_name || m.model_name}
                </span>
              </div>
            ))}
          </div>

          {enabledModels.length > 12 && (
            <div className="text-center mt-6">
              <Link to="/pricing" className="text-sm text-green-400 hover:text-green-300 transition-colors font-mono">
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
            <h2 className="text-3xl font-heading font-bold text-white mb-3">{t('home.plansPackages')}</h2>
            <p className="text-neutral-500 font-mono">{t('home.choosePlan')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {packages.filter(p => p.enabled).slice(0, 3).map((pkg) => (
              <div key={pkg.id} className="rounded-xl p-6 flex flex-col bg-black/40 border border-green-500/10 hover:border-green-500/30 transition-all">
                <h3 className="text-lg font-semibold text-white mb-1 font-mono">{pkg.name}</h3>
                {pkg.description && <p className="text-sm text-neutral-400 mb-4">{pkg.description}</p>}
                <div className="mt-auto pt-4">
                  <span className="text-3xl font-bold text-green-400 font-mono">${pkg.price}</span>
                  {pkg.original_price > pkg.price && (
                    <span className="text-sm text-neutral-600 line-through ml-2">${pkg.original_price}</span>
                  )}
                  {pkg.duration > 0 && <p className="text-xs text-neutral-600 mt-1 font-mono">{t('home.days', { count: pkg.duration })}</p>}
                </div>
                <Link to={user ? '/packages' : '/register'} className="mt-4 py-2.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 font-medium text-sm text-center hover:bg-green-500/20 transition-colors font-mono">
                  {user ? t('home.subscribe') : t('home.getStarted')}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="rounded-xl p-12 text-center bg-black/60 border border-green-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-cyan-500/5" />
          <div className="relative z-10">
            <h2 className="text-3xl font-heading font-bold text-white mb-4 font-mono">{t('home.readyToStart')}</h2>
            <p className="text-neutral-400 mb-8 max-w-md mx-auto">{t('home.readyToStartDesc')}</p>
            <div className="flex items-center justify-center gap-4">
              {user ? (
                <Link to="/dashboard" className="px-8 py-3 rounded-lg bg-green-500 text-black font-bold hover:bg-green-400 transition-all font-mono">
                  {t('home.goToDashboard')}
                </Link>
              ) : (
                <>
                  <Link to="/register" className="px-8 py-3 rounded-lg bg-green-500 text-black font-bold hover:bg-green-400 transition-all font-mono">
                    {t('home.createFreeAccount')}
                  </Link>
                  <Link to="/login" className="px-8 py-3 rounded-lg border border-green-500/30 text-green-400 font-bold hover:bg-green-500/10 transition-all font-mono">
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
