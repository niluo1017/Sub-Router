import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { getSiteModels, getSitePackages } from '../api';
import GradientText from '../components/bits/GradientText';
import BlurText from '../components/bits/BlurText';
import SpotlightCard from '../components/bits/SpotlightCard';
import CountUp from '../components/bits/CountUp';
import StarBorder from '../components/bits/StarBorder';
import ShinyText from '../components/bits/ShinyText';

export default function Home() {
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
      {/* Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-brand-600/20 via-purple-600/5 to-transparent blur-3xl" />
        <div className="absolute top-[400px] right-0 w-[500px] h-[500px] bg-gradient-radial from-pink-600/10 to-transparent blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-6">
            <GradientText
              colors={['#818cf8', '#c084fc', '#f472b6', '#818cf8']}
              animationSpeed={6}
              className="text-5xl md:text-7xl font-heading font-extrabold leading-tight"
            >
              {site?.name || 'AI API Platform'}
            </GradientText>
          </div>

          <BlurText
            text="Access the world's most powerful AI models through a single API endpoint. Simple, affordable, reliable."
            className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10"
            delay={50}
            animateBy="words"
          />

          <div className="flex items-center justify-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <StarBorder as="div" color="#818cf8" speed="5s">
                  Go to Dashboard
                </StarBorder>
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base !px-8 !py-3">
                  Get Started Free
                </Link>
                <Link to="/pricing" className="btn-secondary text-base !px-8 !py-3">
                  View Pricing
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto mt-20">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              <CountUp from={0} to={enabledModels.length || 50} duration={2} separator="" />+
            </div>
            <p className="text-sm text-neutral-500 mt-1">AI Models</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              <CountUp from={0} to={99.9} duration={2.5} />%
            </div>
            <p className="text-sm text-neutral-500 mt-1">Uptime</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              &lt;<CountUp from={200} to={50} duration={2} direction="down" />ms
            </div>
            <p className="text-sm text-neutral-500 mt-1">Latency</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-white mb-3">Why Choose Us</h2>
          <p className="text-neutral-400">Everything you need to build AI-powered applications</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <SpotlightCard className="!bg-neutral-900/60 !border-neutral-800/60" spotlightColor="rgba(129,140,248,0.15)">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Optimized routing and caching deliver responses with minimal latency. Load-balanced across multiple providers for maximum reliability.
            </p>
          </SpotlightCard>

          <SpotlightCard className="!bg-neutral-900/60 !border-neutral-800/60" spotlightColor="rgba(192,132,252,0.15)">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure & Private</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Enterprise-grade security with encrypted API keys. No request logging by default. Your data stays your data.
            </p>
          </SpotlightCard>

          <SpotlightCard className="!bg-neutral-900/60 !border-neutral-800/60" spotlightColor="rgba(244,114,182,0.15)">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Pay As You Go</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Transparent pricing with no hidden fees. Only pay for what you use. Multiple top-up options and subscription packages available.
            </p>
          </SpotlightCard>
        </div>
      </section>

      {/* Models Preview */}
      {enabledModels.length > 0 && (
        <section className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-white mb-3">Available Models</h2>
            <p className="text-neutral-400">
              Access <span className="text-brand-400 font-medium">{enabledModels.length}</span> AI models through a unified API
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {enabledModels.slice(0, 12).map((m, i) => (
              <div
                key={m.id || i}
                className="glass-sm px-4 py-3 flex items-center gap-3 hover:bg-white/[0.06] transition-colors group"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                <span className="text-sm font-mono text-neutral-300 group-hover:text-white transition-colors truncate">
                  {m.display_name || m.model_name}
                </span>
              </div>
            ))}
          </div>

          {enabledModels.length > 12 && (
            <div className="text-center mt-6">
              <Link to="/pricing" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
                View all {enabledModels.length} models &rarr;
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Packages Preview */}
      {packages.length > 0 && (
        <section className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-white mb-3">Plans & Packages</h2>
            <p className="text-neutral-400">Choose a plan that fits your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {packages.filter(p => p.enabled).slice(0, 3).map((pkg) => (
              <div key={pkg.id} className="glass rounded-2xl p-6 flex flex-col hover:border-brand-500/30 transition-colors">
                <h3 className="text-lg font-semibold text-white mb-1">{pkg.name}</h3>
                {pkg.description && (
                  <p className="text-sm text-neutral-400 mb-4">{pkg.description}</p>
                )}
                <div className="mt-auto pt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">${pkg.price}</span>
                    {pkg.original_price > pkg.price && (
                      <span className="text-sm text-neutral-500 line-through">${pkg.original_price}</span>
                    )}
                  </div>
                  {pkg.duration > 0 && (
                    <p className="text-xs text-neutral-500 mt-1">{pkg.duration} days</p>
                  )}
                </div>
                <Link
                  to={user ? '/packages' : '/register'}
                  className="btn-primary text-center mt-4 !py-2"
                >
                  {user ? 'Subscribe' : 'Get Started'}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="glass rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 via-transparent to-purple-600/10" />
          <div className="relative z-10">
            <h2 className="text-3xl font-heading font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-neutral-400 mb-8 max-w-md mx-auto">
              Create your account and start building with AI in minutes. No credit card required.
            </p>
            <div className="flex items-center justify-center gap-4">
              {user ? (
                <Link to="/dashboard" className="btn-primary text-base !px-8 !py-3">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-base !px-8 !py-3">
                    Create Free Account
                  </Link>
                  <Link to="/login" className="btn-secondary text-base !px-8 !py-3">
                    Sign In
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
