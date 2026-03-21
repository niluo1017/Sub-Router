import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import LanguageSwitch from '../../components/LanguageSwitch';

export default function StarterLayout() {
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
    <div className="min-h-screen flex flex-col">
      {/* Announcement Banner */}
      {site?.announcement && (
        <div className="bg-brand-600/20 border-b border-brand-500/20 text-center py-2 px-4">
          <p className="text-sm text-brand-200">{site.announcement}</p>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            {site?.logo ? (
              <img src={site.logo} alt={siteName} className="h-8 w-auto" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {siteName.charAt(0)}
              </div>
            )}
            <span className="text-lg font-semibold text-white group-hover:text-brand-400 transition-colors">
              {siteName}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleNavItems.map((n) => (
              <NavLink key={n.to} to={n.to} active={location.pathname === n.to}>
                {n.label}
              </NavLink>
            ))}
          </nav>

          {/* Auth + Lang + Mobile toggle */}
          <div className="flex items-center gap-2">
            <LanguageSwitch className="text-neutral-400 hover:text-white hover:bg-white/5" />

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
                <Link to="/register" className="btn-primary text-sm !px-4 !py-1.5">
                  {t('nav.signUp')}
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
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

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.06] bg-black/90 backdrop-blur-xl">
            <nav className="max-w-7xl mx-auto px-6 py-3 flex flex-col gap-1">
              {visibleNavItems.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    location.pathname === n.to
                      ? 'text-brand-400 bg-brand-500/10'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {n.label}
                </Link>
              ))}
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors sm:hidden"
                >
                  {t('nav.login')}
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} {siteName}.
          </p>
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

function NavLink({ to, children, active }) {
  return (
    <Link
      to={to}
      className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
        active
          ? 'text-brand-400 bg-brand-500/10'
          : 'text-neutral-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {children}
    </Link>
  );
}
