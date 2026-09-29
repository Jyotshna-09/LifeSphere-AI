import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Activity, Sun, Moon, Bell, ShieldCheck, UserCheck, 
  ChevronDown, CheckCircle, AlertCircle, LogOut 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, switchRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Academic Title */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400">
                  LifeSphere AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
                Unified Lifelong Health Ecosystem with Explainable AI
              </p>
            </div>
          </Link>
        </div>

        {/* Right Action Toolbar */}
        <div className="flex items-center gap-3">

          {/* Quick-Switch Demo Role Selector (Major Review Showcase Feature) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition-all shadow-sm"
              title="Click to instantly switch between demonstration accounts"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="capitalize">{user?.role || 'Guest'} Role</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-2 z-50">
                <div className="px-2 py-1 text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                  Demonstration Roles
                </div>
                <button
                  onClick={() => { switchRole('patient'); setShowRoleMenu(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    user?.role === 'patient' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Johnathan Doe (Patient)</span>
                  {user?.role === 'patient' && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                </button>
                <button
                  onClick={() => { switchRole('doctor'); setShowRoleMenu(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    user?.role === 'doctor' 
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Dr. Marcus Vance (Doctor)</span>
                  {user?.role === 'doctor' && <CheckCircle className="w-3.5 h-3.5 text-blue-500" />}
                </button>
                <button
                  onClick={() => { switchRole('admin'); setShowRoleMenu(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    user?.role === 'admin' 
                      ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-semibold' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>System Admin (Administrator)</span>
                  {user?.role === 'admin' && <CheckCircle className="w-3.5 h-3.5 text-purple-500" />}
                </button>
              </div>
            )}
          </div>

          {/* Health ID Badge */}
          {user?.health_id && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
              <span className="text-[10px] uppercase font-sans text-slate-400">Health ID:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{user.health_id}</span>
            </div>
          )}

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Light / Dark theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <img
              src={user?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
              alt={user?.full_name || "User"}
              className="w-8 h-8 rounded-full ring-2 ring-emerald-500/30 object-cover"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">
                {user?.full_name || "Johnathan Doe"}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                {user?.role} Account
              </p>
            </div>
            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors ml-1"
              title="Sign Out to Login Page"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
