import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, FileText, UploadCloud, Clock, 
  TrendingUp, Sparkles, BrainCircuit, History, 
  Lightbulb, KeyRound, ShieldAlert, Settings, 
  Users, Stethoscope, UserCheck, LogOut
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const role = user?.role || 'patient';

  const patientNav = [
    { label: 'Patient Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Medical Records', to: '/records', icon: FileText },
    { label: 'Upload Medical Report', to: '/upload', icon: UploadCloud },
    { label: 'Medical Timeline', to: '/timeline', icon: Clock },
    { label: 'Health Trends & Comparison', to: '/trends', icon: TrendingUp },
    { label: 'AI Health Summary', to: '/ai-summary', icon: Sparkles },
    { label: 'AI Risk Assessment (ML)', to: '/risk-assessment', icon: BrainCircuit },
    { label: 'Prediction History', to: '/predictions', icon: History },
    { label: 'AI & ML Insights', to: '/ml-insights', icon: Lightbulb },
    { label: 'Doctor Access & Consent', to: '/doctor-access', icon: KeyRound },
    { label: 'Audit Logs', to: '/audit-logs', icon: ShieldAlert },
    { label: 'Profile & Settings', to: '/settings', icon: Settings },
  ];

  const doctorNav = [
    { label: 'Authorized Patients', to: '/doctor/dashboard', icon: Users },
    { label: 'AI & ML Insights', to: '/ml-insights', icon: Lightbulb },
    { label: 'Clinical Audit Logs', to: '/audit-logs', icon: ShieldAlert },
    { label: 'Profile & Settings', to: '/settings', icon: Settings },
  ];

  const adminNav = [
    { label: 'System Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'AI & ML Insights', to: '/ml-insights', icon: Lightbulb },
    { label: 'Security & Audit Logs', to: '/audit-logs', icon: ShieldAlert },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  const currentNav = role === 'doctor' ? doctorNav : role === 'admin' ? adminNav : patientNav;

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block border-r border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md min-h-[calc(100vh-4rem)] p-4">
      
      {/* Role Badge */}
      <div className="mb-4 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Portal</p>
        <p className="text-sm font-semibold capitalize text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
          {role === 'doctor' ? <Stethoscope className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          {role} Workspace
        </p>
      </div>

      <nav className="space-y-1">
        {currentNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div className="pt-3">
        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all border border-slate-200 dark:border-slate-800"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Sign Out to Login</span>
        </button>
      </div>

      {/* Safety & Academic Footnote */}
      <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800/80 px-2">
        <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          LifeSphere AI Core
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Decision-support prototype powered by genuine Scikit-learn, XGBoost & SHAP mathematical explainability.
        </p>
      </div>

    </aside>
  );
};
