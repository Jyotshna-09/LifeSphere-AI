import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Settings, User, Shield, Moon, Sun, Heart, 
  Phone, Mail, Calendar, Key, AlertCircle, CheckCircle2 
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-emerald-500" />
          Account Profile & System Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your sovereign personal health record information, contact details, and display preferences.
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
            alt="Avatar"
            className="w-16 h-16 rounded-2xl ring-2 ring-emerald-500/40 object-cover"
          />
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {user?.full_name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {user?.role} Account
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                Health ID: {user?.health_id}
              </span>
            </div>
          </div>
        </div>

        {/* Personal Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Email Address</span>
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.email}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Phone Number</span>
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.phone || '+1-555-123-4567'}</span>
            </div>
          </div>

          {user?.patient_details?.dob && (
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Date of Birth</span>
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.patient_details.dob}</span>
              </div>
            </div>
          )}

          {user?.patient_details?.gender && (
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Gender</span>
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.patient_details.gender}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Health Profile Information */}
      {user?.patient_details && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Clinical Health Profile & Emergency Contact
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Blood Group</span>
              <p className="text-sm font-bold text-red-600 dark:text-red-400 mt-0.5">
                {user.patient_details.blood_group || 'O+'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Emergency Contact</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {user.patient_details.emergency_contact_name || 'Jane Doe (Spouse)'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {user.patient_details.emergency_contact_phone || '+1-555-123-9999'}
              </p>
            </div>

            <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Documented Allergies</span>
              <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                {user.patient_details.allergies_summary || 'Penicillin (Severe Hives)'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Theme & Display Preferences */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
          Appearance & Theme
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Interface Color Mode
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Currently active: <span className="capitalize font-bold text-emerald-500">{theme} Mode</span>
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-all"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                Switch to Light Mode
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                Switch to Dark Mode
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
