import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register, user } = useAuth();
  const { site } = useSite();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', password2: '', email: '' });
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect via component
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.password !== form.password2) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be 8-20 characters');
      return;
    }
    if (form.password.length > 20) {
      toast.error('Password must be 8-20 characters');
      return;
    }
    setLoading(true);
    try {
      const result = await register({
        username: form.username,
        password: form.password,
        email: form.email || undefined,
      });
      if (result.success) {
        toast.success('Account created! Please sign in.');
        navigate('/login', { replace: true });
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
            <h1 className="text-2xl font-heading font-bold text-white mb-2">Create Account</h1>
            <p className="text-sm text-neutral-400">
              Get started with {site?.name || 'our platform'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Username *</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="input"
                placeholder="Choose a username"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder="your@email.com (optional)"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Password *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input"
                placeholder="8-20 characters"
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Confirm Password *</label>
              <input
                type="password"
                value={form.password2}
                onChange={(e) => setForm({ ...form, password2: e.target.value })}
                className="input"
                placeholder="Repeat your password"
                autoComplete="new-password"
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
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-400">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
