import React, { useState } from 'react';
import { apiService } from '../api/apiService';
import { LightBulbIcon, LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const data = await apiService.login(username, password);
      onLoginSuccess(data.token);
    } catch (err) {
      setError('Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl bg-white/90 backdrop-blur rounded-2xl shadow-xl ring-1 ring-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left: Brand + form */}
        <div className="p-8 sm:p-10">
          {/* Brand */}
          <div className="flex items-center gap-2 mb-8">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <LightBulbIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Innovation Workflow</h1>
              <p className="text-xs text-gray-500 -mt-0.5">Secure Sign‑in</p>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-gray-900">Welcome back</h2>
          <p className="mt-1 text-sm text-gray-600">Sign in to continue to your workspace.</p>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="username" className="text-sm font-medium text-gray-700">Username</label>
              <div className="mt-1 relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <UserIcon className="h-5 w-5" />
                </span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
                  placeholder="e.g., emetteurUser"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <LockClosedIcon className="h-5 w-5" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full rounded-md border-gray-300 pl-10 pr-10 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              )}
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Footer hint */}
          <p className="mt-6 text-xs text-gray-500">
            Tips: Use your assigned role credentials (e.g., <span className="font-medium">emetteurUser</span>).
          </p>
        </div>

        {/* Right: Accent panel (optional image/illustration) */}
        <div className="hidden md:block relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_45%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.08),transparent_50%)]" />
          <div className="relative h-full w-full flex items-end">
            <div className="p-8 text-indigo-50/90">
              <h3 className="text-lg font-semibold">Move ideas to impact</h3>
              <p className="text-sm mt-1 leading-relaxed">
                Track proposals, prioritize quickly, and drive POC → MVP → production — all in one place.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Small print */}
      <div className="absolute bottom-3 text-[11px] text-gray-400">
        © {new Date().getFullYear()} Innovation Workflow
      </div>
    </div>
  );
};
