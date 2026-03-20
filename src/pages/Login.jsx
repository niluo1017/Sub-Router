import React, { useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, user } = useAuth();
  const { site } = useSite();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect via component (not navigate in render)
  if (user) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const result = await login(form.username, form.password);
      if (result.success) {
        toast.success('Welcome back!');
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
        return; // component may unmount — skip setLoading
      }
      // error toast is handled by api interceptor for success:false
    } catch (err) {
      // Network error handled by interceptor
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-heading font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-sm text-neutral-400">
              Sign in to {site?.name || 'your account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="input"
                placeholder="Enter your username"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
