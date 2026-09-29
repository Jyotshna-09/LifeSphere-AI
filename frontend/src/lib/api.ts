import { 
  User, MedicalRecord, HealthTrendData, AISummary, 
  PredictionResult, MLInsightsData, ConsentItem, AuditLogItem, 
  NotificationItem, MedicationInteractionItem, DuplicateTestAlertItem 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const LOCAL_ACCOUNTS_KEY = 'lifesphere_local_registered_accounts';
const LOCAL_SESSION_USER_KEY = 'lifesphere_local_session_user';

interface LocalStoredAccount {
  user: User;
  passwordHash: string;
}

async function hashLocalPassword(password: string): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const enc = new TextEncoder().encode(password);
      const buf = await crypto.subtle.digest('SHA-256', enc);
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    return 'h_' + btoa(password);
  } catch {
    return 'h_' + btoa(password);
  }
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    try {
      localStorage.removeItem('lifesphere_token');
    } catch {
      // ignore
    }
    this.token = sessionStorage.getItem('lifesphere_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      sessionStorage.setItem('lifesphere_token', token);
    } else {
      sessionStorage.removeItem('lifesphere_token');
      try {
        localStorage.removeItem('lifesphere_token');
      } catch {
        // ignore
      }
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMsg = `HTTP Error ${response.status}`;
        if (response.status === 502 || response.status === 503 || response.status === 504) {
          errorMsg = `Backend server unreachable (HTTP ${response.status}). Please make sure the FastAPI backend is running on http://localhost:8000.`;
        } else {
          try {
            const errorJson = await response.json();
            errorMsg = errorJson.detail || errorJson.message || errorMsg;
          } catch {
            // use fallback
          }
        }
        throw new Error(errorMsg);
      }

      return response.json();
    } catch (err: any) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        throw new Error('Cannot connect to LifeSphere backend. Please start the FastAPI backend on http://localhost:8000.');
      }
      throw err;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }

  // --- Auth ---
  async login(usernameOrEmail: string, password: string) {
    try {
      const data = await this.request<{ access_token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: usernameOrEmail, email: usernameOrEmail, password }),
      });
      this.setToken(data.access_token);
      sessionStorage.setItem(LOCAL_SESSION_USER_KEY, JSON.stringify(data.user));
      return data;
    } catch (err: any) {
      if (err.message && !err.message.includes('Cannot connect to LifeSphere backend') && !err.message.includes('HTTP Error 502') && !err.message.includes('HTTP Error 503') && !err.message.includes('HTTP Error 504')) {
        throw err;
      }
      // Persistent local development fallback
      const identifier = usernameOrEmail.trim().toLowerCase();
      const accounts: LocalStoredAccount[] = JSON.parse(localStorage.getItem(LOCAL_ACCOUNTS_KEY) || '[]');
      const inputHash = await hashLocalPassword(password);
      
      const found = accounts.find(a => 
        (a.user.username && a.user.username.toLowerCase() === identifier) ||
        (a.user.email && a.user.email.toLowerCase() === identifier)
      );

      if (found) {
        if (found.passwordHash === inputHash) {
          const mockToken = `local_token_${found.user.id}`;
          this.setToken(mockToken);
          sessionStorage.setItem(LOCAL_SESSION_USER_KEY, JSON.stringify(found.user));
          return { access_token: mockToken, user: found.user };
        } else {
          throw new Error('Invalid username or password.');
        }
      }

      // Check fallback demo accounts
      if (password === 'password123') {
        let demoUser: User | null = null;
        if (identifier === 'patient' || identifier === 'patient@lifesphere.ai') {
          demoUser = {
            id: 'a0000000-0000-0000-0000-000000000001',
            username: 'patient',
            email: 'patient@lifesphere.ai',
            full_name: 'Johnathan Doe',
            role: 'patient',
            health_id: 'LSP-928104',
            phone: '+1-555-123-4567',
            avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          };
        } else if (identifier === 'doctor' || identifier === 'dr.vance@lifesphere.ai') {
          demoUser = {
            id: 'b0000000-0000-0000-0000-000000000001',
            username: 'doctor',
            email: 'dr.vance@lifesphere.ai',
            full_name: 'Dr. Marcus Vance, MD, FACC',
            role: 'doctor',
            health_id: 'LSP-DOC-001',
            phone: '+1-555-888-0001',
            avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
          };
        } else if (identifier === 'admin' || identifier === 'admin@lifesphere.ai') {
          demoUser = {
            id: 'c0000000-0000-0000-0000-000000000001',
            username: 'admin',
            email: 'admin@lifesphere.ai',
            full_name: 'System Administrator',
            role: 'admin',
            health_id: 'LSP-ADM-001',
            phone: '+1-555-999-0000',
            avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
          };
        }
        if (demoUser) {
          const mockToken = `local_token_${demoUser.id}`;
          this.setToken(mockToken);
          sessionStorage.setItem(LOCAL_SESSION_USER_KEY, JSON.stringify(demoUser));
          return { access_token: mockToken, user: demoUser };
        }
      }

      throw new Error('Invalid username or password.');
    }
  }

  async register(formData: any) {
    const username = (formData.username || '').trim();
    const firstName = (formData.first_name || '').trim();
    const lastName = (formData.last_name || '').trim();
    const fullName = (formData.full_name || `${firstName} ${lastName}`).trim() || username;
    const password = formData.password || '';
    const confirmPassword = formData.confirm_password || '';

    if (!username) {
      throw new Error('Username is required.');
    }
    if (!password) {
      throw new Error('Password is required.');
    }
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const payload = {
      ...formData,
      username,
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      role: 'patient',
    };

    try {
      const data = await this.request<{ access_token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const accounts: LocalStoredAccount[] = JSON.parse(localStorage.getItem(LOCAL_ACCOUNTS_KEY) || '[]');
      const passwordHash = await hashLocalPassword(password);
      if (!accounts.some(a => a.user.username?.toLowerCase() === username.toLowerCase())) {
        accounts.push({ user: data.user, passwordHash });
        localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
      }
      this.setToken(data.access_token);
      sessionStorage.setItem(LOCAL_SESSION_USER_KEY, JSON.stringify(data.user));
      return data;
    } catch (err: any) {
      if (err.message && !err.message.includes('Cannot connect to LifeSphere backend') && !err.message.includes('HTTP Error 502') && !err.message.includes('HTTP Error 503') && !err.message.includes('HTTP Error 504')) {
        throw err;
      }
      // Persistent local fallback
      const accounts: LocalStoredAccount[] = JSON.parse(localStorage.getItem(LOCAL_ACCOUNTS_KEY) || '[]');
      if (
        accounts.some(a => a.user.username?.toLowerCase() === username.toLowerCase()) || 
        username.toLowerCase() === 'patient' || 
        username.toLowerCase() === 'doctor' || 
        username.toLowerCase() === 'admin'
      ) {
        throw new Error('Username already exists. Please choose a different username.');
      }
      const passwordHash = await hashLocalPassword(password);
      const newUser: User = {
        id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        username,
        email: `${username.toLowerCase()}@lifesphere.local`,
        full_name: fullName,
        role: 'patient',
        health_id: `LSP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      };
      accounts.push({ user: newUser, passwordHash });
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
      const mockToken = `local_token_${newUser.id}`;
      this.setToken(mockToken);
      sessionStorage.setItem(LOCAL_SESSION_USER_KEY, JSON.stringify(newUser));
      return { access_token: mockToken, user: newUser };
    }
  }

  async switchDemoUser(role: 'patient' | 'doctor' | 'admin') {
    try {
      const data = await this.request<{ access_token: string; user: User }>('/auth/switch-demo', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      this.setToken(data.access_token);
      sessionStorage.setItem(LOCAL_SESSION_USER_KEY, JSON.stringify(data.user));
      return data;
    } catch (err: any) {
      if (err.message && !err.message.includes('Cannot connect to LifeSphere backend') && !err.message.includes('HTTP Error 502') && !err.message.includes('HTTP Error 503') && !err.message.includes('HTTP Error 504')) {
        throw err;
      }
      let demoUser: User = {
        id: 'a0000000-0000-0000-0000-000000000001',
        username: 'patient',
        email: 'patient@lifesphere.ai',
        full_name: 'Johnathan Doe',
        role: 'patient',
        health_id: 'LSP-928104',
        phone: '+1-555-123-4567',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      };
      if (role === 'doctor') {
        demoUser = {
          id: 'b0000000-0000-0000-0000-000000000001',
          username: 'doctor',
          email: 'dr.vance@lifesphere.ai',
          full_name: 'Dr. Marcus Vance, MD, FACC',
          role: 'doctor',
          health_id: 'LSP-DOC-001',
          phone: '+1-555-888-0001',
          avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
        };
      } else if (role === 'admin') {
        demoUser = {
          id: 'c0000000-0000-0000-0000-000000000001',
          username: 'admin',
          email: 'admin@lifesphere.ai',
          full_name: 'System Administrator',
          role: 'admin',
          health_id: 'LSP-ADM-001',
          phone: '+1-555-999-0000',
          avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
        };
      }
      const mockToken = `local_token_${demoUser.id}`;
      this.setToken(mockToken);
      sessionStorage.setItem(LOCAL_SESSION_USER_KEY, JSON.stringify(demoUser));
      return { access_token: mockToken, user: demoUser };
    }
  }

  async getMe(): Promise<User> {
    try {
      const u = await this.request<User>('/auth/me');
      sessionStorage.setItem(LOCAL_SESSION_USER_KEY, JSON.stringify(u));
      return u;
    } catch (err: any) {
      const cached = sessionStorage.getItem(LOCAL_SESSION_USER_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
      throw err;
    }
  }

  logout() {
    this.setToken(null);
    sessionStorage.removeItem(LOCAL_SESSION_USER_KEY);
  }

  // --- Medical Records ---
  async getMedicalRecords(recordType?: string, search?: string, patientId?: string): Promise<MedicalRecord[]> {
    const params = new URLSearchParams();
    if (recordType && recordType !== 'All') params.append('record_type', recordType);
    if (search) params.append('search', search);
    if (patientId) params.append('patient_id', patientId);
    return this.request<MedicalRecord[]>(`/medical-records?${params.toString()}`);
  }

  async createMedicalRecord(data: Partial<MedicalRecord>): Promise<MedicalRecord> {
    return this.request<MedicalRecord>('/medical-records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteMedicalRecord(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/medical-records/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Documents & PyMuPDF ---
  async uploadDocument(formData: FormData) {
    return this.request<{
      success: boolean;
      is_medical_document?: boolean;
      message?: string;
      document_id: string;
      record_id: string;
      file_name: string;
      extracted_text_preview: string;
      analysis: any;
    }>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }

  // --- Timeline ---
  async getTimeline(year?: number, recordType?: string, patientId?: string) {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (recordType && recordType !== 'All') params.append('record_type', recordType);
    if (patientId) params.append('patient_id', patientId);
    return this.request<{
      years_available: number[];
      selected_year?: number;
      total_events: number;
      events: any[];
    }>(`/timeline?${params.toString()}`);
  }

  // --- Health Trends ---
  async getHealthTrends(timeRange: string = 'all', patientId?: string): Promise<HealthTrendData> {
    const params = new URLSearchParams({ time_range: timeRange });
    if (patientId) params.append('patient_id', patientId);
    return this.request<HealthTrendData>(`/health-trends?${params.toString()}`);
  }

  async addHealthMetric(data: { metric_type: string; value_primary: number; value_secondary?: number; unit: string; notes?: string }) {
    return this.request('/health-metrics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- AI Health Summary ---
  async getAISummary(patientId?: string): Promise<AISummary> {
    const params = new URLSearchParams();
    if (patientId) params.append('patient_id', patientId);
    return this.request<AISummary>(`/ai/summary?${params.toString()}`);
  }

  // --- ML & Real SHAP ---
  async predictRisk(payload: {
    model_name: string;
    Glucose: number;
    BMI: number;
    Age: number;
    BloodPressure: number;
    Insulin: number;
    Pregnancies: number;
    DiabetesPedigreeFunction: number;
    SkinThickness: number;
  }): Promise<PredictionResult> {
    return this.request<PredictionResult>('/ml/predict', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getPredictionHistory(patientId?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (patientId) params.append('patient_id', patientId);
    return this.request<any[]>(`/ml/predictions?${params.toString()}`);
  }

  async getPredictionDetail(predictionId: string): Promise<any> {
    return this.request<any>(`/ml/predictions/${predictionId}`);
  }

  async getMLInsights(): Promise<MLInsightsData> {
    return this.request<MLInsightsData>('/ml/insights');
  }

  // --- Consent & Access ---
  async getConsents(): Promise<ConsentItem[]> {
    return this.request<ConsentItem[]>('/consents');
  }

  async grantDoctorAccess(doctorId: string, permissions?: Record<string, boolean>) {
    return this.request<{ success: boolean; message: string; consent_id: string }>('/consents/grant', {
      method: 'POST',
      body: JSON.stringify({ doctor_id: doctorId, permissions }),
    });
  }

  async revokeDoctorAccess(consentId: string) {
    return this.request<{ success: boolean; message: string }>(`/consents/${consentId}/revoke`, {
      method: 'POST',
    });
  }

  // --- Doctor View ---
  async getDoctorPatients(search?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    return this.request<any[]>(`/doctor/patients?${params.toString()}`);
  }

  async getDoctorPatientDetail(patientId: string) {
    return this.request<any>(`/doctor/patients/${patientId}`);
  }

  // --- Clinical Safety ---
  async getMedicationInteractions(patientId?: string): Promise<MedicationInteractionItem[]> {
    const params = new URLSearchParams();
    if (patientId) params.append('patient_id', patientId);
    return this.request<MedicationInteractionItem[]>(`/safety/medication-interactions?${params.toString()}`);
  }

  async getDuplicateTests(patientId?: string): Promise<DuplicateTestAlertItem[]> {
    const params = new URLSearchParams();
    if (patientId) params.append('patient_id', patientId);
    return this.request<DuplicateTestAlertItem[]>(`/safety/duplicate-tests?${params.toString()}`);
  }

  // --- Audit Logs ---
  async getAuditLogs(limit: number = 50): Promise<AuditLogItem[]> {
    return this.request<AuditLogItem[]>(`/audit-logs?limit=${limit}`);
  }

  // --- Notifications ---
  async getNotifications(): Promise<NotificationItem[]> {
    return this.request<NotificationItem[]>('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'POST',
    });
  }

  // --- Admin ---
  async getAdminOverview() {
    return this.request<any>('/admin/overview');
  }
}

export const api = new ApiClient();
