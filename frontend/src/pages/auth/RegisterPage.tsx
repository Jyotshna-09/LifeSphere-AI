import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedUsername = username.trim();

    // 1. All fields are required
    if (!trimmedFirstName) {
      setError('First name is required.');
      return;
    }
    if (!trimmedLastName) {
      setError('Last name is required.');
      return;
    }
    if (!trimmedUsername) {
      setError('Username is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (!confirmPassword) {
      setError('Please confirm your password.');
      return;
    }

    // 2. Password and Confirm Password must match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await api.register({
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
        username: trimmedUsername,
        password,
        confirm_password: confirmPassword,
        role: 'patient',
      });

      // Clear password states
      setPassword('');
      setConfirmPassword('');

      // Redirect to login page with success message
      navigate('/login', {
        state: { successMessage: 'Account created successfully. Please sign in.' },
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400">
            LifeSphere AI
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Your Lifelong Health Companion
          </p>
        </div>

        {/* Registration Form Card */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Create Patient Account
            </h2>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Already registered? Sign in
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  First Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jyotshna"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kadambala"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Username *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. jyotshna123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Security / Academic Notice */}
        <p className="text-[11px] text-center text-slate-400 leading-relaxed max-w-sm mx-auto">
          LifeSphere AI strictly safeguards patient records via RBAC and Sovereign Consent. 
          No email verification required for academic demonstration.
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;
