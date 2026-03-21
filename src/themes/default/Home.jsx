import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { getSiteModels, getSitePackages } from '../../api';
import Aurora from '../../components/bits/Aurora';
import SplitText from '../../components/bits/SplitText';
import RotatingText from '../../components/bits/RotatingText';
import TiltedCard from '../../components/bits/TiltedCard';
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
      <div className="absolute inset-0 h-[700px] overflow-hidden pointer-events-none">
        <Aurora colorStops={["#3A29FF", "#FF94B4", "#FF3232"]} blend={0.5} amplitude={1.0} speed={0.5} />
      </div>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-28 pb-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-4">
            <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-white leading-tight">
              <SplitText text={site?.name || t('home.defaultHeroTitle')} delay={80} className="inline" />
            </h1>
          </div>

          <div className="flex items-center justify-center gap-2 text-xl md:text-2xl text-neutral-300 mb-10">
            <span>{t('home.heroSubtitle').split('.')[0]}.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <RotatingText
              texts={[t('home.lightningFast'), t('home.securePrivate'), t('home.payAsYouGo')]}
              mainClassName="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium overflow-hidden"
              staggerFrom="last"
              rotationInterval={3000}
            />
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            {user ? (
              <Link to="/dashboard" className="px-8 py-3.5 rounded-2xl bg-white text-black font-semibold text-base hover:bg-neutral-100 transition-all shadow-xl shadow-white/10">
                {t('home.goToDashboard')}
              </Link>
            ) : (
              <>
                <Link to="/register" className="px-8 py-3.5 rounded-2xl bg-white text-black font-semibold text-base hover:bg-neutral-100 transition-all shadow-xl shadow-white/10">
                  {t('home.getStarted')}
                </Link>
                <Link to="/pricing" className="px-8 py-3.5 rounded-2xl border border-white/20 text-white font-semibold text-base hover:bg-white/10 transition-all">
                  {t('home.viewPricing')}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-24">
          {[
            { value: enabledModels.length || 50, suffix: '+', label: t('home.aiModels') },
            { value: 99.9, suffix: '%', label: t('home.uptime') },
            { value: 50, suffix: 'ms', label: t('home.latency'), prefix: '<' },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
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
          <h2 className="text-3xl font-heading font-bold text-white mb-3">{t('home.whyChooseUs')}</h2>
          <p className="text-neutral-400">{t('home.whyChooseUsDesc')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '⚡', title: t('home.lightningFast'), desc: t('home.lightningFastDesc'), color: 'from-yellow-500/20 to-orange-500/20' },
            { icon: '🔒', title: t('home.securePrivate'), desc: t('home.securePrivateDesc'), color: 'from-blue-500/20 to-cyan-500/20' },
            { icon: '💰', title: t('home.payAsYouGo'), desc: t('home.payAsYouGoDesc'), color: 'from-green-500/20 to-emerald-500/20' },
          ].map((f, i) => (
            <TiltedCard
              key={i}
              rotateAmplitude={8}
              scaleOnHover={1.03}
              borderRadius="16px"
              className="w-full"
            >
              <div className={`p-6 rounded-2xl bg-gradient-to-br ${f.color} border border-white/10 h-full`}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-300 leading-relaxed">{f.desc}</p>
              </div>
            </TiltedCard>
          ))}
        </div>
      </section>

      {/* Models Preview */}
      {enabledModels.length > 0 && (
        <section className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-white mb-3">{t('home.availableModels')}</h2>
            <p className="text-neutral-400">{t('home.availableModelsDesc', { count: enabledModels.length })}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {enabledModels.slice(0, 12).map((m, i) => (
              <div key={m.id || i} className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 hover:bg-white/10 transition-colors group">
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
            <h2 className="text-3xl font-heading font-bold text-white mb-3">{t('home.plansPackages')}</h2>
            <p className="text-neutral-400">{t('home.choosePlan')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {packages.filter(p => p.enabled).slice(0, 3).map((pkg, i) => (
              <div key={pkg.id} className={`rounded-2xl p-6 flex flex-col border transition-all hover:scale-[1.02] ${
                i === 1 ? 'bg-white/10 border-white/20 shadow-xl' : 'bg-white/5 border-white/10'
              }`}>
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
                <Link to={user ? '/packages' : '/register'} className="mt-4 py-2.5 rounded-xl bg-white text-black font-medium text-sm text-center hover:bg-neutral-100 transition-colors">
                  {user ? t('home.subscribe') : t('home.getStarted')}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="rounded-3xl p-12 text-center relative overflow-hidden bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 border border-white/10">
          <div className="relative z-10">
            <h2 className="text-3xl font-heading font-bold text-white mb-4">{t('home.readyToStart')}</h2>
            <p className="text-neutral-300 mb-8 max-w-md mx-auto">{t('home.readyToStartDesc')}</p>
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
                  <Link to="/login" className="px-8 py-3 rounded-2xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-all">
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
