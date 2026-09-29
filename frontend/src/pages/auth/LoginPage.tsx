import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, ShieldCheck, UserCheck, Stethoscope, 
  Lock, ArrowRight, User, AlertCircle, CheckCircle2 
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [username, setUsername] = useState('patient');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setUsername('');
      setPassword('');
      // Clean up location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);

    try {
      const loggedUser = await login(trimmedUsername, password);

      if (loggedUser?.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (loggedUser?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (targetRole: 'patient' | 'doctor' | 'admin') => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      if (targetRole === 'doctor') {
        setUsername('doctor');
        setPassword('password123');
      } else if (targetRole === 'admin') {
        setUsername('admin');
        setPassword('password123');
      } else {
        setUsername('patient');
        setPassword('password123');
      }

      const u = await switchRole(targetRole);
      if (u?.role === 'doctor' || targetRole === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (u?.role === 'admin' || targetRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || "Failed to switch demo user.");
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

        {/* Quick Demo One-Click Access (Showcase Feature) */}
        <div className="p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-sm space-y-2.5">
          <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider text-center">
            One-Click Review Demo Login
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo('patient')}
              className="px-2 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-slate-800 transition-colors shadow-sm flex flex-col items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Patient
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo('doctor')}
              className="px-2 py-2 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-[11px] font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-800 transition-colors shadow-sm flex flex-col items-center gap-1"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Doctor
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo('admin')}
              className="px-2 py-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-slate-800 transition-colors shadow-sm flex flex-col items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>
        </div>

        {/* Auth Form Card */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Sign In with Password
            </h2>
            <button
              type="button"
              onClick={() => { setError(null); navigate('/register'); }}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              New patient? Register
            </button>
          </div>

          {successMessage && (
            <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
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

export default LoginPage;
