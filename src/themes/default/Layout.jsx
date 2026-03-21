import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';

export default function DefaultLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { site } = useSite();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const siteName = site?.name || 'AI Platform';

  const navItems = [
    { to: '/', label: t('nav.home'), auth: false },
    { to: '/pricing', label: t('nav.pricing'), auth: false },
    { to: '/packages', label: t('nav.packages'), auth: false },
    { to: '/dashboard', label: t('nav.dashboard'), auth: true },
    { to: '/tokens', label: t('nav.apiKeys'), auth: true },
  ];

  const visibleNavItems = navItems.filter((n) => !n.auth || user);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a1a]">
      {/* Announcement Banner */}
      {site?.announcement && (
        <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border-b border-white/10 text-center py-2.5 px-4">
          <p className="text-sm text-neutral-200">{site.announcement}</p>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0a0a1a]/80 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            {site?.logo ? (
              <img src={site.logo} alt={siteName} className="h-8 w-auto" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/20">
                {siteName.charAt(0)}
              </div>
            )}
            <span className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
              {siteName}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 rounded-full px-2 py-1">
            {visibleNavItems.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`px-4 py-1.5 text-sm rounded-full transition-all ${
                  location.pathname === n.to
                    ? 'text-white bg-white/10'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Auth + Mobile toggle */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-neutral-400 hidden sm:block">
                  {user.display_name || user.username}
                </span>
                <button
                  onClick={async () => { await logout(); navigate('/'); }}
                  className="text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm text-neutral-300 hover:text-white transition-colors px-3 py-1.5 hidden sm:block">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="px-5 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-100 transition-all">
                  {t('nav.signUp')}
                </Link>
              </>
            )}

            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.08] bg-[#0a0a1a]/95 backdrop-blur-2xl">
            <nav className="max-w-7xl mx-auto px-6 py-3 flex flex-col gap-1">
              {visibleNavItems.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    location.pathname === n.to
                      ? 'text-blue-400 bg-blue-500/10'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-white/[0.08] mt-auto bg-[#0a0a1a]">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">&copy; {new Date().getFullYear()} {siteName}.</p>
          <div className="flex items-center gap-4">
            {site?.contact_email && (
              <a href={`mailto:${site.contact_email}`} className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
                {t('nav.contact')}
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
