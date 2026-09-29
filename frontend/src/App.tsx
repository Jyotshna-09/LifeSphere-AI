import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { MedicalRecordsPage } from './pages/patient/MedicalRecordsPage';
import { DocumentUploadPage } from './pages/patient/DocumentUploadPage';
import { MedicalTimelinePage } from './pages/patient/MedicalTimelinePage';
import { HealthTrendsPage } from './pages/patient/HealthTrendsPage';
import { AIHealthSummaryPage } from './pages/patient/AIHealthSummaryPage';
import { AIRiskAssessmentPage } from './pages/ml/AIRiskAssessmentPage';
import { PredictionHistoryPage } from './pages/ml/PredictionHistoryPage';
import { MLInsightsPage } from './pages/ml/MLInsightsPage';
import { DoctorAccessPage } from './pages/consent/DoctorAccessPage';
import { DoctorDashboardPage } from './pages/doctor/DoctorDashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AuditLogsPage } from './pages/audit/AuditLogsPage';
import { SettingsPage } from './pages/settings/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090d16] text-xs font-semibold text-slate-400">
        Authenticating LifeSphere session...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const RoleDashboardDispatcher: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'doctor') {
    return <Navigate to="/doctor/dashboard" replace />;
  }
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <PatientDashboard />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<RoleDashboardDispatcher />} />
              <Route path="dashboard" element={<RoleDashboardDispatcher />} />
              <Route path="records" element={<MedicalRecordsPage />} />
              <Route path="upload" element={<DocumentUploadPage />} />
              <Route path="timeline" element={<MedicalTimelinePage />} />
              <Route path="trends" element={<HealthTrendsPage />} />
              <Route path="ai-summary" element={<AIHealthSummaryPage />} />
              <Route path="risk-assessment" element={<AIRiskAssessmentPage />} />
              <Route path="predictions" element={<PredictionHistoryPage />} />
              <Route path="ml-insights" element={<MLInsightsPage />} />
              <Route path="doctor-access" element={<DoctorAccessPage />} />
              <Route path="doctor/dashboard" element={<DoctorDashboardPage />} />
              <Route path="admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
