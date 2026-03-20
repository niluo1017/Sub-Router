import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tokens = lazy(() => import('./pages/Tokens'));
const Packages = lazy(() => import('./pages/Packages'));
const Pricing = lazy(() => import('./pages/Pricing'));

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public pages with layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected pages */}
          <Route element={<AuthGuard />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tokens" element={<Tokens />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
