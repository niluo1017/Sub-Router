import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { getSiteModels, getSitePackages } from '../../api';
import CountUp from '../../components/bits/CountUp';
import FadeContent from '../../components/bits/FadeContent';
import GradientText from '../../components/bits/GradientText';
import BlurText from '../../components/bits/BlurText';
import ShinyText from '../../components/bits/ShinyText';
import SpotlightCard from '../../components/bits/SpotlightCard';
import StarBorder from '../../components/bits/StarBorder';

export default function ClaudeHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { site } = useSite();
  const cs = site?.currency_symbol || '¥';
  const [models, setModels] = useState([]);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    getSiteModels().then(r => { if (r.data.success) setModels(r.data.data || []); }).catch(() => {});
    getSitePackages().then(r => { if (r.data.success) setPackages(r.data.data || []); }).catch(() => {});
  }, []);

  const enabledModels = models.filter(m => m.enabled !== false);

  return (
    <div className="bg-[#FAF6F1]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Warm gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5EEE6] via-[#FAF6F1] to-[#FAF6F1]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_70%_30%,rgba(217,119,87,0.08),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_30%_70%,rgba(196,97,63,0.05),transparent_60%)]" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20">
          <FadeContent blur duration={600} delay={100}>
            <div className="text-center max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D97757]/8 border border-[#D97757]/15 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97757] animate-pulse" />
                <ShinyText
                  text={t('home.lightningFast')}
                  speed={4}
                  color="#D97757"
                  shineColor="rgba(217,119,87,0.4)"
                  className="text-sm font-medium"
                />
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
                <GradientText
                  colors={['#D97757', '#C4613F', '#A85232', '#C4613F', '#D97757']}
                  animationSpeed={6}
                  className="text-4xl md:text-6xl font-bold leading-tight tracking-tight"
                >
                  {site?.name || t('home.defaultHeroTitle')}
                </GradientText>
              </h1>

              {/* Subtitle */}
              <div className="mb-10">
                <BlurText
                  text={t('home.heroSubtitle')}
                  className="text-lg text-[#6B5D4F] max-w-xl mx-auto leading-relaxed"
                  delay={50}
                  animateBy="words"
                />
              </div>

              {/* CTA Buttons */}
              <div className="flex items-center justify-center gap-3">
                {user ? (
                  <Link to="/dashboard">
                    <StarBorder as="div" color="#D97757" speed="6s" className="!rounded-full !px-8 !py-3 text-sm font-medium text-[#D97757]">
                      {t('home.goToDashboard')} →
                    </StarBorder>
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="px-8 py-3 rounded-full bg-[#D97757] text-white font-medium text-sm hover:bg-[#C4613F] transition-colors shadow-sm shadow-[#D97757]/20">
                      {t('home.getStarted')} →
                    </Link>
                    <Link to="/pricing" className="px-8 py-3 rounded-full border border-[#D9C5B2] text-[#6B5D4F] font-medium text-sm hover:border-[#D97757]/30 hover:bg-[#D97757]/5 transition-colors">
                      {t('home.viewPricing')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </FadeContent>

          {/* Stats */}
          <FadeContent blur duration={600} delay={300}>
            <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-20">
              <div className="text-center p-5 rounded-2xl bg-white/60 border border-[#E8DDD0] backdrop-blur-sm">
                <div className="text-3xl font-bold text-[#3D3024]">
                  <CountUp from={0} to={enabledModels.length || 50} duration={2} />+
                </div>
                <p className="text-sm text-[#8B7D6E] mt-1">{t('home.aiModels')}</p>
              </div>
              <div className="text-center p-5 rounded-2xl bg-white/60 border border-[#E8DDD0] backdrop-blur-sm">
                <div className="text-3xl font-bold text-[#3D3024]">
                  <CountUp from={0} to={99.9} duration={2.5} />%
                </div>
                <p className="text-sm text-[#8B7D6E] mt-1">{t('home.uptime')}</p>
              </div>
              <div className="text-center p-5 rounded-2xl bg-white/60 border border-[#E8DDD0] backdrop-blur-sm">
                <div className="text-3xl font-bold text-[#3D3024]">
                  &lt;<CountUp from={200} to={50} duration={2} direction="down" />ms
                </div>
                <p className="text-sm text-[#8B7D6E] mt-1">{t('home.latency')}</p>
              </div>
            </div>
          </FadeContent>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#F5EEE6] border-y border-[#E8DDD0]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <FadeContent blur duration={600} delay={100}>
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-[#3D3024] mb-3">{t('home.whyChooseUs')}</h2>
              <p className="text-[#6B5D4F]">{t('home.whyChooseUsDesc')}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <SpotlightCard className="!bg-white !rounded-2xl !p-0 !border-[#E8DDD0]" spotlightColor="rgba(217,119,87,0.08)">
                <div className="p-7">
                  <div className="w-12 h-12 rounded-xl bg-[#D97757]/10 flex items-center justify-center mb-5">
                    <svg className="w-6 h-6 text-[#D97757]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-[#3D3024] mb-2">{t('home.lightningFast')}</h3>
                  <p className="text-sm text-[#6B5D4F] leading-relaxed">{t('home.lightningFastDesc')}</p>
                </div>
              </SpotlightCard>

              <SpotlightCard className="!bg-white !rounded-2xl !p-0 !border-[#E8DDD0]" spotlightColor="rgba(168,82,50,0.06)">
                <div className="p-7">
                  <div className="w-12 h-12 rounded-xl bg-[#A85232]/10 flex items-center justify-center mb-5">
                    <svg className="w-6 h-6 text-[#A85232]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-[#3D3024] mb-2">{t('home.securePrivate')}</h3>
                  <p className="text-sm text-[#6B5D4F] leading-relaxed">{t('home.securePrivateDesc')}</p>
                </div>
              </SpotlightCard>

              <SpotlightCard className="!bg-white !rounded-2xl !p-0 !border-[#E8DDD0]" spotlightColor="rgba(196,97,63,0.06)">
                <div className="p-7">
                  <div className="w-12 h-12 rounded-xl bg-[#C4613F]/10 flex items-center justify-center mb-5">
                    <svg className="w-6 h-6 text-[#C4613F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-[#3D3024] mb-2">{t('home.payAsYouGo')}</h3>
                  <p className="text-sm text-[#6B5D4F] leading-relaxed">{t('home.payAsYouGoDesc')}</p>
                </div>
              </SpotlightCard>
            </div>
          </FadeContent>
        </div>
      </section>

      {/* Models */}
      {enabledModels.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20">
          <FadeContent blur duration={600} delay={100}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#3D3024] mb-3">{t('home.availableModels')}</h2>
              <p className="text-[#6B5D4F]">{t('home.availableModelsDesc', { count: enabledModels.length })}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {enabledModels.slice(0, 12).map((m, i) => (
                <div key={m.id || i} className="px-4 py-3 rounded-xl border border-[#E8DDD0] bg-white/60 flex items-center gap-3 hover:bg-[#D97757]/5 hover:border-[#D97757]/20 transition-colors group backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-[#D97757] flex-shrink-0" />
                  <span className="text-sm font-mono text-[#6B5D4F] group-hover:text-[#D97757] transition-colors truncate">
                    {m.display_name || m.model_name}
                  </span>
                </div>
              ))}
            </div>

            {enabledModels.length > 12 && (
              <div className="text-center mt-6">
                <Link to="/pricing" className="text-sm text-[#D97757] hover:text-[#C4613F] transition-colors font-medium">
                  {t('home.viewAllModels', { count: enabledModels.length })} →
                </Link>
              </div>
            )}
          </FadeContent>
        </section>
      )}

      {/* Packages */}
      {packages.length > 0 && (
        <section className="bg-[#F5EEE6] border-y border-[#E8DDD0]">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <FadeContent blur duration={600} delay={100}>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#3D3024] mb-3">{t('home.plansPackages')}</h2>
                <p className="text-[#6B5D4F]">{t('home.choosePlan')}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {packages.filter(p => p.enabled).slice(0, 3).map((pkg, i) => (
                  <SpotlightCard
                    key={pkg.id}
                    className={`!bg-white !rounded-2xl !p-0 !flex !flex-col ${
                      i === 1 ? '!border-[#D97757] !shadow-md !shadow-[#D97757]/10' : '!border-[#E8DDD0]'
                    }`}
                    spotlightColor={i === 1 ? 'rgba(217,119,87,0.1)' : 'rgba(217,119,87,0.04)'}
                  >
                    <div className="p-6 flex-1 flex flex-col">
                      {i === 1 && (
                        <span className="inline-flex items-center gap-1 text-xs text-[#D97757] font-semibold uppercase tracking-wider mb-2">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          Popular
                        </span>
                      )}
                      <h3 className="text-lg font-semibold text-[#3D3024] mb-1">{pkg.name}</h3>
                      {pkg.description && <p className="text-sm text-[#6B5D4F] mb-4">{pkg.description}</p>}
                      <div className="mt-auto pt-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-[#3D3024]">{cs}{pkg.price}</span>
                          {pkg.original_price > pkg.price && (
                            <span className="text-sm text-[#8B7D6E] line-through">{cs}{pkg.original_price}</span>
                          )}
                        </div>
                        {pkg.duration > 0 && <p className="text-xs text-[#8B7D6E] mt-1">{t('home.days', { count: pkg.duration })}</p>}
                      </div>
                      <Link to={user ? '/packages' : '/register'} className={`mt-4 py-2.5 rounded-full font-medium text-sm text-center transition-colors ${
                        i === 1
                          ? 'bg-[#D97757] text-white hover:bg-[#C4613F]'
                          : 'bg-[#F5EEE6] text-[#6B5D4F] hover:bg-[#E8DDD0]'
                      }`}>
                        {user ? t('home.subscribe') : t('home.getStarted')}
                      </Link>
                    </div>
                  </SpotlightCard>
                ))}
              </div>
            </FadeContent>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <FadeContent blur duration={600} delay={100}>
          <div className="bg-gradient-to-br from-[#D97757] to-[#A85232] rounded-3xl p-12 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_60%)]" />

            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-4">{t('home.readyToStart')}</h2>
              <p className="text-white/70 mb-8 max-w-md mx-auto">{t('home.readyToStartDesc')}</p>
              <div className="flex items-center justify-center gap-4">
                {user ? (
                  <Link to="/dashboard" className="px-8 py-3 rounded-full bg-white text-[#D97757] font-semibold text-sm hover:bg-[#FAF6F1] transition-colors shadow-sm">
                    {t('home.goToDashboard')}
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="px-8 py-3 rounded-full bg-white text-[#D97757] font-semibold text-sm hover:bg-[#FAF6F1] transition-colors shadow-sm">
                      {t('home.createFreeAccount')}
                    </Link>
                    <Link to="/login" className="px-8 py-3 rounded-full border border-white/30 text-white font-medium text-sm hover:bg-white/10 transition-colors">
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
